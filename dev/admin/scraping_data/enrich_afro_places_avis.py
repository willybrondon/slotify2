"""
Fill avis / avis_negatifs on extract_afro_avis_idf checkpoint.

Primary: Places API Legacy Details (fields=reviews) — must be ENABLED on the GCP project.
Fallback: Places API (New) Place Details with FieldMask reviews.

Google returns at most ~5 reviews per place. Negative = note <= 3.

Env: GOOGLE_PLACES_API_KEY
"""

from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import requests
from dotenv import load_dotenv

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Always load scraping_data/.env (override empty/stale shell env)
load_dotenv(os.path.join(SCRIPT_DIR, ".env"), override=True)

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
OUT_DIR = os.path.join(SCRIPT_DIR, "extract_afro_avis_idf")
CHECKPOINT = os.path.join(OUT_DIR, "_checkpoint.json")
PAUSE = float(os.getenv("EXTRACT_PAUSE", "0.35"))
SHARD_SIZE = 500
NEG_MAX = 3

LEGACY_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json"
NEW_DETAILS = "https://places.googleapis.com/v1/places"


def is_neg(rating: Any) -> bool:
    try:
        return int(rating) <= NEG_MAX
    except (TypeError, ValueError):
        return False


def normalize_legacy_reviews(reviews: List[Dict[str, Any]]) -> Tuple[List[Dict], List[Dict]]:
    avis, neg = [], []
    for r in reviews or []:
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
    return avis, neg


def normalize_new_reviews(reviews: List[Dict[str, Any]]) -> Tuple[List[Dict], List[Dict]]:
    avis, neg = [], []
    for r in reviews or []:
        text_obj = r.get("text") if isinstance(r.get("text"), dict) else {}
        texte = text_obj.get("text") if text_obj else (r.get("text") if isinstance(r.get("text"), str) else None)
        if not texte:
            ot = r.get("originalText")
            if isinstance(ot, dict):
                texte = ot.get("text")
        item = {
            "auteur": ((r.get("authorAttribution") or {}).get("displayName")),
            "note": r.get("rating"),
            "texte": texte,
            "langue": text_obj.get("languageCode") if text_obj else None,
            "relative_time": r.get("relativePublishTimeDescription"),
            "publish_time": r.get("publishTime"),
            "negatif": is_neg(r.get("rating")),
            "source_api": "places_new",
        }
        avis.append(item)
        if item["negatif"]:
            neg.append(item)
    return avis, neg


def fetch_legacy(session: requests.Session, place_id: str) -> Tuple[Optional[Dict], Optional[str]]:
    r = session.get(
        LEGACY_DETAILS,
        params={
            "place_id": place_id,
            "key": API_KEY,
            "language": "fr",
            "reviews_sort": "newest",
            "fields": (
                "place_id,name,formatted_address,formatted_phone_number,international_phone_number,"
                "website,geometry,opening_hours,types,business_status,rating,user_ratings_total,reviews,url"
            ),
        },
        timeout=30,
    )
    data = r.json()
    status = data.get("status")
    if status == "REQUEST_DENIED":
        return None, data.get("error_message") or status
    if status == "OVER_QUERY_LIMIT":
        return {"__quota__": True}, status
    if status != "OK":
        return None, status
    return data.get("result") or {}, None


def fetch_new(session: requests.Session, place_id: str) -> Tuple[Optional[Dict], Optional[str]]:
    r = session.get(
        f"{NEW_DETAILS}/{place_id}",
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": (
                "id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,"
                "websiteUri,location,regularOpeningHours,types,businessStatus,rating,"
                "userRatingCount,reviews,googleMapsLinks"
            ),
        },
        params={"languageCode": "fr", "regionCode": "FR"},
        timeout=30,
    )
    if r.status_code == 429:
        return {"__quota__": True}, "RESOURCE_EXHAUSTED"
    if r.status_code >= 400:
        try:
            err = r.json().get("error", {}).get("message")
        except Exception:
            err = r.text[:200]
        return None, err
    return r.json(), None


