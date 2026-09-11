"""
Mass extract Afro/Black salons in Ile-de-France via Places API Legacy.
Target: up to 5000 unique places with full schema + avis / avis_negatifs.

Resumes from extract_afro_avis_idf/_checkpoint.json.
Env: GOOGLE_PLACES_API_KEY in scraping_data/.env
"""

from __future__ import annotations

import json
import os
import re
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set, Tuple

import requests
from dotenv import load_dotenv

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(SCRIPT_DIR, ".env"), override=True)

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
OUT_DIR = os.path.join(SCRIPT_DIR, "extract_afro_avis_idf")
CHECKPOINT = os.path.join(OUT_DIR, "_checkpoint.json")
TARGET = int(os.getenv("EXTRACT_TARGET", "5000"))
PAUSE = float(os.getenv("EXTRACT_PAUSE", "0.28"))
PAGE_PAUSE = 2.0
SHARD_SIZE = 500
NEG_MAX = 3

BASE = "https://maps.googleapis.com/maps/api/place"

# Dense grid across IDF
SEARCH_POINTS: List[Dict[str, Any]] = []


def _add_point(name: str, lat: float, lng: float) -> None:
    SEARCH_POINTS.append({"name": name, "lat": lat, "lng": lng})


# Paris ~arrondissements + zones
for arr, lat, lng in [
    ("Paris-1-4", 48.8600, 2.3500),
    ("Paris-5-6", 48.8460, 2.3400),
    ("Paris-7", 48.8560, 2.3100),
    ("Paris-8", 48.8740, 2.3100),
    ("Paris-9", 48.8770, 2.3370),
    ("Paris-10", 48.8760, 2.3610),
    ("Paris-11", 48.8590, 2.3800),
    ("Paris-12", 48.8410, 2.3880),
    ("Paris-13", 48.8280, 2.3620),
    ("Paris-14", 48.8330, 2.3270),
    ("Paris-15", 48.8420, 2.2930),
    ("Paris-16", 48.8630, 2.2760),
    ("Paris-17", 48.8870, 2.3070),
    ("Paris-18", 48.8920, 2.3440),
    ("Paris-19", 48.8820, 2.3820),
    ("Paris-20", 48.8650, 2.3990),
]:
    _add_point(arr, lat, lng)

# Banlieue dense
for name, lat, lng in [
    ("Saint-Denis", 48.9360, 2.3570),
    ("Aubervilliers", 48.9140, 2.3830),
    ("Bobigny", 48.9080, 2.4390),
    ("Montreuil", 48.8630, 2.4430),
    ("Pantin", 48.8940, 2.4090),
    ("Bondy", 48.9020, 2.4830),
    ("Aulnay", 48.9380, 2.4940),
    ("Sevran", 48.9380, 2.5270),
    ("Livry", 48.9200, 2.5100),
    ("Noisy-le-Sec", 48.8900, 2.4600),
    ("Noisy-le-Grand", 48.8490, 2.5520),
    ("Épinay", 48.9550, 2.3150),
    ("Stains", 48.9570, 2.3830),
    ("La Courneuve", 48.9310, 2.3970),
    ("Drancy", 48.9230, 2.4450),
    ("Créteil", 48.7900, 2.4550),
    ("Vitry", 48.7870, 2.4030),
    ("Champigny", 48.8170, 2.5150),
    ("Ivry", 48.8130, 2.3880),
    ("Villejuif", 48.7920, 2.3630),
    ("Fontenay", 48.8510, 2.4740),
    ("Nogent", 48.8370, 2.4830),
    ("Alfortville", 48.8050, 2.4200),
    ("Maisons-Alfort", 48.8060, 2.4380),
    ("Choisy", 48.7650, 2.4090),
    ("Orly", 48.7450, 2.3930),
    ("Nanterre", 48.8920, 2.2070),
    ("Colombes", 48.9240, 2.2520),
    ("Asnières", 48.9110, 2.2860),
    ("Boulogne", 48.8350, 2.2410),
    ("Issy", 48.8240, 2.2730),
    ("Gennevilliers", 48.9330, 2.2940),
    ("Clichy", 48.9040, 2.3060),
    ("Levallois", 48.8930, 2.2880),
    ("Courbevoie", 48.8970, 2.2530),
    ("Puteaux", 48.8840, 2.2390),
    ("Argenteuil", 48.9470, 2.2470),
    ("Sarcelles", 48.9970, 2.3790),
    ("Cergy", 49.0360, 2.0760),
    ("Garges", 48.9720, 2.4000),
    ("Gonesse", 48.9860, 2.4490),
    ("Pontoise", 49.0510, 2.1010),
    ("Évry", 48.6290, 2.4410),
    ("Corbeil", 48.6100, 2.4820),
    ("Massy", 48.7310, 2.2730),
    ("Palaiseau", 48.7180, 2.2460),
    ("Grigny", 48.6560, 2.3850),
    ("Les Ulis", 48.6810, 2.1690),
    ("Versailles", 48.8050, 2.1350),
    ("Sartrouville", 48.9380, 2.1640),
    ("Mantes", 48.9910, 1.7170),
    ("Trappes", 48.7770, 2.0020),
    ("Mantes-la-Jolie", 48.9900, 1.7160),
    ("Poissy", 48.9290, 2.0450),
    ("Melun", 48.5400, 2.6600),
    ("Meaux", 48.9600, 2.8890),
    ("Chelles", 48.8780, 2.5900),
    ("Torcy", 48.8500, 2.6510),
    ("Lagny", 48.8780, 2.7070),
    ("Fontainebleau", 48.4050, 2.7020),
]:
    _add_point(name, lat, lng)

