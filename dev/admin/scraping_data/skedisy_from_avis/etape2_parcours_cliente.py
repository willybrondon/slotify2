"""
Skedisy Prompt 2 — Enquête publique parcours cliente (faits vs non_verifie).

Sources:
- avis / avis_negatifs déjà extraits (Google Places API)
- sites web publics (HTTP GET)
- liens Planity/Fresha/Booksy/WhatsApp détectés sur les pages
- Instagram/Facebook/TikTok: uniquement URLs publiques détectées (pas de login, pas de DM privés)

Ne tente jamais d'accéder à des conversations WhatsApp/Instagram privées.
"""

from __future__ import annotations

import csv
import json
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

SCRIPT_DIR = Path(__file__).resolve().parent
INPUT = SCRIPT_DIR / "AFRO_pertinents.json"
OUT_DIR = SCRIPT_DIR
TIMEOUT = 12
MAX_BYTES = 450_000
MAX_WORKERS = 6

TOOL_MAP = [
    ("planity.com", "Planity"),
    ("widget.planity", "Planity"),
    ("fresha.com", "Fresha"),
    ("treatwell.", "Treatwell"),
    ("booksy.com", "Booksy"),
    ("calendly.com", "Calendly"),
    ("resalib.fr", "Resalib"),
    ("simplybook", "SimplyBook"),
    ("appointfix.com", "Appointfix"),
    ("salonized.com", "Salonized"),
    ("skedisy.", "Skedisy"),
    ("wa.me/", "WhatsApp"),
    ("api.whatsapp.com", "WhatsApp"),
    ("whatsapp.com/send", "WhatsApp"),
]

# Review problem detectors: (id, label, patterns, gravite_default)
REVIEW_PROBLEMS = [
    (
        "attente_retard",
        "Attente / retard au salon",
        [r"\bretard", r"\battendre", r"\battente", r"\bh?eures?\s+d.?attente", r"\blate\b", r"\bwait"],
        "haute",
    ),
    (
        "annulation_noshow",
        "Annulation / no-show / RDV non honoré",
        [r"\bannul", r"\bno[\s-]?show", r"\brdv\s+annul", r"\brendez[\s-]?vous\s+annul", r"\bpas\s+venu"],
        "haute",
    ),
    (
        "acompte",
        "Acompte / arrhes / paiement anticipé",
        [r"\bacompte", r"\barrhes", r"\bdeposit", r"\bcaution"],
        "moyenne",
    ),
    (
        "prix_ecart",
        "Écart prix annoncé / prix final ou prix jugés excessifs",
        [
            r"\bprix",
            r"\bcher",
            r"\bcouteux",
            r"\bsuppl[eé]ment",
            r"\bplus\s+cher",
            r"\beuros?",
            r"\btrop\s+cher",
            r"\barnaque",
            r"\bfactur",
        ],
        "haute",
    ),
    (
        "reservation_difficile",
        "Difficultés de réservation / disponibilité",
        [
            r"\br[eé]serv",
            r"\bdisponib",
            r"\bcr[eé]neau",
            r"\bimpossible\s+de\s+(prendre|avoir)",
            r"\bpas\s+de\s+r[eé]ponse",
            r"\brdv",
        ],
        "haute",
    ),
    (
        "communication",
        "Problèmes de communication / relance",
        [
            r"\bwhatsapp",
            r"\br[eé]pond(re|u|pas)",
            r"\bmessage",
            r"\bt[eé]l[eé]phone",
            r"\bappel",
            r"\bdm\b",
            r"\binstagram",
            r"\bjoign",
        ],
        "haute",
    ),
    (
        "qualite_cheveux",
        "Qualité / dommages cheveux ou mèches",
        [
            r"\bm[eè]ches?",
            r"\bcheveux",
            r"\bbr[uû]l",
            r"\bab[iî]m",
            r"\bcass[eé]",
            r"\btissage",
            r"\bextensions?",
            r"\bqualit[eé]",
            r"\br[eé]sultat",
            r"\bpulv[eé]ris",
        ],
        "haute",
    ),
    (
        "duree_prestation",
        "Durée de prestation / trop long",
        [r"\bheures?", r"\bdur[eé]e", r"\btrop\s+long", r"\b\d+\s*h\b", r"\bjourn[eé]e"],
        "moyenne",
    ),
    (
        "comprehension_prestation",
        "Malentendu sur la prestation demandée",
        [
            r"\bpas\s+(ce\s+que|du\s+tout)",
            r"\bdiff[eé]rent",
            r"\bpas\s+demand[eé]",
            r"\bcompris",
            r"\bexplique",
            r"\battendais",
        ],
        "haute",
    ),
    (
        "hygiene_accueil",
        "Hygiène / accueil",
        [r"\bhygi[eè]ne", r"\bsale", r"\baccueil", r"\bimpoli", r"\brude", r"\bm[eé]pris"],
        "moyenne",
    ),
]