def apply_legacy(salon: Dict[str, Any], result: Dict[str, Any]) -> Dict[str, Any]:
    avis, neg = normalize_legacy_reviews(result.get("reviews") or [])
    geom = (result.get("geometry") or {}).get("location") or {}
    hours = result.get("opening_hours") or {}
    salon.update(
        {
            "nom": result.get("name") or salon.get("nom"),
            "adresse": result.get("formatted_address") or salon.get("adresse"),
            "telephone": result.get("formatted_phone_number")
            or result.get("international_phone_number")
            or salon.get("telephone"),
            "site": result.get("website") or salon.get("site"),
            "note": result.get("rating") if result.get("rating") is not None else salon.get("note"),
            "nombre_avis": result.get("user_ratings_total")
            if result.get("user_ratings_total") is not None
            else salon.get("nombre_avis"),
            "horaires": {
                "ouvert_maintenant": hours.get("open_now"),
                "texte": hours.get("weekday_text") or [],
                "periods": hours.get("periods") or [],
            }
            if hours
            else salon.get("horaires"),
            "categorie": result.get("types") or salon.get("categorie"),
            "avis": avis,
            "avis_negatifs": neg,
            "nb_avis_api": len(avis),
            "nb_avis_negatifs_api": len(neg),
            "localisation": {
                "lat": geom.get("lat") or (salon.get("localisation") or {}).get("lat"),
                "lng": geom.get("lng") or (salon.get("localisation") or {}).get("lng"),
                "departement": (salon.get("localisation") or {}).get("departement"),
            },
            "business_status": result.get("business_status") or salon.get("business_status"),
            "maps_url": result.get("url"),
            "_reviews_source": "places_legacy",
            "_reviews_enriched_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    salon.pop("_reviews_unavailable", None)
    return salon


def apply_new(salon: Dict[str, Any], result: Dict[str, Any]) -> Dict[str, Any]:
    avis, neg = normalize_new_reviews(result.get("reviews") or [])
    loc = result.get("location") or {}
    hours = result.get("regularOpeningHours") or {}
    links = result.get("googleMapsLinks") or {}
    salon.update(
        {
            "nom": ((result.get("displayName") or {}).get("text")) or salon.get("nom"),
            "adresse": result.get("formattedAddress") or salon.get("adresse"),
            "telephone": result.get("nationalPhoneNumber")
            or result.get("internationalPhoneNumber")
            or salon.get("telephone"),
            "site": result.get("websiteUri") or salon.get("site"),
            "note": result.get("rating") if result.get("rating") is not None else salon.get("note"),
            "nombre_avis": result.get("userRatingCount")
            if result.get("userRatingCount") is not None
            else salon.get("nombre_avis"),
            "horaires": {
                "ouvert_maintenant": hours.get("openNow"),
                "texte": hours.get("weekdayDescriptions") or [],
                "periods": hours.get("periods") or [],
            }
            if hours
            else salon.get("horaires"),
            "categorie": result.get("types") or salon.get("categorie"),
            "avis": avis,
            "avis_negatifs": neg,
            "nb_avis_api": len(avis),
            "nb_avis_negatifs_api": len(neg),
            "localisation": {
                "lat": loc.get("latitude") or (salon.get("localisation") or {}).get("lat"),
                "lng": loc.get("longitude") or (salon.get("localisation") or {}).get("lng"),
                "departement": (salon.get("localisation") or {}).get("departement"),
            },
            "business_status": result.get("businessStatus") or salon.get("business_status"),
            "reviews_uri": links.get("reviewsUri"),
            "maps_place_uri": links.get("placeUri"),
            "_reviews_source": "places_new" if avis else "places_new_no_reviews",
            "_reviews_enriched_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    if avis:
        salon.pop("_reviews_unavailable", None)
    else:
        salon["_reviews_unavailable"] = True
    return salon


def probe_reviews_access(session: requests.Session, sample_place_id: str) -> str:
    """Return 'legacy' | 'new' | 'none'."""
    legacy, leg_err = fetch_legacy(session, sample_place_id)
    if legacy and not legacy.get("__quota__"):
        if legacy.get("reviews"):
            print(f"Probe: Legacy OK — {len(legacy['reviews'])} reviews")
            return "legacy"
        if leg_err is None:
            print("Probe: Legacy OK but 0 reviews on sample place")
    else:
        print(f"Probe: Legacy unavailable — {leg_err}")

    new, new_err = fetch_new(session, sample_place_id)
    if new and not new.get("__quota__"):
        if new.get("reviews"):
            print(f"Probe: Places New OK — {len(new['reviews'])} reviews")
            return "new"
        print(
            "Probe: Places New responds but omits/empty 'reviews' "
            f"(rating={new.get('rating')}, userRatingCount={new.get('userRatingCount')})"
        )
    else:
        print(f"Probe: Places New error — {new_err}")
    return "none"


def export_files(salons: List[Dict[str, Any]]) -> str:
    salons_sorted = sorted(
        salons,
        key=lambda s: (
            -(s.get("nb_avis_negatifs_api") or 0),
            -(s.get("nb_avis_api") or 0),
            -(s.get("nombre_avis") or 0),
            s.get("nom") or "",
        ),
    )
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    paths = []
    for i in range(0, max(len(salons_sorted), 1), SHARD_SIZE):
        chunk = salons_sorted[i : i + SHARD_SIZE]
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
            "reviews_uri": s.get("reviews_uri"),
        }
        for s in salons_sorted
        if s.get("avis_negatifs")
    ]
    neg_path = os.path.join(OUT_DIR, f"avis_negatifs_index_{ts}.json")
    with open(neg_path, "w", encoding="utf-8") as f:
        json.dump(neg_index, f, ensure_ascii=False, indent=2)

    all_path = os.path.join(OUT_DIR, f"salons_afro_idf_ALL_{ts}.json")
    with open(all_path, "w", encoding="utf-8") as f:
        json.dump(salons_sorted, f, ensure_ascii=False, indent=2)

    with_avis = sum(1 for s in salons_sorted if s.get("nb_avis_api"))
    with_neg = sum(1 for s in salons_sorted if s.get("nb_avis_negatifs_api"))
    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count_unique": len(salons_sorted),
        "with_avis_api": with_avis,
        "with_avis_negatifs_api": with_neg,
        "pct_with_avis": round(100.0 * with_avis / max(len(salons_sorted), 1), 1),
        "note_api_limit": "Google Place Details returns at most ~5 reviews per place.",
        "shards": [os.path.basename(p) for p in paths],
        "all": os.path.basename(all_path),
        "avis_negatifs_index": os.path.basename(neg_path),
    }
    summary_path = os.path.join(OUT_DIR, f"SUMMARY_avis_{ts}.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f"Export: {all_path}")
    print(f"Negatifs: {neg_path} ({len(neg_index)} salons)")
    print(f"Summary: {summary_path}")
    return summary_path


def main() -> None:
    if not API_KEY:
        raise SystemExit("Set GOOGLE_PLACES_API_KEY")

    if not os.path.isfile(CHECKPOINT):
        raise SystemExit(f"Missing checkpoint: {CHECKPOINT}")

    with open(CHECKPOINT, "r", encoding="utf-8") as f:
        data = json.load(f)
    salons: List[Dict[str, Any]] = data.get("salons") or []
    if not salons:
        raise SystemExit("Checkpoint empty")

    session = requests.Session()
    sample_id = salons[0].get("google_place_id")
    mode = probe_reviews_access(session, sample_id)

    if mode == "none":
        msg = {
            "error": "REVIEWS_NOT_AVAILABLE_ON_THIS_API_KEY",
            "why": (
                "Places API (New) returns rating/userRatingCount but not the reviews[] field "
                "for this GCP project. Legacy Place Details is REQUEST_DENIED "
                "(Places API Legacy not enabled)."
            ),
            "fix_now": [
                "Open https://console.cloud.google.com/google/maps-apis/api-list",
                "Enable billing on the project that owns the API key",
                "Enable 'Places API' (Legacy) — required for reliable reviews via details/json",
                "Also keep 'Places API (New)' enabled",
                "Key restrictions: application restriction None or IP (not HTTP referrer) for this script",
                "Rotate the key that was pasted in chat",
                "Re-run: python enrich_afro_places_avis.py",
            ],
            "sample_place_id": sample_id,
        }
        out = os.path.join(OUT_DIR, "BLOCKER_avis.json")
        with open(out, "w", encoding="utf-8") as f:
            json.dump(msg, f, ensure_ascii=False, indent=2)
        print(json.dumps(msg, ensure_ascii=False, indent=2))
        raise SystemExit(2)

    print(f"Using mode={mode} for {len(salons)} salons")
    updated = 0
    with_avis = 0
    with_neg = 0

    for i, salon in enumerate(salons):
        pid = salon.get("google_place_id")
        if not pid:
            continue
        if salon.get("nb_avis_api") and salon.get("_reviews_source") in ("places_legacy", "places_new"):
            with_avis += 1
            with_neg += 1 if salon.get("nb_avis_negatifs_api") else 0
            continue

        if mode == "legacy":
            result, err = fetch_legacy(session, pid)
            time.sleep(PAUSE)
            if result and result.get("__quota__"):
                print("Quota hit — saving progress")
                break
            if result:
                salons[i] = apply_legacy(salon, result)
                updated += 1
            else:
                # fallback new for this place
                result, err = fetch_new(session, pid)
                time.sleep(PAUSE)
                if result and not result.get("__quota__"):
                    salons[i] = apply_new(salon, result)
                    updated += 1
        else:
            result, err = fetch_new(session, pid)
            time.sleep(PAUSE)
            if result and result.get("__quota__"):
                print("Quota hit — saving progress")
                break
            if result:
                salons[i] = apply_new(salon, result)
                updated += 1

        if salons[i].get("nb_avis_api"):
            with_avis += 1
        if salons[i].get("nb_avis_negatifs_api"):
            with_neg += 1

        if updated and updated % 25 == 0:
            data["salons"] = salons
            data["count"] = len(salons)
            data["updated_at"] = datetime.now(timezone.utc).isoformat()
            with open(CHECKPOINT, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
            print(f"  progress {updated} updated | with_avis={with_avis} with_neg={with_neg}")

    data["salons"] = salons
    data["count"] = len(salons)
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    with open(CHECKPOINT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    export_files(salons)
    print(f"Done. updated={updated} with_avis={with_avis} with_negatifs={with_neg}")
    if with_avis == 0:
        raise SystemExit("Still 0 reviews after enrich — check API entitlements.")


if __name__ == "__main__":
    main()
