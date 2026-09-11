"""
Skedisy — Prompt 1 / Étape 1
Classification des établissements à partir de extract_afro_avis_idf.

Règles:
- Ne jamais classer afro avec confiance élevée sur le seul nom.
- Séparer faits / hypothèses.
- Ne déduire aucune info absente du JSON (pas d'IG/FB inventés).
- Ignorer tout champ sensible (password, etc. — absents ici).
"""

from __future__ import annotations

import csv
import json
import os
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

SCRIPT_DIR = Path(__file__).resolve().parent
EXTRACT_DIR = SCRIPT_DIR.parent / "extract_afro_avis_idf"
CHECKPOINT = EXTRACT_DIR / "_checkpoint.json"
OUT_DIR = SCRIPT_DIR

# --- patterns (faits textuels uniquement) ---
PATTERNS: Dict[str, List[re.Pattern]] = {
    "coiffure afro": [
        re.compile(r"\bafro\b", re.I),
        re.compile(r"\bantillais(?:e|es)?\b", re.I),
        re.compile(r"\bafricain(?:e|es)?\b", re.I),
        re.compile(r"\bcheveux\s+cr[eé]pus\b", re.I),
        re.compile(r"\bnappy\b", re.I),
        re.compile(r"\bblack\s+hair\b", re.I),
        re.compile(r"\bethnic\s+hair\b", re.I),
        re.compile(r"\btexturis[eé]s?\b", re.I),
    ],
    "barber afro": [
        re.compile(r"\bbarber\s+afro\b", re.I),
        re.compile(r"\bbarbier\s+afro\b", re.I),
        re.compile(r"\bafro\s+barber\b", re.I),
    ],
    "braids / tresses": [
        re.compile(r"\btresses?\b", re.I),
        re.compile(r"\bbraids?\b", re.I),
        re.compile(r"\bknotless\b", re.I),
        re.compile(r"\bbox\s*braids?\b", re.I),
        re.compile(r"\bcornrows?\b", re.I),
        re.compile(r"\bnattes?\b", re.I),
        re.compile(r"\bs[eé]n[eé]galais(?:e|es)?\b", re.I),
        re.compile(r"\bghana\s*braids?\b", re.I),
        re.compile(r"\bvanilles?\b", re.I),
    ],
    "locks / cheveux naturels": [
        re.compile(r"\blocks?\b", re.I),
        re.compile(r"\bdreadlocks?\b", re.I),
        re.compile(r"\bcheveux\s+naturels?\b", re.I),
        re.compile(r"\btwist(?:s|out)?\b", re.I),
        re.compile(r"\brasta\b", re.I),
    ],
    "perruques / lace": [
        re.compile(r"\bperruques?\b", re.I),
        re.compile(r"\bwigs?\b", re.I),
        re.compile(r"\blace\s*(?:front|wig)?\b", re.I),
        re.compile(r"\bclosure\b", re.I),
        re.compile(r"\bfrontal\b", re.I),
    ],
    "extensions": [
        re.compile(r"\bextensions?\b", re.I),
        re.compile(r"\btissage\b", re.I),
        re.compile(r"\bweave\b", re.I),
    ],
    "coiffure européenne": [
        re.compile(r"\bcoloriste\b", re.I),
        re.compile(r"\bbalayage\b", re.I),
        re.compile(r"\bm[eé]ches?\b", re.I),
        re.compile(r"\bbrushing\b", re.I),
    ],
    "esthétique": [
        re.compile(r"\besth[eé]tique\b", re.I),
        re.compile(r"\binstitut\b", re.I),
        re.compile(r"\bongles?\b", re.I),
        re.compile(r"\bnails?\b", re.I),
        re.compile(r"\bmanucure\b", re.I),
    ],
    "spa": [
        re.compile(r"\bspa\b", re.I),
        re.compile(r"\bmassage\b", re.I),
        re.compile(r"\bhead\s*spa\b", re.I),
    ],
}

BARBER_GENERAL = [
    re.compile(r"\bbarbier\b", re.I),
    re.compile(r"\bbarber\b", re.I),
    re.compile(r"\bbarbershop\b", re.I),
]

AFRO_FAMILY = {
    "coiffure afro",
    "barber afro",
    "braids / tresses",
    "locks / cheveux naturels",
    "perruques / lace",
    "extensions",
    "salon mixte",
}