def fetch_url(url: str) -> Dict[str, Any]:
    if not url or not str(url).startswith(("http://", "https://")):
        return {"ok": False, "status": 0, "html": "", "finalUrl": url or "", "error": "invalid_url"}
    try:
        req = Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; SkedisyResearchBot/1.0; +https://skedisy.com)",
                "Accept": "text/html,application/xhtml+xml",
            },
            method="GET",
        )
        with urlopen(req, timeout=TIMEOUT) as resp:
            raw = resp.read(MAX_BYTES + 1)
            truncated = len(raw) > MAX_BYTES
            html = raw[:MAX_BYTES].decode("utf-8", errors="replace")
            final = resp.geturl()
            return {
                "ok": 200 <= getattr(resp, "status", 200) < 400,
                "status": getattr(resp, "status", 200),
                "html": html,
                "finalUrl": final,
                "error": "truncated" if truncated else "",
            }
    except HTTPError as e:
        body = ""
        try:
            body = e.read(MAX_BYTES).decode("utf-8", errors="replace")
        except Exception:
            pass
        return {"ok": False, "status": e.code, "html": body, "finalUrl": url, "error": f"http_{e.code}"}
    except Exception as e:
        return {"ok": False, "status": 0, "html": "", "finalUrl": url, "error": str(e)[:200]}