KEYWORDS = [
    "coiffure afro",
    "salon afro",
    "coiffeur afro",
    "coiffeuse afro",
    "coiffure africaine",
    "salon africain",
    "coiffure black",
    "salon black",
    "coiffure cheveux crépus",
    "coiffure tresses",
    "coiffure tissage",
    "coiffure braids",
    "coiffure locks",
    "coiffure dreadlocks",
    "barbier afro",
    "barber afro",
    "afro hair salon",
    "african hair salon",
    "black hair salon",
    "coiffure ethnique",
    "coiffure métisse",
    "salon de beauté afro",
    "coiffure nappy",
    "tresses africaines",
    "coiffure antillaise",
    "salon antillais",
    "coiffure créole",
    "box braids",
    "knotless braids",
    "vanilles coiffure",
    "tissage cheveux",
    "défrisage",
    "coiffure afro homme",
    "coiffure afro femme",
    "salon spécialisé afro",
]

TEXT_CITIES = [
    "Paris", "Saint-Denis", "Montreuil", "Créteil", "Argenteuil", "Aubervilliers",
    "Bondy", "Aulnay-sous-Bois", "Sarcelles", "Vitry-sur-Seine", "Champigny-sur-Marne",
    "Nanterre", "Colombes", "Évry", "Melun", "Cergy", "Bobigny", "Pantin", "Sevran",
    "Trappes", "Grigny", "Asnières-sur-Seine", "Gennevilliers", "Clichy", "Drancy",
    "La Courneuve", "Stains", "Livry-Gargan", "Noisy-le-Grand", "Villejuif", "Ivry-sur-Seine",
    "Fontenay-sous-Bois", "Maisons-Alfort", "Choisy-le-Roi", "Boulogne-Billancourt",
    "Issy-les-Moulineaux", "Courbevoie", "Puteaux", "Garges-lès-Gonesse", "Gonesse",
    "Corbeil-Essonnes", "Massy", "Versailles", "Sartrouville", "Mantes-la-Jolie",
    "Chelles", "Torcy", "Meaux",
]

TEXT_QUERIES = []
for city in TEXT_CITIES:
    for q in (
        f"coiffure afro {city}",
        f"salon afro {city}",
        f"tresses africaines {city}",
        f"coiffure black {city}",
    ):
        TEXT_QUERIES.append(q)

AFRO_NAME_RE = re.compile(
    r"\b(afro|africain|africaine|black|crépu|crepu|nappy|tresse|tresses|braid|braids|"
    r"tissage|locks|dread|rasta|antillais|antillaise|créole|creole|métisse|metisse|"
    r"ethnique|vanille|box\s*braids|knotless)\b",
    re.I,
)
IDF_DEPTS = {"75", "77", "78", "91", "92", "93", "94", "95"}


def extract_dept(address: str) -> Optional[str]:
    if not address:
        return None
    m = re.search(r"\b(75|77|78|91|92|93|94|95)\d{3}\b", address)
    return m.group(1) if m else None