BOOKING_MAP = [
    ("planity.com", "Planity"),
    ("fresha.com", "Fresha"),
    ("treatwell.", "Treatwell"),
    ("booksy.com", "Booksy"),
    ("simplybook", "SimplyBook"),
    ("calendly.com", "Calendly"),
    ("appointfix.com", "Appointfix"),
    ("resalib.fr", "Resalib"),
    ("doctolib.fr", "Doctolib"),
    ("skedisy.", "Skedisy"),
]


def find_hits(text: str, patterns: List[re.Pattern]) -> List[str]:
    hits = []
    for re_pat in patterns:
        m = re_pat.search(text or "")
        if m:
            hits.append(m.group(0).lower())
    return sorted(set(hits))


def parse_ville_dept(adresse: str, localisation: Optional[Dict]) -> Tuple[str, str]:
    dept = ""
    if localisation and localisation.get("departement"):
        dept = str(localisation["departement"])
    m = re.search(r"\b(75|77|78|91|92|93|94|95)\d{3}\b", adresse or "")
    if m and not dept:
        dept = m.group(1)
    ville = ""
    # "..., 93200 Saint-Denis, France" or "..., Saint-Denis, France"
    if adresse:
        parts = [p.strip() for p in adresse.split(",")]
        for p in parts:
            if re.search(r"\b(75|77|78|91|92|93|94|95)\d{3}\b", p):
                ville = re.sub(r"^\d{5}\s*", "", p).strip()
                break
        if not ville and len(parts) >= 2:
            # before France
            for p in reversed(parts):
                if p.lower() in ("france", "île-de-france", "ile-de-france"):
                    continue
                if re.fullmatch(r"\d{5}", p):
                    continue
                ville = p
                break
    return ville, dept


def extract_socials_and_site(website: str) -> Dict[str, str]:
    w = (website or "").strip()
    out = {"site": "", "instagram": "", "facebook": "", "tiktok": "", "is_echo": False}
    if not w:
        return out
    low = w.lower()
    if "instagram.com" in low:
        out["instagram"] = w
    elif "facebook.com" in low or "fb.com" in low:
        out["facebook"] = w
    elif "tiktok.com" in low:
        out["tiktok"] = w
    else:
        out["site"] = w
        if any(
            x in low
            for x in (
                "frmaps.",
                "google.com/maps",
                "g.page/",
                "goo.gl/maps",
                "maps.app.goo.gl",
            )
        ):
            out["is_echo"] = True
    return out


def detect_booking(website: str) -> str:
    low = (website or "").lower()
    if not low:
        return ""
    for needle, label in BOOKING_MAP:
        if needle in low:
            return label
    return ""


def load_salons() -> List[Dict[str, Any]]:
    """Prefer live checkpoint (most complete), else latest ALL export."""
    if CHECKPOINT.is_file():
        data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
        salons = data.get("salons") or []
        if salons:
            print(f"Source: checkpoint ({len(salons)} salons, updated={data.get('updated_at')})")
            return salons
    alls = sorted(EXTRACT_DIR.glob("salons_afro_idf_ALL_*.json"), key=lambda p: p.stat().st_mtime)
    if not alls:
        raise SystemExit(f"No extract data in {EXTRACT_DIR}")
    salons = json.loads(alls[-1].read_text(encoding="utf-8"))
    print(f"Source: {alls[-1].name} ({len(salons)})")
    return salons