def html_text(html: str) -> str:
    t = re.sub(r"<script[\s\S]*?</script>", " ", html or "", flags=re.I)
    t = re.sub(r"<style[\s\S]*?</style>", " ", t, flags=re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = t.replace("&nbsp;", " ")
    return re.sub(r"\s+", " ", t).strip()


def extract_hrefs(html: str, base: str) -> List[str]:
    hrefs = []
    for m in re.finditer(r"""href=["']([^"']+)["']""", html or "", re.I):
        href = m.group(1)
        try:
            hrefs.append(urljoin(base, href))
        except Exception:
            hrefs.append(href)
    return hrefs


def detect_tools(blob: str) -> List[str]:
    low = (blob or "").lower()
    found = []
    for needle, label in TOOL_MAP:
        if needle in low and label not in found:
            found.append(label)
    return found


def find_social_links(hrefs: List[str]) -> Dict[str, List[str]]:
    out = {"instagram": [], "facebook": [], "tiktok": [], "whatsapp": [], "booking": []}
    for h in hrefs:
        low = h.lower()
        if "instagram.com" in low:
            out["instagram"].append(h)
        elif "facebook.com" in low or "fb.com" in low:
            out["facebook"].append(h)
        elif "tiktok.com" in low:
            out["tiktok"].append(h)
        elif any(x in low for x in ("wa.me/", "api.whatsapp.com", "whatsapp.com/send")):
            out["whatsapp"].append(h)
        elif any(
            x in low
            for x in ("planity.com", "fresha.com", "treatwell.", "booksy.com", "calendly.com", "resalib.fr")
        ):
            out["booking"].append(h)
    for k in out:
        out[k] = sorted(set(out[k]))[:8]
    return out


def site_policy_signals(text: str) -> Dict[str, List[str]]:
    low = (text or "").lower()
    signals = {
        "acompte": [],
        "annulation": [],
        "retard": [],
        "photo": [],
        "avant_rdv": [],
        "faq": [],
    }
    snippets = []

    def grab(pat: str, key: str) -> None:
        for m in re.finditer(pat, text or "", re.I):
            start = max(0, m.start() - 40)
            end = min(len(text), m.end() + 80)
            snip = re.sub(r"\s+", " ", text[start:end]).strip()
            if snip and snip not in signals[key]:
                signals[key].append(snip[:180])

    grab(r"acompte|arrhes|deposit|caution", "acompte")
    grab(r"annulation|annuler|no[\s-]?show|non\s+pr[eé]sentation", "annulation")
    grab(r"retard|en\s+cas\s+de\s+retard|tolerance", "retard")
    grab(r"photo|envoyer\s+une\s+photo|envoie[rz]?\s+.*(photo|image)", "photo")
    grab(r"avant\s+(le\s+)?rendez[\s-]?vous|pr[eé]parez|instructions?", "avant_rdv")
    if re.search(r"\bfaq\b|questions?\s+fr[eé]quentes", low):
        signals["faq"].append("Section FAQ détectée (contenu non exhaustif)")
    return signals


def prestation_complexity(text: str) -> List[str]:
    found = []
    pats = [
        (r"box\s*braids?", "Box braids"),
        (r"knotless", "Knotless braids"),
        (r"tresses?", "Tresses"),
        (r"vanilles?", "Vanilles"),
        (r"locks?|dread", "Locks / dreadlocks"),
        (r"tissage", "Tissage"),
        (r"extensions?", "Extensions"),
        (r"lace|perruque|wig", "Perruques / lace"),
        (r"twist", "Twists"),
        (r"d[eé]frisage|lissage", "Défrisage / lissage"),
        (r"cornrows?|nattes?", "Cornrows / nattes"),
    ]
    low = text or ""
    for pat, label in pats:
        if re.search(pat, low, re.I) and label not in found:
            found.append(label)
    return found


def analyze_reviews(avis: List[Dict], avis_neg: List[Dict]) -> Tuple[List[Dict], Dict[str, int]]:
    problems = []
    counts: Dict[str, int] = {}
    corpus = avis_neg if avis_neg else [a for a in avis if a.get("negatif") or (isinstance(a.get("note"), (int, float)) and a.get("note") <= 3)]
    # Also scan all avis for themes (positive may mention wait too)
    all_for_scan = avis or []

    for pid, label, pats, grav in REVIEW_PROBLEMS:
        matched = []
        for a in all_for_scan:
            texte = a.get("texte") or ""
            note = a.get("note")
            if not texte:
                continue
            if any(re.search(p, texte, re.I) for p in pats):
                # Prefer negative/low rating as stronger problem signal
                is_neg = a.get("negatif") or (isinstance(note, (int, float)) and note <= 3)
                matched.append(
                    {
                        "note": note,
                        "negatif": bool(is_neg),
                        "extrait": texte[:280],
                        "auteur": a.get("auteur"),
                        "relative_time": a.get("relative_time"),
                    }
                )
        # Keep if at least one negative match, or 2+ matches overall for soft themes
        neg_matched = [m for m in matched if m["negatif"]]
        use = neg_matched if neg_matched else (matched if len(matched) >= 2 and pid in ("duree_prestation", "reservation_difficile") else [])
        # For price/quality/wait: require at least one negative
        if pid in ("prix_ecart", "qualite_cheveux", "attente_retard", "communication", "comprehension_prestation", "annulation_noshow", "acompte", "hygiene_accueil"):
            use = neg_matched
        if not use:
            continue
        counts[pid] = len(use)
        preuve = use[0]["extrait"]
        problems.append(
            {
                "probleme": label,
                "preuve": f"Avis Google note={use[0].get('note')}: « {preuve} »",
                "source": "Google Places API (avis salon)",
                "type": "fait",
                "frequence": f"{len(use)} avis API matchant (sur ≤5 renvoyés)",
                "gravite": grav,
                "impact": "Impact financier non mesuré ici — hypothèse interdite sans preuve chiffrée",
                "solution_actuelle": "Non identifiable depuis les seuls avis",
                "opportunite_skedisy": _opp_for(pid),
                "theme_id": pid,
                "exemples": use[:3],
            }
        )
    return problems, counts


def _opp_for(pid: str) -> str:
    return {
        "attente_retard": "Estimation durée réaliste + buffer + confirmation J-1",
        "annulation_noshow": "Acompte + politique claire + rappels auto",
        "acompte": "Acompte intégré au funnel de réservation",
        "prix_ecart": "Devis verrouillé (longueur/masse/photo) avant créneau",
        "reservation_difficile": "Self-serve créneaux + file d'attente intelligente",
        "communication": "Inbox unifiée (WA/IG/web) avec qualification structurée",
        "qualite_cheveux": "Brief photo + attentes documentées avant prestation",
        "duree_prestation": "Qualification durée selon texture/longueur/volume",
        "comprehension_prestation": "Parcours guidé prestation + validation visuelle",
        "hygiene_accueil": "Standards opérationnels / check-in expérience",
    }.get(pid, "Parcours afro guidé (qualif → devis → acompte)")


def build_fiche(salon: Dict[str, Any], site_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    nom = salon.get("nom") or ""
    site = (salon.get("site") or "").strip()
    phone = salon.get("telephone") or ""
    avis = salon.get("avis") or []
    avis_neg = salon.get("avis_negatifs") or []
    booking_known = salon.get("systeme_reservation") or ""

    review_problems, theme_counts = analyze_reviews(avis, avis_neg)

    tools: List[str] = []
    if booking_known:
        tools.append(booking_known)
    socials_from_class = {
        "instagram": [salon["instagram"]] if salon.get("instagram") else [],
        "facebook": [salon["facebook"]] if salon.get("facebook") else [],
        "tiktok": [salon["tiktok"]] if salon.get("tiktok") else [],
    }

    site_facts: Dict[str, Any] = {
        "fetch": None,
        "tools": [],
        "social_links": {},
        "policies": {},
        "prestations_detectees": [],
        "whatsapp_public": [],
        "booking_hrefs": [],
        "non_verifie": [],
    }

    if site_data:
        site_facts["fetch"] = {
            "ok": site_data.get("ok"),
            "status": site_data.get("status"),
            "error": site_data.get("error"),
            "finalUrl": site_data.get("finalUrl"),
        }
        if site_data.get("ok") or site_data.get("html"):
            html = site_data.get("html") or ""
            text = html_text(html)
            hrefs = extract_hrefs(html, site_data.get("finalUrl") or site)
            social = find_social_links(hrefs)
            tools_site = detect_tools(html + " " + (site_data.get("finalUrl") or ""))
            for t in tools_site:
                if t not in tools:
                    tools.append(t)
            site_facts["tools"] = tools_site
            site_facts["social_links"] = social
            site_facts["policies"] = site_policy_signals(text)
            site_facts["prestations_detectees"] = prestation_complexity(text)
            site_facts["whatsapp_public"] = social.get("whatsapp") or []
            site_facts["booking_hrefs"] = social.get("booking") or []
            for k in ("instagram", "facebook", "tiktok"):
                for u in social.get(k) or []:
                    if u not in socials_from_class[k]:
                        socials_from_class[k].append(u)
        else:
            site_facts["non_verifie"].append(f"Site non récupérable: {site_data.get('error')}")
    elif site:
        site_facts["non_verifie"].append("URL site présente mais fetch non exécuté")
    else:
        site_facts["non_verifie"].append("Pas de site dans les données d'extract")

    # Instagram/FB/TikTok content: not scraped — explicit non_verifie
    social_notes = {
        "instagram": {
            "urls_publiques": socials_from_class["instagram"],
            "contenu_commentaires_dm": "non_verifie — pas d'accès API/login; aucun DM privé consulté",
        },
        "facebook": {
            "urls_publiques": socials_from_class["facebook"],
            "contenu": "non_verifie sans page publique crawlée ici",
        },
        "tiktok": {
            "urls_publiques": socials_from_class["tiktok"],
            "contenu": "non_verifie — signaux TikTok non collectés dans cette passe",
        },
    }

    # A Acquisition
    canaux = []
    if (salon.get("nombre_avis_google") or 0) > 0:
        canaux.append("Google (présence avis / fiche Maps)")
    if socials_from_class["instagram"]:
        canaux.append("Instagram (URL publique détectée)")
    if socials_from_class["tiktok"]:
        canaux.append("TikTok (URL publique détectée)")
    if socials_from_class["facebook"]:
        canaux.append("Facebook (URL publique détectée)")
    if any(t in tools for t in ("Planity", "Fresha", "Booksy", "Treatwell")):
        canaux.append("Plateforme de réservation")
    if site:
        canaux.append("Site web")
    A = {
        "canaux_apparents_faits": canaux,
        "principal_apparent": canaux[0] if canaux else "non_determinable",
        "note": "Le canal d'acquisition PRINCIPAL n'est pas prouvable sans analytics — liste = canaux visibles seulement.",
    }

    # B Reservation
    modes = []
    if phone:
        modes.append("Téléphone public")
    for t in tools:
        if t in ("Planity", "Fresha", "Booksy", "Treatwell", "Calendly", "Resalib", "SimplyBook"):
            modes.append(t)
        if t == "WhatsApp":
            modes.append("WhatsApp (lien public wa.me / bouton site)")
    if socials_from_class["instagram"]:
        modes.append("Instagram (canal possible — réservation via DM: non_verifie)")
    if site and not any(t in tools for t in ("Planity", "Fresha", "Booksy", "Treatwell", "Calendly")):
        if "WhatsApp" not in tools:
            modes.append("Site sans widget booking classique détecté")
    B = {
        "modes_detectes_faits": sorted(set(modes)),
        "outils": tools or ["aucun système identifiable sur sources consultées"],
        "booking_hrefs": site_facts.get("booking_hrefs") or [],
        "whatsapp_liens_publics": site_facts.get("whatsapp_public") or [],
    }

    # C Qualification
    qualif = []
    pol = site_facts.get("policies") or {}
    if pol.get("photo"):
        qualif.append({"type": "fait", "detail": "Demande de photo mentionnée sur le site", "extraits": pol["photo"][:2]})
    if pol.get("avant_rdv"):
        qualif.append({"type": "fait", "detail": "Instructions avant RDV sur le site", "extraits": pol["avant_rdv"][:2]})
    if any(t in tools for t in ("Planity", "Fresha", "Booksy")):
        qualif.append(
            {
                "type": "fait",
                "detail": f"Parcours { [t for t in tools if t in ('Planity','Fresha','Booksy')][0] } : choix prestation/créneau typique (détail champs non exhaustif sans parcours compte).",
            }
        )
    if not qualif:
        qualif.append(
            {
                "type": "non_verifie",
                "detail": "Informations exigées avant confirmation non visibles dans les sources consultées (possible via WA/DM non accessibles).",
            }
        )
    C = {"infos_avant_confirmation": qualif}

    # D Paiement
    D = []
    if pol.get("acompte"):
        D.append({"type": "fait", "detail": "Politique d'acompte/arrhes mentionnée sur le site", "extraits": pol["acompte"][:2]})
    else:
        D.append(
            {
                "type": "fait_absence_sur_sources",
                "detail": "Aucune politique d'acompte clairement extraite du site/HTML consulté.",
            }
        )
    # From negative reviews mentioning acompte
    for rp in review_problems:
        if rp.get("theme_id") == "acompte":
            D.append({"type": "fait", "detail": "Acompte évoqué dans avis clients", "preuve": rp["preuve"]})

    # E Complexité
    E = site_facts.get("prestations_detectees") or []
    # From category classification
    cat = salon.get("categorie")
    if cat and cat not in E:
        E = list(E) + [f"Catégorie classifiée: {cat}"]
    # From review mentions
    for label in prestation_complexity(" ".join((a.get("texte") or "") for a in avis)):
        if label not in E:
            E.append(label)
    if not E:
        E = ["non_determinable sur sources consultées"]

    # F Problems = review + site structural
    F = list(review_problems)
    if site and not any(t in tools for t in ("Planity", "Fresha", "Booksy", "Treatwell", "Calendly")):
        F.append(
            {
                "probleme": "Pas de widget de réservation classique détecté sur le site (Planity/Fresha/Booksy/Calendly)",
                "preuve": f"Outils détectés sur site: {site_facts.get('tools') or 'aucun'}",
                "source": site or "site manquant",
                "type": "fait" if site_data and site_data.get("ok") else "fait_si_site_ok",
                "frequence": "structurelle",
                "gravite": "haute",
                "impact": "Friction réservation — hypothèse d'impact business non chiffrée",
                "solution_actuelle": ", ".join(B["modes_detectes_faits"]) or "Non identifiable",
                "opportunite_skedisy": "Réservation guidée afro + qualification + acompte",
            }
        )
    if site_data and site_data.get("ok") and not (pol.get("acompte")):
        F.append(
            {
                "probleme": "Politique d'acompte non visible clairement sur le site",
                "preuve": "Aucun extrait acompte/arrhes/deposit trouvé dans le HTML analysé",
                "source": site_data.get("finalUrl") or site,
                "type": "fait_absence_sur_page",
                "frequence": "n/a",
                "gravite": "moyenne",
                "impact": "Hypothèse: risque no-show — non prouvé par ce seul signal",
                "solution_actuelle": "Non identifiable",
                "opportunite_skedisy": "Acompte intégré au funnel",
            }
        )
    if site_facts.get("whatsapp_public"):
        F.append(
            {
                "probleme": "WhatsApp utilisé comme canal public de contact/réservation (conversations privées non lues)",
                "preuve": f"Liens publics: {', '.join(site_facts['whatsapp_public'][:3])}",
                "source": site_data.get("finalUrl") if site_data else site,
                "type": "fait",
                "frequence": "structurelle",
                "gravite": "moyenne",
                "impact": "Charge opérationnelle DM — hypothèse",
                "solution_actuelle": "WhatsApp public",
                "opportunite_skedisy": "Structurer la demande WA → devis/durée/acompte",
            }
        )

    # G Tools
    G = {
        "logiciels_detectes": tools or ["aucun système identifiable"],
        "whatsapp_public_detecte": bool(site_facts.get("whatsapp_public") or "WhatsApp" in tools),
        "instagram_url": socials_from_class["instagram"],
        "facebook_url": socials_from_class["facebook"],
        "tiktok_url": socials_from_class["tiktok"],
    }

    # H Preuves = embedded in F
    return {
        "google_place_id": salon.get("google_place_id"),
        "salon": nom,
        "ville": salon.get("ville"),
        "departement": salon.get("departement"),
        "telephone_public": phone,
        "url_site": site,
        "categorie_etape1": salon.get("categorie"),
        "niveau_confiance_etape1": salon.get("niveau_confiance"),
        "note_google": salon.get("note_google"),
        "nombre_avis_google": salon.get("nombre_avis_google"),
        "nb_avis_api": salon.get("nb_avis_textes_api"),
        "nb_avis_negatifs_api": salon.get("nb_avis_negatifs_api"),
        "avis": avis,
        "avis_negatifs": avis_neg,
        "A_acquisition": A,
        "B_reservation": B,
        "C_qualification": C,
        "D_paiement": D,
        "E_complexite_prestations": E,
        "F_problemes": F,
        "G_outils": G,
        "H_preuves": "Chaque problème dans F_problemes contient preuve + source",
        "site_analyse": site_facts,
        "reseaux_limites": social_notes,
        "themes_avis_counts": theme_counts,
        "limites_enquete": [
            "Instagram/Facebook/TikTok: pas de scrape commentaires/DM (privé ou login).",
            "WhatsApp: seuls boutons/liens publics; aucune conversation lue.",
            "Google: ≤5 avis texte par salon via API.",
            "Treatwell/forums/Reddit: non couverts exhaustivement dans cette passe automatisée.",
        ],
    }


def write_matrice(fiches: List[Dict[str, Any]], path: Path) -> int:
    rows = []
    for f in fiches:
        for p in f.get("F_problemes") or []:
            rows.append(
                {
                    "Salon": f.get("salon"),
                    "Ville": f.get("ville"),
                    "Departement": f.get("departement"),
                    "Categorie": f.get("categorie_etape1"),
                    "Probleme": p.get("probleme"),
                    "Preuve": p.get("preuve"),
                    "Source": p.get("source"),
                    "Frequence_apparente": p.get("frequence"),
                    "Gravite": p.get("gravite"),
                    "Impact_financier_potentiel": p.get("impact"),
                    "Solution_actuelle_utilisee": p.get("solution_actuelle"),
                    "Opportunite_pour_Skedisy": p.get("opportunite_skedisy"),
                    "Type": p.get("type"),
                    "google_place_id": f.get("google_place_id"),
                }
            )
    fields = [
        "Salon",
        "Probleme",
        "Preuve",
        "Source",
        "Frequence_apparente",
        "Gravite",
        "Impact_financier_potentiel",
        "Solution_actuelle_utilisee",
        "Opportunite_pour_Skedisy",
        "Ville",
        "Departement",
        "Categorie",
        "Type",
        "google_place_id",
    ]
    with path.open("w", encoding="utf-8-sig", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    path.with_suffix(".json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    return len(rows)


def main() -> None:
    salons = json.loads(INPUT.read_text(encoding="utf-8"))
    print(f"Prompt2: {len(salons)} salons afro pertinents")

    # Fetch sites in parallel
    to_fetch = [(i, s) for i, s in enumerate(salons) if (s.get("site") or "").startswith("http")]
    site_results: Dict[int, Dict] = {}
    print(f"Fetching {len(to_fetch)} sites...")

    def job(item: Tuple[int, Dict]) -> Tuple[int, Dict]:
        i, s = item
        return i, fetch_url(s.get("site"))

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futs = [ex.submit(job, it) for it in to_fetch]
        done = 0
        for fut in as_completed(futs):
            i, data = fut.result()
            site_results[i] = data
            done += 1
            if done % 25 == 0:
                print(f"  sites {done}/{len(to_fetch)}")

    # Optional: fetch a few booking pages linked from sites (Planity etc.) — light pass
    booking_extra: Dict[str, Dict] = {}
    for i, data in list(site_results.items()):
        if not data.get("html"):
            continue
        hrefs = extract_hrefs(data["html"], data.get("finalUrl") or "")
        social = find_social_links(hrefs)
        for burl in (social.get("booking") or [])[:1]:
            if burl not in booking_extra:
                booking_extra[burl] = fetch_url(burl)
                time.sleep(0.15)

    fiches = []
    for i, s in enumerate(salons):
        sd = site_results.get(i)
        fiche = build_fiche(s, sd)
        # Enrich policies from booking page if linked
        hrefs = (fiche.get("site_analyse") or {}).get("booking_hrefs") or []
        for burl in hrefs[:1]:
            bdata = booking_extra.get(burl)
            if bdata and bdata.get("html"):
                btext = html_text(bdata["html"])
                extra_pol = site_policy_signals(btext)
                tools_b = detect_tools(bdata["html"] + " " + burl)
                for t in tools_b:
                    if t not in fiche["G_outils"]["logiciels_detectes"]:
                        fiche["G_outils"]["logiciels_detectes"].append(t)
                # merge prestations
                for p in prestation_complexity(btext):
                    if p not in fiche["E_complexite_prestations"]:
                        fiche["E_complexite_prestations"].append(p)
                fiche["site_analyse"]["booking_page"] = {
                    "url": burl,
                    "ok": bdata.get("ok"),
                    "policies": extra_pol,
                    "tools": tools_b,
                }
                # If acompte found on booking page, add fact
                if extra_pol.get("acompte"):
                    fiche["D_paiement"].append(
                        {
                            "type": "fait",
                            "detail": "Acompte mentionné sur page réservation",
                            "extraits": extra_pol["acompte"][:2],
                            "source": burl,
                        }
                    )
        fiches.append(fiche)

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    fiches_path = OUT_DIR / "DEEP_FICHES_parcours_cliente.json"
    fiches_path.write_text(json.dumps(fiches, ensure_ascii=False, indent=2), encoding="utf-8")

    n_rows = write_matrice(fiches, OUT_DIR / "DEEP_MATRICE_problemes.csv")

    # Patterns
    theme_c: Dict[str, int] = {}
    tool_c: Dict[str, int] = {}
    for f in fiches:
        for k, v in (f.get("themes_avis_counts") or {}).items():
            theme_c[k] = theme_c.get(k, 0) + 1  # salons with theme
        for t in f.get("G_outils", {}).get("logiciels_detectes") or []:
            tool_c[t] = tool_c.get(t, 0) + 1

    patterns = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "n_salons": len(fiches),
        "sites_ok": sum(1 for i in site_results.values() if i.get("ok")),
        "salons_avec_probleme_avis": sum(1 for f in fiches if any(p.get("type") == "fait" and p.get("theme_id") for p in f.get("F_problemes") or [])),
        "themes_avis_par_salon_count": dict(sorted(theme_c.items(), key=lambda x: -x[1])),
        "outils_detectes": dict(sorted(tool_c.items(), key=lambda x: -x[1])),
        "matrice_rows": n_rows,
    }
    (OUT_DIR / "DEEP_PATTERNS_opportunite.json").write_text(
        json.dumps(patterns, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Short rapport
    top_themes = list(patterns["themes_avis_par_salon_count"].items())[:8]
    top_tools = list(patterns["outils_detectes"].items())[:8]
    rapport = f"""# Prompt 2 — Parcours cliente (enquête publique)

Généré: {patterns['generated_at']}
Salons analysés: **{len(fiches)}** (AFRO_pertinents)
Sites fetch OK: **{patterns['sites_ok']}**
Lignes matrice problèmes: **{n_rows}**

## Limites (explicites)
- Pas de DM Instagram / conversations WhatsApp privées
- TikTok/Facebook commentaires: non crawlés en masse
- Google: ≤5 avis texte/salon (API)
- Canal d'acquisition « principal » = visible, pas prouvé analytics

## Thèmes problèmes (avis) — nb salons touchés
{chr(10).join(f"- {k}: {v}" for k,v in top_themes) or "- (peu de matches négatifs structurés)"}

## Outils détectés
{chr(10).join(f"- {k}: {v}" for k,v in top_tools)}

## Livrables
- `DEEP_FICHES_parcours_cliente.json` (A–H + avis)
- `DEEP_MATRICE_problemes.csv` / `.json`
- `DEEP_PATTERNS_opportunite.json`
"""
    (OUT_DIR / "DEEP_RAPPORT_parcours_cliente.md").write_text(rapport, encoding="utf-8")

    summary = {
        "generated_at": patterns["generated_at"],
        "input": str(INPUT.name),
        "n_fiches": len(fiches),
        "sites_fetched_ok": patterns["sites_ok"],
        "matrice_rows": n_rows,
        "outputs": [
            "DEEP_FICHES_parcours_cliente.json",
            "DEEP_MATRICE_problemes.csv",
            "DEEP_MATRICE_problemes.json",
            "DEEP_PATTERNS_opportunite.json",
            "DEEP_RAPPORT_parcours_cliente.md",
        ],
    }
    (OUT_DIR / "SUMMARY_etape2.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