def is_neg(rating: Any) -> bool:
    try:
        return int(rating) <= NEG_MAX
    except (TypeError, ValueError):
        return False


def normalize_from_legacy(detail: Dict[str, Any], keyword: str = "") -> Dict[str, Any]:
    avis, neg = [], []
    for r in detail.get("reviews") or []:
        item = {
            "auteur": r.get("author_name"),
            "note": r.get("rating"),
            "texte": r.get("text"),
            "langue": r.get("language"),
            "relative_time": r.get("relative_time_description"),
            "time": r.get("time"),
            "negatif": is_neg(r.get("rating")),
            "source_api": "places_legacy",
        }
        avis.append(item)
        if item["negatif"]:
            neg.append(item)

    geom = (detail.get("geometry") or {}).get("location") or {}
    hours = detail.get("opening_hours") or {}
    nom = detail.get("name") or ""
    adresse = detail.get("formatted_address") or detail.get("vicinity") or ""
    name_hit = bool(AFRO_NAME_RE.search(nom))
    kw = (keyword or "").lower()
    score = (2 if name_hit else 0) + (
        1
        if any(x in kw for x in ("afro", "black", "afric", "crépu", "tresse", "braid", "tissage", "locks", "antill"))
        else 0
    )

    return {
        "google_place_id": detail.get("place_id"),
        "nom": nom,
        "adresse": adresse,
        "telephone": detail.get("formatted_phone_number") or detail.get("international_phone_number"),
        "site": detail.get("website"),
        "note": detail.get("rating"),
        "nombre_avis": detail.get("user_ratings_total"),
        "horaires": {
            "ouvert_maintenant": hours.get("open_now"),
            "texte": hours.get("weekday_text") or [],
            "periods": hours.get("periods") or [],
        }
        if hours
        else None,
        "categorie": detail.get("types") or [],
        "avis": avis,
        "avis_negatifs": neg,
        "nb_avis_api": len(avis),
        "nb_avis_negatifs_api": len(neg),
        "localisation": {
            "lat": geom.get("lat"),
            "lng": geom.get("lng"),
            "departement": extract_dept(adresse),
        },
        "business_status": detail.get("business_status"),
        "maps_url": detail.get("url"),
        "afro_signal": {
            "nom_afro_like": name_hit,
            "keyword_source": keyword,
            "score": score,
        },
        "_reviews_source": "places_legacy",
        "extrait_at": datetime.now(timezone.utc).isoformat(),
    }