def classify(salon: Dict[str, Any]) -> Dict[str, Any]:
    nom = salon.get("nom") or ""
    site_raw = salon.get("site") or ""
    cats = salon.get("categorie") or []
    avis = salon.get("avis") or []
    avis_neg = salon.get("avis_negatifs") or []
    kw_source = ((salon.get("afro_signal") or {}).get("keyword_source")) or ""

    socials = extract_socials_and_site(site_raw)
    booking = detect_booking(site_raw)
    ville, dept = parse_ville_dept(salon.get("adresse") or "", salon.get("localisation"))

    # Corpus de faits présents dans le JSON
    avis_text = " ".join(
        (a.get("texte") or "") for a in (avis + avis_neg) if isinstance(a, dict)
    )
    types_text = " ".join(str(t) for t in cats)
    # keyword_source = requête de recherche Google (biais de collecte) → signal FAIBLE / hypothèse
    name_text = nom
    site_text = "" if socials["is_echo"] else (socials["site"] or site_raw)

    signals_used: List[str] = []
    if nom:
        signals_used.append("nom")
    if cats:
        signals_used.append("catégories Google")
    if site_raw:
        if socials["instagram"]:
            signals_used.append("réseaux sociaux (URL Instagram dans site)")
        elif socials["facebook"]:
            signals_used.append("réseaux sociaux (URL Facebook dans site)")
        elif socials["tiktok"]:
            signals_used.append("réseaux sociaux (URL TikTok dans site)")
        elif socials["is_echo"]:
            signals_used.append("site (URL annuaire/GMB — non indépendante)")
        else:
            signals_used.append("site")
    if avis_text.strip():
        signals_used.append("avis clients (textes Google API)")
    if kw_source:
        signals_used.append("mot-clé de recherche (biais collecte — non preuve métier)")

    score: Dict[str, float] = {}
    evidence: Dict[str, Dict[str, List[str]]] = {}

    def add_cat(cat: str, source: str, hits: List[str], weight: float) -> None:
        if not hits:
            return
        score[cat] = score.get(cat, 0) + weight * len(hits)
        evidence.setdefault(cat, {"nom": [], "avis": [], "site": [], "categories": [], "keyword_recherche": []})
        evidence[cat][source] = sorted(set(evidence[cat].get(source, []) + hits))

    for cat, pats in PATTERNS.items():
        add_cat(cat, "nom", find_hits(name_text, pats), 1.5)
        add_cat(cat, "avis", find_hits(avis_text, pats), 2.0)  # avis = source indépendante forte
        add_cat(cat, "site", find_hits(site_text, pats), 1.2)
        # catégories Google: hair_care / beauty_salon / barber_shop — pas de type "afro"
        # on ne score pas afro depuis types génériques

    # Barber afro = barber + afro family signal
    barber_hits = find_hits(name_text + " " + avis_text + " " + site_text, BARBER_GENERAL)
    afro_hits_all = find_hits(
        name_text + " " + avis_text + " " + site_text, PATTERNS["coiffure afro"]
    )
    if barber_hits and afro_hits_all:
        score["barber afro"] = score.get("barber afro", 0) + 3
        evidence.setdefault(
            "barber afro",
            {"nom": [], "avis": [], "site": [], "categories": [], "keyword_recherche": []},
        )
        evidence["barber afro"]["nom"] = sorted(
            set(find_hits(name_text, BARBER_GENERAL + PATTERNS["coiffure afro"]))
        )

    # Types Google
    types_l = [str(t).lower() for t in cats]
    if "barber_shop" in types_l and not afro_hits_all:
        # barbier générique possible
        pass
    if "spa" in types_l or "beauty_salon" in types_l:
        pass

    # Keyword search: weak only — record as hypothesis signal, small weight
    if kw_source:
        for cat, pats in PATTERNS.items():
            hits = find_hits(kw_source, pats)
            if hits:
                add_cat(cat, "keyword_recherche", hits, 0.3)

    facts: List[str] = []
    hypotheses: List[str] = []
    raisons: List[str] = []

    ranked = sorted(score.items(), key=lambda x: -x[1])

    categorie = "inconnu"
    confiance = "faible"
    bucket = "uncertain"
    deep_dive = False

    def independent_sources(cat: str) -> Set[str]:
        ev = evidence.get(cat) or {}
        srcs = set()
        for k in ("nom", "avis", "site", "categories"):
            if ev.get(k):
                srcs.add(k)
        # keyword_recherche alone never counts as independent proof
        return srcs

    if not ranked:
        if barber_hits and not afro_hits_all:
            categorie = "autre"
            confiance = "moyen"
            facts.append(f"Signal barbier/barber dans texte public: {', '.join(barber_hits)}")
            hypotheses.append("Barbier généraliste possible — afro non vérifié.")
            raisons.append("Barbier sans signal afro explicite → hors périmètre afro.")
            bucket = "hors_perimetre"
        elif find_hits(name_text + " " + site_text, PATTERNS["spa"]):
            categorie = "spa"
            confiance = "moyen"
            facts.append(f"Signal spa: {', '.join(find_hits(name_text + ' ' + site_text, PATTERNS['spa']))}")
            bucket = "hors_perimetre"
            raisons.append("Signal spa/massage sans signal afro.")
        elif find_hits(name_text + " " + site_text, PATTERNS["esthétique"]):
            categorie = "esthétique"
            confiance = "moyen"
            facts.append(
                f"Signal esthétique: {', '.join(find_hits(name_text + ' ' + site_text, PATTERNS['esthétique']))}"
            )
            bucket = "hors_perimetre"
            raisons.append("Signal esthétique/ongles sans signal afro coiffure.")
        elif "hair_care" in types_l or "beauty_salon" in types_l:
            categorie = "inconnu"
            confiance = "faible"
            facts.append(f"Catégories Google: {', '.join(cats[:6])}")
            facts.append("Aucun lexique afro/braids/locks/tissage trouvé dans nom, site ou avis API.")
            hypotheses.append(
                "Trouvé via recherche afro mais type métier non confirmé par le contenu disponible."
            )
            raisons.append(
                "Présence dans l'extract (recherche afro) sans preuve textuelle de spécialisation afro."
            )
            bucket = "uncertain"
            deep_dive = False
        else:
            categorie = "inconnu"
            confiance = "faible"
            facts.append("Information publique insuffisante dans le JSON pour typer le salon.")
            bucket = "uncertain"
            deep_dive = False
            raisons.append("Pas de signal discriminant.")
    else:
        top_cat, top_score = ranked[0]
        categorie = top_cat
        srcs = independent_sources(top_cat)
        ev = evidence.get(top_cat) or {}

        # Multi-category → salon mixte?
        afro_cats_hit = [c for c, _ in ranked if c in AFRO_FAMILY and c != "salon mixte"]
        if len(afro_cats_hit) >= 3 and top_cat in AFRO_FAMILY:
            # several service lines
            if "coiffure afro" in afro_cats_hit and any(
                x in afro_cats_hit for x in ("braids / tresses", "locks / cheveux naturels", "extensions")
            ):
                # keep top or mixte
                if top_score < ranked[1][1] * 1.2 and ranked[1][0] in AFRO_FAMILY:
                    categorie = "salon mixte"
                    raisons.append(
                        f"Plusieurs lignes afro détectées: {', '.join(afro_cats_hit[:4])} → salon mixte."
                    )

        # Confidence: never élevé on name alone for afro family
        if categorie in AFRO_FAMILY:
            if "avis" in srcs and len(srcs) >= 2:
                confiance = "élevé"
            elif "avis" in srcs and ev.get("avis"):
                confiance = "moyen"  # avis alone is independent of search bias
                if len(ev.get("avis") or []) >= 2:
                    confiance = "élevé"
            elif "nom" in srcs and "site" in srcs and not socials["is_echo"]:
                confiance = "moyen"
            elif "nom" in srcs and not srcs - {"nom"}:
                confiance = "faible"
                hypotheses.append(
                    "Classification principalement basée sur le nom — à vérifier (règle: pas de confiance élevée sur nom seul)."
                )
            elif "keyword_recherche" in (evidence.get(categorie) or {}) and len(srcs) <= 1:
                confiance = "faible"
            else:
                confiance = "moyen" if srcs else "faible"

            # Name-only afro → never élevé
            if srcs == {"nom"}:
                confiance = "faible"

            for src, hits in (ev or {}).items():
                if hits and src != "keyword_recherche":
                    facts.append(f"[{src}] matches {categorie}: {', '.join(hits[:8])}")
            if (ev or {}).get("keyword_recherche"):
                hypotheses.append(
                    f"Requête de collecte contenait: {', '.join(ev['keyword_recherche'])} (biais, pas preuve)."
                )

            if confiance == "élevé":
                bucket = "afro_pertinent"
                deep_dive = True
            elif confiance == "moyen":
                bucket = "afro_pertinent"
                deep_dive = True
            else:
                bucket = "uncertain"
                deep_dive = False

            raisons.append(
                f"Catégorie proposée={categorie}; sources indépendantes={sorted(srcs)}; confiance={confiance}."
            )
        else:
            # européenne / esthétique / spa
            if "nom" in srcs or "site" in srcs or "avis" in srcs:
                confiance = "moyen" if len(srcs) >= 1 else "faible"
            bucket = "hors_perimetre"
            for src, hits in (ev or {}).items():
                if hits and src != "keyword_recherche":
                    facts.append(f"[{src}] matches {categorie}: {', '.join(hits[:8])}")
            raisons.append(f"Hors spécialisation afro prioritaire ({categorie}).")

        # Second opinion: if only européenne but keyword was afro search → uncertain
        if categorie == "coiffure européenne" and kw_source and re.search(
            r"afro|tresse|braid|black|afric", kw_source, re.I
        ):
            hypotheses.append(
                "Trouvé via requête afro mais lexique plutôt européen dans le contenu — vérifier mixité réelle."
            )
            bucket = "uncertain"
            deep_dive = True

    # Non-hair noise
    noise_types = {"bakery", "food", "restaurant", "bar", "cafe", "clothing_store", "mosque", "church"}
    if any(t in noise_types for t in types_l) and categorie in ("inconnu", "autre"):
        bucket = "hors_perimetre"
        faits_extra = f"Types Google hors beauté coiffure: {[t for t in types_l if t in noise_types]}"
        facts.append(faits_extra)
        raisons.append("Établissement probablement hors périmètre coiffure.")

    # Worth deep dive: high-signal pertinent, or uncertain with volume + weak afro lexical hint
    nb_avis = salon.get("nombre_avis") or 0
    nb_neg = salon.get("nb_avis_negatifs_api") or 0
    if bucket == "afro_pertinent":
        if confiance == "élevé" or nb_neg >= 1 or nb_avis >= 30:
            deep_dive = True
        elif confiance == "moyen" and nb_avis >= 15:
            deep_dive = True
    elif bucket == "uncertain":
        weak_afro = bool(
            find_hits(
                name_text + " " + avis_text,
                PATTERNS["coiffure afro"] + PATTERNS["braids / tresses"],
            )
        )
        if (nb_avis >= 80 or nb_neg >= 2) and weak_afro:
            deep_dive = True

    row = {
        "google_place_id": salon.get("google_place_id"),
        "nom": nom,
        "ville": ville,
        "departement": dept,
        "adresse": salon.get("adresse"),
        "categorie": categorie,
        "niveau_confiance": confiance,
        "raisons_classification": " | ".join(raisons),
        "signaux_utilises": ", ".join(signals_used),
        "faits": facts,
        "hypotheses": hypotheses,
        "site": socials["site"] or (site_raw if not socials["instagram"] and not socials["facebook"] and not socials["tiktok"] else ""),
        "telephone": salon.get("telephone") or "",
        "instagram": socials["instagram"],
        "facebook": socials["facebook"],
        "tiktok": socials["tiktok"],
        "systeme_reservation": booking,
        "note_google": salon.get("note"),
        "nombre_avis_google": salon.get("nombre_avis"),
        "nb_avis_textes_api": salon.get("nb_avis_api") or 0,
        "nb_avis_negatifs_api": salon.get("nb_avis_negatifs_api") or 0,
        "avis": avis,
        "avis_negatifs": avis_neg,
        "horaires": salon.get("horaires"),
        "localisation": salon.get("localisation"),
        "categories_google": cats,
        "keyword_recherche_collecte": kw_source,
        "bucket": bucket,
        "merite_analyse_approfondie": deep_dive,
        "maps_url": salon.get("maps_url") or "",
        "evidence": evidence.get(categorie) if categorie in evidence else evidence,
    }
    return row


