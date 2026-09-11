"""
Enrich checkpoint salons with Place Details (New) contact/hours fields,
then export JSON shards. Reviews are attempted but often unavailable on projects
without Atmosphere / reviews entitlement.
"""

from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import requests

# Reuse helpers from extractor
from extract_afro_places_avis_idf import (
    CHECKPOINT,
    OUT_DIR,
    SHARD_SIZE,
    TARGET,
    normalize_place,
    place_id_from,
)

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
BASE = "https://places.googleapis.com/v1"
PAUSE = float(os.getenv("EXTRACT_PAUSE", "0.4"))
DETAILS_MASK = (
    "id,displayName,formattedAddress,location,rating,userRatingCount,types,"
    "businessStatus,nationalPhoneNumber,internationalPhoneNumber,websiteUri,"
    "regularOpeningHours,reviews"
)


def get_details(session: requests.Session, place_id: str) -> Optional[Dict[str, Any]]:
    r = session.get(
        f"{BASE}/places/{place_id}",
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": DETAILS_MASK,
        },
        timeout=30,
    )
    if r.status_code == 429:
        print("Quota/rate limit on Place Details — stopping enrich.")
        return {"__quota__": True}
    if r.status_code >= 400:
        print(f"  details {place_id}: {r.status_code} {r.text[:200]}")
        return None
    return r.json()


def main() -> None:
    if not API_KEY:
        raise SystemExit("Set GOOGLE_PLACES_API_KEY")
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(CHECKPOINT, "r", encoding="utf-8") as f:
        data = json.load(f)
    salons: List[Dict[str, Any]] = data.get("salons") or []
    print(f"Enriching {len(salons)} salons from checkpoint")

    session = requests.Session()
    updated = 0
    with_reviews = 0
    for i, s in enumerate(salons):
        pid = s.get("google_place_id")
        if not pid:
            continue
        # Skip if already has phone + hours + tried reviews flag
        if s.get("_details_enriched") and (s.get("nb_avis_api") or s.get("_reviews_unavailable")):
            continue
        detail = get_details(session, pid)
        time.sleep(PAUSE)
        if detail and detail.get("__quota__"):
            break
        if not detail:
            continue
        kw = ((s.get("afro_signal") or {}).get("keyword_source")) or ""
        fresh = normalize_place(detail, matched_keyword=kw)
        # Preserve stronger existing keyword signal if present
        if (s.get("afro_signal") or {}).get("score", 0) > (fresh.get("afro_signal") or {}).get("score", 0):
            fresh["afro_signal"] = s.get("afro_signal")
        fresh["_details_enriched"] = True
        if not fresh.get("nb_avis_api"):
            fresh["_reviews_unavailable"] = True
        else:
            with_reviews += 1
        salons[i] = fresh
        updated += 1
        if updated % 25 == 0:
            data["salons"] = salons
            data["count"] = len(salons)
            data["updated_at"] = datetime.now(timezone.utc).isoformat()
            with open(CHECKPOINT, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
            print(f"  enriched {updated}/{len(salons)} (reviews_ok={with_reviews})")

    data["salons"] = salons
    data["count"] = len(salons)
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    with open(CHECKPOINT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    # Export
    salons_sorted = sorted(
        salons,
        key=lambda s: (
            -int((s.get("afro_signal") or {}).get("score") or 0),
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

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "target": TARGET,
        "count_unique": len(salons_sorted),
        "target_reached": len(salons_sorted) >= TARGET,
        "details_enriched_this_run": updated,
        "with_reviews_api": sum(1 for s in salons_sorted if s.get("nb_avis_api")),
        "with_negative_reviews_api": sum(1 for s in salons_sorted if s.get("nb_avis_negatifs_api")),
        "blockers": [
            "SearchTextRequest quota on this GCP project is 100/day — insufficient for 5000.",
            "Place Details returns no 'reviews' field for this project/key (even with FieldMask *).",
            "Enable billing + Places Atmosphere / request quota increase; rotate exposed API key.",
        ],
        "shards": [os.path.basename(p) for p in paths],
        "all": os.path.basename(all_path),
        "avis_negatifs_index": os.path.basename(neg_path),
    }
    summary_path = os.path.join(OUT_DIR, f"SUMMARY_{ts}.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"Done. unique={len(salons_sorted)} reviews_ok={summary['with_reviews_api']}")
    print(f"Summary: {summary_path}")
    for p in paths + [all_path, neg_path]:
        print(f"  -> {p}")


if __name__ == "__main__":
    main()