class Extractor:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.salons: Dict[str, Dict[str, Any]] = {}
        self.search_done: Set[str] = set()
        self.pending_ids: Dict[str, str] = {}  # place_id -> keyword
        os.makedirs(OUT_DIR, exist_ok=True)
        self._load()

    def _load(self) -> None:
        if not os.path.isfile(CHECKPOINT):
            return
        with open(CHECKPOINT, "r", encoding="utf-8") as f:
            data = json.load(f)
        for s in data.get("salons") or []:
            pid = s.get("google_place_id")
            if pid:
                self.salons[pid] = s
        # Keep only legacy-prefixed search keys; drop old New-API keys to re-cover
        for k in data.get("search_done") or []:
            if k.startswith("L|"):
                self.search_done.add(k)
        print(f"Resume: {len(self.salons)} salons, {len(self.search_done)} legacy searches done")

    def save(self) -> None:
        payload = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "count": len(self.salons),
            "search_done": sorted(self.search_done),
            "salons": list(self.salons.values()),
            "target": TARGET,
        }
        tmp = CHECKPOINT + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False)
        os.replace(tmp, CHECKPOINT)

    def _get(self, path: str, params: Dict[str, Any]) -> Optional[Dict]:
        params = dict(params)
        params["key"] = API_KEY
        try:
            r = self.session.get(f"{BASE}/{path}", params=params, timeout=30)
            r.raise_for_status()
            return r.json()
        except requests.RequestException as e:
            print(f"  HTTP {path}: {e}")
            return None

    def nearby_all(self, lat: float, lng: float, keyword: str, radius: int = 7000) -> List[Dict]:
        out: List[Dict] = []
        token = None
        for _ in range(3):
            params: Dict[str, Any] = {
                "location": f"{lat},{lng}",
                "radius": radius,
                "keyword": keyword,
                "language": "fr",
            }
            if token:
                params["pagetoken"] = token
            data = self._get("nearbysearch/json", params)
            time.sleep(PAUSE)
            if not data:
                break
            st = data.get("status")
            if st == "OVER_QUERY_LIMIT":
                print("  OVER_QUERY_LIMIT nearby — pause 30s")
                time.sleep(30)
                continue
            if st not in ("OK", "ZERO_RESULTS"):
                if st == "REQUEST_DENIED":
                    print(f"  DENIED nearby: {data.get('error_message')}")
                break
            out.extend(data.get("results") or [])
            token = data.get("next_page_token")
            if not token:
                break
            time.sleep(PAGE_PAUSE)
        return out

    def text_all(self, query: str) -> List[Dict]:
        out: List[Dict] = []
        token = None
        for _ in range(3):
            params: Dict[str, Any] = {"query": query, "language": "fr", "region": "fr"}
            if token:
                params["pagetoken"] = token
            data = self._get("textsearch/json", params)
            time.sleep(PAUSE)
            if not data:
                break
            st = data.get("status")
            if st == "OVER_QUERY_LIMIT":
                print("  OVER_QUERY_LIMIT text — pause 30s")
                time.sleep(30)
                continue
            if st not in ("OK", "ZERO_RESULTS"):
                if st == "REQUEST_DENIED":
                    print(f"  DENIED text: {data.get('error_message')}")
                break
            out.extend(data.get("results") or [])
            token = data.get("next_page_token")
            if not token:
                break
            time.sleep(PAGE_PAUSE)
        return out

    def details(self, place_id: str) -> Optional[Dict]:
        data = self._get(
            "details/json",
            {
                "place_id": place_id,
                "language": "fr",
                "reviews_sort": "newest",
                "fields": (
                    "place_id,name,formatted_address,formatted_phone_number,"
                    "international_phone_number,website,geometry,opening_hours,types,"
                    "business_status,rating,user_ratings_total,reviews,url"
                ),
            },
        )
        time.sleep(PAUSE)
        if not data:
            return None
        st = data.get("status")
        if st == "OVER_QUERY_LIMIT":
            print("  OVER_QUERY_LIMIT details — pause 45s")
            time.sleep(45)
            return self.details(place_id)
        if st != "OK":
            return None
        return data.get("result")

    def queue_listings(self, listings: List[Dict], keyword: str) -> int:
        n = 0
        for listing in listings:
            pid = listing.get("place_id")
            if not pid or pid in self.salons or pid in self.pending_ids:
                continue
            self.pending_ids[pid] = keyword
            n += 1
        return n

    def flush_details(self, batch_limit: Optional[int] = None) -> int:
        added = 0
        ids = list(self.pending_ids.items())
        if batch_limit is not None:
            ids = ids[:batch_limit]
        for pid, kw in ids:
            if len(self.salons) >= TARGET:
                break
            if pid in self.salons:
                self.pending_ids.pop(pid, None)
                continue
            detail = self.details(pid)
            self.pending_ids.pop(pid, None)
            if not detail:
                continue
            if detail.get("business_status") == "CLOSED_PERMANENTLY":
                continue
            salon = normalize_from_legacy(detail, keyword=kw)
            dept = (salon.get("localisation") or {}).get("departement")
            if dept and dept not in IDF_DEPTS:
                continue
            if not dept and (salon.get("afro_signal") or {}).get("score", 0) < 1:
                continue
            self.salons[pid] = salon
            added += 1
            if added % 25 == 0:
                self.save()
                print(f"  details +{added} this flush | total={len(self.salons)}")
        return added

    def run_text(self) -> None:
        for q in TEXT_QUERIES:
            if len(self.salons) >= TARGET:
                return
            key = f"L|t|{q}"
            if key in self.search_done:
                continue
            print(f"Text '{q}' | have={len(self.salons)} pending={len(self.pending_ids)}")
            listings = self.text_all(q)
            queued = self.queue_listings(listings, q)
            self.search_done.add(key)
            if queued:
                self.flush_details()
            self.save()
            print(f"  queued={queued} total={len(self.salons)}")

    def run_nearby(self) -> None:
        for point in SEARCH_POINTS:
            for kw in KEYWORDS:
                if len(self.salons) >= TARGET:
                    return
                key = f"L|n|{point['name']}|{kw}"
                if key in self.search_done:
                    continue
                print(f"Nearby {point['name']} / {kw} | have={len(self.salons)}")
                listings = self.nearby_all(point["lat"], point["lng"], kw)
                queued = self.queue_listings(listings, kw)
                self.search_done.add(key)
                if queued >= 10 or len(self.pending_ids) >= 40:
                    self.flush_details()
                self.save()
                print(f"  queued={queued} pending={len(self.pending_ids)} total={len(self.salons)}")

    def export(self) -> str:
        # Ensure pending drained
        while self.pending_ids and len(self.salons) < TARGET:
            self.flush_details(batch_limit=100)
            self.save()

        salons = list(self.salons.values())
        salons.sort(
            key=lambda s: (
                -int((s.get("afro_signal") or {}).get("score") or 0),
                -(s.get("nb_avis_negatifs_api") or 0),
                -(s.get("nombre_avis") or 0),
                s.get("nom") or "",
            )
        )
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        paths = []
        for i in range(0, max(len(salons), 1), SHARD_SIZE):
            chunk = salons[i : i + SHARD_SIZE]
            if not chunk and i > 0:
                break
            path = os.path.join(OUT_DIR, f"salons_afro_idf_part{(i // SHARD_SIZE) + 1:03d}_{ts}.json")
            with open(path, "w", encoding="utf-8") as f:
                json.dump(chunk, f, ensure_ascii=False, indent=2)
            paths.append(path)

        neg_index = [
            {
                "google_place_id": s.get("google_place_id"),
                "nom": s.get("nom"),
                "adresse": s.get("adresse"),
                "note": s.get("note"),
                "nombre_avis": s.get("nombre_avis"),
                "avis_negatifs": s.get("avis_negatifs") or [],
            }
            for s in salons
            if s.get("avis_negatifs")
        ]
        neg_path = os.path.join(OUT_DIR, f"avis_negatifs_index_{ts}.json")
        with open(neg_path, "w", encoding="utf-8") as f:
            json.dump(neg_index, f, ensure_ascii=False, indent=2)

        all_path = os.path.join(OUT_DIR, f"salons_afro_idf_ALL_{ts}.json")
        with open(all_path, "w", encoding="utf-8") as f:
            json.dump(salons, f, ensure_ascii=False, indent=2)

        summary = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "api": "Places Legacy",
            "target": TARGET,
            "count_unique": len(salons),
            "target_reached": len(salons) >= TARGET,
            "with_avis_api": sum(1 for s in salons if s.get("nb_avis_api")),
            "with_avis_negatifs_api": sum(1 for s in salons if s.get("nb_avis_negatifs_api")),
            "note": (
                "Google returns at most ~5 reviews/place. "
                "5000 unique afro IDF may exceed real market; export = max unique found."
            ),
            "shards": [os.path.basename(p) for p in paths],
            "all": os.path.basename(all_path),
            "avis_negatifs_index": os.path.basename(neg_path),
        }
        summary_path = os.path.join(OUT_DIR, f"SUMMARY_{ts}.json")
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        print(f"Export ALL={all_path}")
        print(f"Negatifs={neg_path} ({len(neg_index)})")
        print(f"Summary={summary_path}")
        return summary_path


def main() -> None:
    if not API_KEY:
        raise SystemExit("Missing GOOGLE_PLACES_API_KEY in scraping_data/.env")
    print(f"Target={TARGET} points={len(SEARCH_POINTS)} keywords={len(KEYWORDS)} text_q={len(TEXT_QUERIES)}")

    # Smoke
    probe = requests.get(
        f"{BASE}/textsearch/json",
        params={"query": "coiffure afro Paris", "key": API_KEY, "language": "fr"},
        timeout=30,
    ).json()
    if probe.get("status") not in ("OK", "ZERO_RESULTS"):
        raise SystemExit(f"Legacy search not usable: {probe.get('status')} {probe.get('error_message')}")

    ex = Extractor()
    print(f"Starting from {len(ex.salons)} / {TARGET}")
    ex.run_text()
    if len(ex.salons) < TARGET:
        ex.run_nearby()
    ex.export()
    print(f"Done unique={len(ex.salons)} target={TARGET}")


if __name__ == "__main__":
    main()