def write_csv(path: Path, rows: List[Dict[str, Any]], fields: List[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            flat = dict(r)
            flat["faits"] = " || ".join(r.get("faits") or [])
            flat["hypotheses"] = " || ".join(r.get("hypotheses") or [])
            flat["categories_google"] = " | ".join(r.get("categories_google") or [])
            flat["evidence"] = json.dumps(r.get("evidence") or {}, ensure_ascii=False)
            flat["avis"] = json.dumps(r.get("avis") or [], ensure_ascii=False)
            flat["avis_negatifs"] = json.dumps(r.get("avis_negatifs") or [], ensure_ascii=False)
            flat["horaires"] = json.dumps(r.get("horaires") or {}, ensure_ascii=False)
            flat["localisation"] = json.dumps(r.get("localisation") or {}, ensure_ascii=False)
            w.writerow(flat)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    salons = load_salons()
    classified = [classify(s) for s in salons]

    pertinent = [r for r in classified if r["bucket"] == "afro_pertinent"]
    uncertain = [r for r in classified if r["bucket"] == "uncertain"]
    hors = [r for r in classified if r["bucket"] == "hors_perimetre"]
    deep = [r for r in classified if r.get("merite_analyse_approfondie")]

    # sort: confiance then neg reviews
    conf_rank = {"élevé": 0, "moyen": 1, "faible": 2}

    def sort_key(r: Dict) -> Tuple:
        return (
            conf_rank.get(r.get("niveau_confiance") or "", 9),
            -(r.get("nb_avis_negatifs_api") or 0),
            -(r.get("nombre_avis_google") or 0),
            r.get("nom") or "",
        )

    pertinent.sort(key=sort_key)
    uncertain.sort(key=sort_key)

    export_fields = [
        "google_place_id",
        "nom",
        "ville",
        "departement",
        "categorie",
        "niveau_confiance",
        "raisons_classification",
        "signaux_utilises",
        "faits",
        "hypotheses",
        "site",
        "telephone",
        "instagram",
        "facebook",
        "tiktok",
        "systeme_reservation",
        "note_google",
        "nombre_avis_google",
        "nb_avis_textes_api",
        "nb_avis_negatifs_api",
        "avis",
        "avis_negatifs",
        "merite_analyse_approfondie",
        "maps_url",
        "adresse",
        "localisation",
        "horaires",
        "categories_google",
        "keyword_recherche_collecte",
        "bucket",
    ]

    (OUT_DIR / "AFRO_pertinents.json").write_text(
        json.dumps(pertinent, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "UNCERTAIN_a_verifier.json").write_text(
        json.dumps(uncertain, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "HORS_perimetre.json").write_text(
        json.dumps(hors, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "ALL_classified.json").write_text(
        json.dumps(classified, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "DEEP_DIVE_candidats.json").write_text(
        json.dumps(deep, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    write_csv(OUT_DIR / "AFRO_pertinents.csv", pertinent, export_fields)
    write_csv(OUT_DIR / "UNCERTAIN_a_verifier.csv", uncertain, export_fields)

    # Index négatifs pour analyse produit (pertinents + incertains + deep dive)
    neg_index = []
    for r in pertinent + uncertain:
        negs = r.get("avis_negatifs") or []
        if not negs:
            continue
        neg_index.append(
            {
                "google_place_id": r.get("google_place_id"),
                "nom": r.get("nom"),
                "ville": r.get("ville"),
                "departement": r.get("departement"),
                "categorie": r.get("categorie"),
                "niveau_confiance": r.get("niveau_confiance"),
                "bucket": r.get("bucket"),
                "note_google": r.get("note_google"),
                "nombre_avis_google": r.get("nombre_avis_google"),
                "avis": r.get("avis") or [],
                "avis_negatifs": negs,
                "site": r.get("site"),
                "telephone": r.get("telephone"),
                "systeme_reservation": r.get("systeme_reservation"),
                "merite_analyse_approfondie": r.get("merite_analyse_approfondie"),
            }
        )
    neg_index.sort(
        key=lambda x: (-len(x.get("avis_negatifs") or []), -(x.get("nombre_avis_google") or 0))
    )
    (OUT_DIR / "AVIS_NEGATIFS_pour_produit.json").write_text(
        json.dumps(neg_index, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    cat_c = Counter(r["categorie"] for r in pertinent)
    conf_c = Counter(r["niveau_confiance"] for r in pertinent)
    with_avis = sum(1 for r in classified if r.get("nb_avis_textes_api"))
    with_neg = sum(1 for r in classified if r.get("nb_avis_negatifs_api"))
    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": str(CHECKPOINT if CHECKPOINT.is_file() else "ALL export"),
        "input_count": len(salons),
        "afro_pertinent": len(pertinent),
        "uncertain": len(uncertain),
        "hors_perimetre": len(hors),
        "merite_analyse_approfondie": len(deep),
        "with_avis_in_outputs": with_avis,
        "with_avis_negatifs_in_outputs": with_neg,
        "salons_avec_negatifs_index_produit": len(neg_index),
        "pertinent_par_categorie": dict(cat_c),
        "pertinent_par_confiance": dict(conf_c),
        "method_notes": [
            "Confiance élevée jamais attribuée sur le seul nom pour les catégories afro.",
            "Les textes d'avis Google (API, ≤5/salon) sont inclus dans chaque fiche (avis + avis_negatifs).",
            "Le mot-clé de recherche de collecte est un biais, pas une preuve métier.",
            "Instagram/Facebook/TikTok / système de réservation renseignés uniquement si présents dans le champ site.",
            "Faits et hypothèses sont des listes séparées dans chaque fiche.",
        ],
        "outputs": [
            "AFRO_pertinents.json / .csv (avec avis + avis_negatifs)",
            "UNCERTAIN_a_verifier.json / .csv (avec avis + avis_negatifs)",
            "HORS_perimetre.json",
            "ALL_classified.json",
            "DEEP_DIVE_candidats.json",
            "AVIS_NEGATIFS_pour_produit.json",
        ],
    }
    (OUT_DIR / "SUMMARY_etape1.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
