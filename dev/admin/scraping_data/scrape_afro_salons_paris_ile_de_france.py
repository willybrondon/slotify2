"""
Skedisy Afro salon scraper — Paris & Île-de-France (centre-per-department + large radius).

Same *flow* as scrape_ile_de_france.py (one centre per département, ~50 km radius),
with Afro-focused data like scrape_afro_salons_ile_de_france.py:
  - Pagination, place details (rating, types, business_status)
  - Prefer less visible salons (lower Google review counts)
  - Backend-shaped JSON: serviceIds from scraping_services_config.json, 1–2 experts per salon

Also known as: scraping_afro_salons_paris_ile_de_france (requested name; Île spelled with capital I).

Run:  python scrape_afro_salons_paris_ile_de_france.py
Import: node import_to_skedisy.js salons_afro_paris_ile_de_france_<timestamp>.json
"""

import csv
import json
import os
import time
from datetime import datetime

from scrape_afro_salons_ile_de_france import (
    AFRO_SALON_KEYWORDS,
    GOOGLE_PLACES_API_KEY,
    GooglePlacesScraper,
    INITIAL_MAX_USER_RATINGS_TOTAL,
    MAX_RELAXED_USER_RATINGS_TOTAL,
    SkedisySalonFormatter,
    TARGET_SALON_COUNT,
    load_services_config,
    select_salons_by_popularity,
)

# Same department centres as scrape_ile_de_france.py (Paris + petite couronne + grande couronne)
ILE_DE_FRANCE_DEPARTMENTS = {
    "75": {"name": "Paris", "centre": {"lat": 48.8566, "lng": 2.3522}},
    "77": {"name": "Seine-et-Marne", "centre": {"lat": 48.6289, "lng": 2.7389}},
    "78": {"name": "Yvelines", "centre": {"lat": 48.8014, "lng": 2.1301}},
    "91": {"name": "Essonne", "centre": {"lat": 48.5293, "lng": 2.2386}},
    "92": {"name": "Hauts-de-Seine", "centre": {"lat": 48.8444, "lng": 2.2067}},
    "93": {"name": "Seine-Saint-Denis", "centre": {"lat": 48.9352, "lng": 2.3530}},
    "94": {"name": "Val-de-Marne", "centre": {"lat": 48.7872, "lng": 2.4033}},
    "95": {"name": "Val-d'Oise", "centre": {"lat": 49.0928, "lng": 2.0400}},
}

# Match scrape_ile_de_france.py (50 km)
CENTRE_RADIUS_METERS = 50000

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "AIzaSyBRPBAMyYhXs12DKij8ew7c8NowhrGzjNQ")

def main():
    print("=" * 60)
    print("Skedisy Afro salons — Paris & Île-de-France (centre + 50 km, like scrape_ile_de_france)")
    print(f"Target after popularity filter: {TARGET_SALON_COUNT} salons")
    print("=" * 60)

    if not GOOGLE_PLACES_API_KEY:
        print("❌ Google Places API key not found! Set GOOGLE_PLACES_API_KEY in .env")
        return

    services_config = load_services_config()
    if not any(services_config.get(k) for k in ("women", "men", "mixed")):
        print(
            "⚠️  No scraping_services_config.json (or empty pools). "
            "Copy scraping_services_config.example.json → scraping_services_config.json with Service ObjectIds."
        )

    gp_scraper = GooglePlacesScraper(GOOGLE_PLACES_API_KEY)
    print("✅ Google Places scraper initialized")
    print(f"📋 {len(AFRO_SALON_KEYWORDS)} Afro-focused keywords · radius {CENTRE_RADIUS_METERS} m per department centre")

    all_salons = []

    for dept_code, dept_info in ILE_DE_FRANCE_DEPARTMENTS.items():
        print(f"\n{'=' * 60}")
        print(f"Processing {dept_info['name']} ({dept_code})")
        print(f"{'=' * 60}")

        c = dept_info["centre"]
        salons = gp_scraper.scrape_department_centre(
            dept_code,
            dept_info["name"],
            c["lat"],
            c["lng"],
            AFRO_SALON_KEYWORDS,
            radius_m=CENTRE_RADIUS_METERS,
        )
        all_salons.extend(salons)

        print(f"\n📊 Total raw salons so far: {len(all_salons)}")

        if len(all_salons) >= TARGET_SALON_COUNT * 5:
            print(f"\n🎯 Enough raw candidates ({len(all_salons)}). Stopping early before next departments.")
            break

        time.sleep(1)

    print(f"\n{'=' * 60}")
    print("Removing duplicates (name + address + city)...")
    seen = set()
    unique_salons = []
    for salon in all_salons:
        key = (
            salon.get("name", "").lower().strip(),
            salon.get("addressDetails", {}).get("addressLine1", "").lower().strip(),
            salon.get("addressDetails", {}).get("city", "").lower().strip(),
        )
        if key not in seen and key[0]:
            seen.add(key)
            unique_salons.append(salon)

    print(f"Total raw rows: {len(all_salons)} · Unique: {len(unique_salons)}")

    ranked, effective_max = select_salons_by_popularity(
        unique_salons,
        TARGET_SALON_COUNT,
        INITIAL_MAX_USER_RATINGS_TOTAL,
        MAX_RELAXED_USER_RATINGS_TOTAL,
    )
    print(
        f"\n📉 Popularity filter (prefer fewer Google reviews): "
        f"effective max user_ratings_total ≈ {effective_max}"
    )
    print(f"   → Exporting {len(ranked)} salons (cap {TARGET_SALON_COUNT})")

    if len(ranked) < TARGET_SALON_COUNT:
        print(f"\n⚠️  Only {len(ranked)} salons after filtering. Try scrape_afro_salons_ile_de_france.py (multi-point) for denser coverage.")

    print("\nFormatting for Skedisy (experts + serviceIds)...")
    formatter = SkedisySalonFormatter()
    skedisy_salons = [formatter.format_for_skedisy(s, services_config) for s in ranked]

    script_dir = os.path.dirname(os.path.abspath(__file__))
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_file = os.path.join(script_dir, f"salons_afro_paris_ile_de_france_{timestamp}.json")
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(skedisy_salons, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON: {json_file}")

    csv_file = os.path.join(script_dir, f"salons_afro_paris_ile_de_france_{timestamp}.csv")
    if skedisy_salons:
        fieldnames = [
            "name",
            "email",
            "mobile",
            "addressLine1",
            "city",
            "latitude",
            "longitude",
            "source",
            "isClaimed",
            "department",
            "user_ratings_total",
            "gender_target",
        ]
        with open(csv_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for salon in skedisy_salons:
                meta = salon.get("metadata") or {}
                writer.writerow({
                    "name": salon.get("name", ""),
                    "email": salon.get("email", ""),
                    "mobile": salon.get("mobile", ""),
                    "addressLine1": salon.get("addressDetails", {}).get("addressLine1", ""),
                    "city": salon.get("addressDetails", {}).get("city", ""),
                    "latitude": salon.get("locationCoordinates", {}).get("latitude", ""),
                    "longitude": salon.get("locationCoordinates", {}).get("longitude", ""),
                    "source": salon.get("source", ""),
                    "isClaimed": salon.get("isClaimed", False),
                    "department": meta.get("department", ""),
                    "user_ratings_total": meta.get("user_ratings_total", ""),
                    "gender_target": meta.get("gender_target", ""),
                })
        print(f"✅ CSV:  {csv_file}")

    print(f"\n{'=' * 60}")
    print("Next: review CSV, then: node import_to_skedisy.js <json_file>")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
