"""
Extract Afro/Black salons in Île-de-France via Places API (New).
Schema: google_place_id, nom, adresse, telephone, site, note, nombre_avis,
        horaires, categorie, avis (+ avis_negatifs), localisation.

Env: GOOGLE_PLACES_API_KEY — never commit the key.
Limitation: Google returns at most ~5 reviews per place via the API.
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

load_dotenv()

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
BASE = "https://places.googleapis.com/v1"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(SCRIPT_DIR, "extract_afro_avis_idf")
CHECKPOINT = os.path.join(OUT_DIR, "_checkpoint.json")
TARGET = int(os.getenv("EXTRACT_TARGET", "5000"))
PAUSE = float(os.getenv("EXTRACT_PAUSE", "0.35"))
SHARD_SIZE = 500

# Keep SearchText cheap; reviews often unavailable on Search and cost Atmosphere SKU.
# Enrich reviews via Place Details separately when the project entitles them.
SEARCH_FIELD_MASK = ",".join(
    [
        "places.id",
        "places.name",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.rating",
        "places.userRatingCount",
        "places.types",
        "places.businessStatus",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.websiteUri",
        "places.regularOpeningHours",
        "nextPageToken",
    ]
)

DETAILS_FIELD_MASK = ",".join(
    [
        "id",
        "name",
        "displayName",
        "formattedAddress",
        "location",
        "rating",
        "userRatingCount",
        "types",
        "businessStatus",
        "nationalPhoneNumber",
        "internationalPhoneNumber",
        "websiteUri",
        "regularOpeningHours",
        "reviews",
    ]
)

SEARCH_POINTS: List[Dict[str, Any]] = [
    {"name": "Paris-Centre", "lat": 48.8566, "lng": 2.3522},
    {"name": "Paris-10-11", "lat": 48.8650, "lng": 2.3700},
    {"name": "Paris-18", "lat": 48.8920, "lng": 2.3440},
    {"name": "Paris-19", "lat": 48.8820, "lng": 2.3820},
    {"name": "Paris-20", "lat": 48.8650, "lng": 2.3990},
    {"name": "Paris-13", "lat": 48.8280, "lng": 2.3620},
    {"name": "Paris-12", "lat": 48.8410, "lng": 2.3880},
    {"name": "Paris-14", "lat": 48.8330, "lng": 2.3270},
    {"name": "Paris-15", "lat": 48.8420, "lng": 2.2930},
    {"name": "Paris-16", "lat": 48.8630, "lng": 2.2760},
    {"name": "Paris-17", "lat": 48.8870, "lng": 2.3070},
    {"name": "Paris-9", "lat": 48.8770, "lng": 2.3370},
    {"name": "Saint-Denis", "lat": 48.9360, "lng": 2.3570},
    {"name": "Aubervilliers", "lat": 48.9140, "lng": 2.3830},
    {"name": "Bobigny", "lat": 48.9080, "lng": 2.4390},
    {"name": "Montreuil", "lat": 48.8630, "lng": 2.4430},
    {"name": "Pantin", "lat": 48.8940, "lng": 2.4090},
    {"name": "Bondy", "lat": 48.9020, "lng": 2.4830},
    {"name": "Aulnay", "lat": 48.9380, "lng": 2.4940},
    {"name": "Sevran", "lat": 48.9380, "lng": 2.5270},
    {"name": "Noisy-le-Grand", "lat": 48.8490, "lng": 2.5520},
    {"name": "Épinay", "lat": 48.9550, "lng": 2.3150},
    {"name": "Créteil", "lat": 48.7900, "lng": 2.4550},
    {"name": "Vitry", "lat": 48.7870, "lng": 2.4030},
    {"name": "Champigny", "lat": 48.8170, "lng": 2.5150},
    {"name": "Ivry", "lat": 48.8130, "lng": 2.3880},
    {"name": "Villejuif", "lat": 48.7920, "lng": 2.3630},
    {"name": "Fontenay", "lat": 48.8510, "lng": 2.4740},
    {"name": "Nogent", "lat": 48.8370, "lng": 2.4830},
    {"name": "Nanterre", "lat": 48.8920, "lng": 2.2070},
    {"name": "Colombes", "lat": 48.9240, "lng": 2.2520},
    {"name": "Asnières", "lat": 48.9110, "lng": 2.2860},
    {"name": "Boulogne", "lat": 48.8350, "lng": 2.2410},
    {"name": "Issy", "lat": 48.8240, "lng": 2.2730},
    {"name": "Gennevilliers", "lat": 48.9330, "lng": 2.2940},
    {"name": "Clichy", "lat": 48.9040, "lng": 2.3060},
    {"name": "Argenteuil", "lat": 48.9470, "lng": 2.2470},
    {"name": "Sarcelles", "lat": 48.9970, "lng": 2.3790},
    {"name": "Cergy", "lat": 49.0360, "lng": 2.0760},
    {"name": "Garges", "lat": 48.9720, "lng": 2.4000},
    {"name": "Gonesse", "lat": 48.9860, "lng": 2.4490},
    {"name": "Pontoise", "lat": 49.0510, "lng": 2.1010},
    {"name": "Évry", "lat": 48.6290, "lng": 2.4410},
    {"name": "Corbeil", "lat": 48.6100, "lng": 2.4820},
    {"name": "Massy", "lat": 48.7310, "lng": 2.2730},
    {"name": "Palaiseau", "lat": 48.7180, "lng": 2.2460},
    {"name": "Grigny", "lat": 48.6560, "lng": 2.3850},
    {"name": "Versailles", "lat": 48.8050, "lng": 2.1350},
    {"name": "Sartrouville", "lat": 48.9380, "lng": 2.1640},
    {"name": "Mantes", "lat": 48.9910, "lng": 1.7170},
    {"name": "Trappes", "lat": 48.7770, "lng": 2.0020},
    {"name": "Melun", "lat": 48.5400, "lng": 2.6600},
    {"name": "Meaux", "lat": 48.9600, "lng": 2.8890},
    {"name": "Chelles", "lat": 48.8780, "lng": 2.5900},
    {"name": "Torcy", "lat": 48.8500, "lng": 2.6510},
]

KEYWORDS_CORE = [
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
]

KEYWORDS_EXTRA = [
    "tissage paris",
    "vanilles coiffure",
    "box braids",
    "knotless braids",
    "coiffure créole",
    "coiffure afro homme",
    "coiffure afro femme",
    "défrisage",
    "coiffure pour cheveux crépus",
    "salon spécialisé afro",
]

TEXT_QUERIES = [
    "coiffure afro Paris",
    "salon afro Paris",
    "coiffure afro Saint-Denis",
    "coiffure afro Montreuil",
    "coiffure afro Créteil",
    "coiffure afro Argenteuil",
    "coiffure afro Aubervilliers",
    "coiffure afro Bondy",
    "coiffure afro Aulnay-sous-Bois",
    "coiffure afro Sarcelles",
    "coiffure afro Vitry-sur-Seine",
    "coiffure afro Champigny",
    "coiffure afro Nanterre",
    "coiffure afro Colombes",
    "coiffure afro Évry",
    "coiffure afro Melun",
    "coiffure afro Cergy",
    "salon black Île-de-France",
    "tresses africaines Paris",
    "tissage afro Paris",
    "coiffure afro Bobigny",
    "coiffure afro Pantin",
    "coiffure afro Sevran",
    "coiffure afro Trappes",
    "coiffure afro Grigny",
]

AFRO_NAME_RE = re.compile(
    r"\b(afro|africain|africaine|black|crépu|crepu|nappy|tresse|tresses|braid|braids|"
    r"tissage|locks|dread|rasta|antillais|antillaise|créole|creole|métisse|metisse|"
    r"ethnique|vanille|box\s*braids|knotless)\b",
    re.I,
)
IDF_DEPTS = {"75", "77", "78", "91", "92", "93", "94", "95"}


def place_id_from(place: Dict[str, Any]) -> Optional[str]:
    raw = place.get("id") or place.get("name") or ""
    if raw.startswith("places/"):
        return raw.split("/", 1)[1]
    return raw or None


def extract_dept(address: str) -> Optional[str]:
    if not address:
        return None
    m = re.search(r"\b(75|77|78|91|92|93|94|95)\d{3}\b", address)
    return m.group(1) if m else None


def review_text(r: Dict[str, Any]) -> Optional[str]:
    t = r.get("text")
    if isinstance(t, dict):
        return t.get("text")
    if isinstance(t, str):
        return t
    ot = r.get("originalText")
    if isinstance(ot, dict):
        return ot.get("text")
    return None


def normalize_place(place: Dict[str, Any], matched_keyword: str = "") -> Dict[str, Any]:
    pid = place_id_from(place)
    nom = ((place.get("displayName") or {}).get("text")) or ""
    adresse = place.get("formattedAddress") or ""
    loc = place.get("location") or {}
    types = place.get("types") or []
    hours = place.get("regularOpeningHours") or {}

    avis = []
    avis_negatifs = []
    for r in place.get("reviews") or []:
        rating = r.get("rating")
        author = ((r.get("authorAttribution") or {}).get("displayName"))
        item = {
            "auteur": author,
            "note": rating,
            "texte": review_text(r),
            "langue": ((r.get("text") or {}) if isinstance(r.get("text"), dict) else {}).get("languageCode"),
            "relative_time": r.get("relativePublishTimeDescription"),
            "publish_time": r.get("publishTime"),
            "negatif": isinstance(rating, (int, float)) and int(rating) <= 3,
        }
        avis.append(item)
        if item["negatif"]:
            avis_negatifs.append(item)

    name_hit = bool(AFRO_NAME_RE.search(nom))
    kw = (matched_keyword or "").lower()
    signal_score = (2 if name_hit else 0) + (
        1
        if any(x in kw for x in ("afro", "black", "afric", "crépu", "tresse", "braid", "tissage", "locks", "antill"))
        else 0
    )

    return {
        "google_place_id": pid,
        "nom": nom,
        "adresse": adresse,
        "telephone": place.get("nationalPhoneNumber") or place.get("internationalPhoneNumber"),
        "site": place.get("websiteUri"),
        "note": place.get("rating"),
        "nombre_avis": place.get("userRatingCount"),
        "horaires": {
            "ouvert_maintenant": hours.get("openNow"),
            "texte": hours.get("weekdayDescriptions") or [],
            "periods": hours.get("periods") or [],
        }
        if hours
        else None,
        "categorie": types,
        "avis": avis,
        "avis_negatifs": avis_negatifs,
        "nb_avis_api": len(avis),
        "nb_avis_negatifs_api": len(avis_negatifs),
        "localisation": {
            "lat": loc.get("latitude"),
            "lng": loc.get("longitude"),
            "departement": extract_dept(adresse),
        },
        "business_status": place.get("businessStatus"),
        "afro_signal": {
            "nom_afro_like": name_hit,
            "keyword_source": matched_keyword,
            "score": signal_score,
        },
        "extrait_at": datetime.now(timezone.utc).isoformat(),
    }


class Extractor:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        self.salons: Dict[str, Dict[str, Any]] = {}
        self.search_done: Set[str] = set()
        os.makedirs(OUT_DIR, exist_ok=True)
        self._load_checkpoint()

    def _headers(self, field_mask: str) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": field_mask,
        }

    def _load_checkpoint(self) -> None:
        if not os.path.isfile(CHECKPOINT):
            return
        try:
            with open(CHECKPOINT, "r", encoding="utf-8") as f:
                data = json.load(f)
            for s in data.get("salons") or []:
                pid = s.get("google_place_id")
                if pid:
                    self.salons[pid] = s
            self.search_done = set(data.get("search_done") or [])
            print(f"Resume: {len(self.salons)} salons, {len(self.search_done)} searches done")
        except Exception as e:
            print(f"Checkpoint load failed: {e}")

    def save_checkpoint(self) -> None:
        payload = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "count": len(self.salons),
            "search_done": sorted(self.search_done),
            "salons": list(self.salons.values()),
        }
        tmp = CHECKPOINT + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False)
        os.replace(tmp, CHECKPOINT)

    def _post(self, path: str, body: Dict[str, Any], field_mask: str) -> Optional[Dict]:
        try:
            r = self.session.post(
                f"{BASE}/{path}",
                headers=self._headers(field_mask),
                json=body,
                timeout=30,
            )
            if r.status_code >= 400:
                try:
                    err = r.json()
                except Exception:
                    err = {"error": r.text[:500]}
                print(f"  HTTP {r.status_code} {path}: {err}")
                return None
            return r.json()
        except requests.RequestException as e:
            print(f"  Request error {path}: {e}")
            return None

    def search_text(self, query: str, lat: Optional[float] = None, lng: Optional[float] = None, radius_m: float = 25000) -> List[Dict]:
        places: List[Dict] = []
        page_token = None
        for _ in range(3):
            body: Dict[str, Any] = {
                "textQuery": query,
                "languageCode": "fr",
                "regionCode": "FR",
                "maxResultCount": 20,
            }
            if lat is not None and lng is not None:
                body["locationBias"] = {
                    "circle": {
                        "center": {"latitude": lat, "longitude": lng},
                        "radius": radius_m,
                    }
                }
            if page_token:
                body["pageToken"] = page_token
            data = self._post("places:searchText", body, SEARCH_FIELD_MASK)
            time.sleep(PAUSE)
            if not data:
                break
            places.extend(data.get("places") or [])
            page_token = data.get("nextPageToken")
            if not page_token:
                break
            time.sleep(1.5)
        return places

    def search_nearby(self, lat: float, lng: float, keyword: str, radius_m: float = 8000) -> List[Dict]:
        # Nearby (New) uses includedTypes; keyword-like via text search with bias is more reliable for afro.
        return self.search_text(f"{keyword}", lat=lat, lng=lng, radius_m=radius_m)

    def ingest(self, place: Dict[str, Any], keyword: str) -> bool:
        pid = place_id_from(place)
        if not pid or pid in self.salons:
            return False
        if place.get("businessStatus") == "CLOSED_PERMANENTLY":
            return False
        salon = normalize_place(place, matched_keyword=keyword)
        dept = (salon.get("localisation") or {}).get("departement")
        if dept and dept not in IDF_DEPTS:
            return False
        # Keep if IDF postal OR unknown postal but name/keyword afro-like
        if not dept and (salon.get("afro_signal") or {}).get("score", 0) < 1:
            return False
        self.salons[pid] = salon
        return True

    def run_text_pass(self) -> None:
        for q in TEXT_QUERIES:
            key = f"t|{q}"
            if key in self.search_done:
                continue
            if len(self.salons) >= TARGET:
                return
            print(f"Text '{q}' (have {len(self.salons)})")
            places = self.search_text(q, lat=48.8566, lng=2.3522, radius_m=50000)
            added = sum(1 for p in places if self.ingest(p, q))
            self.search_done.add(key)
            self.save_checkpoint()
            print(f"  +{added} -> {len(self.salons)}")

    def run_grid_pass(self, keywords: List[str]) -> None:
        for point in SEARCH_POINTS:
            for kw in keywords:
                key = f"g|{point['name']}|{kw}"
                if key in self.search_done:
                    continue
                if len(self.salons) >= TARGET:
                    return
                print(f"Grid {point['name']} / {kw} (have {len(self.salons)})")
                places = self.search_nearby(point["lat"], point["lng"], kw)
                added = sum(1 for p in places if self.ingest(p, kw))
                self.search_done.add(key)
                self.save_checkpoint()
                print(f"  +{added} -> {len(self.salons)}")

    def export_json(self) -> Tuple[List[str], str]:
        salons = list(self.salons.values())
        salons.sort(
            key=lambda s: (
                -int((s.get("afro_signal") or {}).get("score") or 0),
                -(s.get("nombre_avis") or 0),
                s.get("nom") or "",
            )
        )
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        paths: List[str] = []
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
            "api": "Places API (New)",
            "target": TARGET,
            "count_unique": len(salons),
            "target_reached": len(salons) >= TARGET,
            "with_any_review_api": sum(1 for s in salons if s.get("nb_avis_api")),
            "with_negative_review_api": sum(1 for s in salons if s.get("nb_avis_negatifs_api")),
            "note": (
                "Place Details/Search exposes at most ~5 reviews per place. "
                "5000 unique afro IDF salons may exceed real market size; export is max unique found."
            ),
            "shards": [os.path.basename(p) for p in paths],
            "all": os.path.basename(all_path),
            "avis_negatifs_index": os.path.basename(neg_path),
        }
        summary_path = os.path.join(OUT_DIR, f"SUMMARY_{ts}.json")
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        return paths + [all_path, neg_path, summary_path], summary_path


def smoke_test(api_key: str) -> None:
    r = requests.post(
        f"{BASE}/places:searchText",
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "places.id,places.displayName",
        },
        json={"textQuery": "coiffure afro Paris", "languageCode": "fr", "maxResultCount": 3},
        timeout=30,
    )
    if r.status_code >= 400:
        print(r.status_code, r.text[:800])
        raise SystemExit(
            "Places API (New) not usable. Enable 'Places API (New)' + billing, "
            "and allow this key (IP or none for local scripts)."
        )
    data = r.json()
    n = len(data.get("places") or [])
    print(f"Smoke OK — {n} sample places")


def main() -> None:
    if not API_KEY:
        raise SystemExit("Set GOOGLE_PLACES_API_KEY (do not hardcode in files).")
    print(f"Target={TARGET} | out={OUT_DIR}")
    print("Rotate any key pasted in chat; restrict key to Places API (New).")
    smoke_test(API_KEY)

    ex = Extractor(API_KEY)
    ex.run_text_pass()
    ex.run_grid_pass(KEYWORDS_CORE)
    if len(ex.salons) < TARGET:
        print(f"Under target ({len(ex.salons)}/{TARGET}) — extra keywords")
        ex.run_grid_pass(KEYWORDS_EXTRA)

    paths, summary_path = ex.export_json()
    print(f"\nDone: {len(ex.salons)} unique")
    print(f"Summary: {summary_path}")
    for p in paths:
        print(f"  → {p}")


if __name__ == "__main__":
    main()
