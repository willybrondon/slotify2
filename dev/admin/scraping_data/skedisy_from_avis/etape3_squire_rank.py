"""
Skedisy Prompt 3 — Analyse SQUIRE des problèmes structurels
Source: DEEP_* + AFRO_pertinents (329 salons IDF).

Principe: ranking « je paierais pour ça » (WTP pro), pas sexy tech.
Confiance faible = pénalité forte au score.
"""

from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

SCRIPT_DIR = Path(__file__).resolve().parent
FICHES = SCRIPT_DIR / "DEEP_FICHES_parcours_cliente.json"
MATRICE = SCRIPT_DIR / "DEEP_MATRICE_problemes.json"
PATTERNS = SCRIPT_DIR / "DEEP_PATTERNS_opportunite.json"
PERTINENTS = SCRIPT_DIR / "AFRO_pertinents.json"

CATEGORIES = {
    1: "Acquisition",
    2: "Réservation",
    3: "Qualification de la cliente",
    4: "WhatsApp / Instagram / DM",
    5: "Gestion des prestations",
    6: "Gestion du planning",
    7: "Durée réelle des prestations",
    8: "Prix et devis",
    9: "Acompte",
    10: "Annulation",
    11: "No-show",
    12: "Retard",
    13: "Gestion des clientes",
    14: "Fidélisation",
    15: "Réactivation",
    16: "Paiement",
    17: "Organisation des employés",
    18: "Gestion des coiffeuses indépendantes",
    19: "Gestion des mèches/produits",
    20: "Avis/réputation",
    21: "Communication avec la cliente",
    22: "Autres problèmes spécifiques à la coiffure afro",
}


def pct(n: int, n_total: int) -> float:
    return round(100.0 * n / max(n_total, 1), 1)


def score_composite(p: Dict[str, Any]) -> float:
    conf = p["confiance_score"]
    pot = (
        p["wtp"] * 0.28
        + p["impact_eco"] * 0.2
        + p["gravite"] * 0.12
        + p["frequence"] * 0.1
        + p["difficulte_actuelle"] * 0.05
        + conf * 0.25
    )
    return round(pot, 1)


def main() -> None:
    fiches = json.loads(FICHES.read_text(encoding="utf-8"))
    matrice = json.loads(MATRICE.read_text(encoding="utf-8"))
    patterns = json.loads(PATTERNS.read_text(encoding="utf-8"))
    pertinents = json.loads(PERTINENTS.read_text(encoding="utf-8"))
    N = len(fiches)
    themes = patterns.get("themes_avis_par_salon_count") or {}
    tools = patterns.get("outils_detectes") or {}

    # Structural counts from matrice
    pb_count = Counter(r.get("Probleme") for r in matrice)
    no_widget = sum(1 for k, v in pb_count.items() if k and "widget de réservation" in k)
    no_acompte_site = sum(1 for k, v in pb_count.items() if k and "Politique d'acompte" in k)
    # Those keys are full problem strings with counts as values
    no_widget = pb_count.get(
        "Pas de widget de réservation classique détecté sur le site (Planity/Fresha/Booksy/Calendly)",
        0,
    )
    # Fuzzy match if truncated
    if not no_widget:
        no_widget = sum(v for k, v in pb_count.items() if k and "widget de réservation" in k)
    no_acompte_site = sum(v for k, v in pb_count.items() if k and "Politique d'acompte" in k)
    wa_public = sum(v for k, v in pb_count.items() if k and "WhatsApp utilisé" in k)

    # Category distribution (complexity proxy)
    cat_c = Counter(p.get("categorie") for p in pertinents)
    complex_cats = sum(
        cat_c[c]
        for c in (
            "braids / tresses",
            "locks / cheveux naturels",
            "extensions",
            "perruques / lace",
            "salon mixte",
            "coiffure afro",
        )
    )

    planity_n = tools.get("Planity", 0)
    aucun_sys = tools.get("aucun système identifiable", 0)
    wa_tool = tools.get("WhatsApp", 0)

    # Salons with Planity that STILL have price/quality/duration review themes
    planity_ids = set()
    for f in fiches:
        tools_f = (f.get("G_outils") or {}).get("logiciels_detectes") or []
        if "Planity" in tools_f:
            planity_ids.add(f.get("google_place_id"))
    planity_still_pain = 0
    for f in fiches:
        if f.get("google_place_id") not in planity_ids:
            continue
        tc = f.get("themes_avis_counts") or {}
        if any(tc.get(k) for k in ("prix_ecart", "qualite_cheveux", "duree_prestation", "comprehension_prestation", "attente_retard")):
            planity_still_pain += 1

    def ex_preuves(theme_id: str, limit: int = 3) -> List[str]:
        out = []
        for f in fiches:
            for p in f.get("F_problemes") or []:
                if p.get("theme_id") == theme_id:
                    out.append(f"{f.get('salon')}: {p.get('preuve', '')[:160]}")
                    if len(out) >= limit:
                        return out
        return out

    PROBLEMS: List[Dict[str, Any]] = [
        {
            "id": "P01",
            "categories": [3, 5, 22],
            "probleme": "Impossible de confirmer automatiquement une prestation afro complexe sans qualification (texture, longueur, mèches, style, photo)",
            "preuves": [
                f"{complex_cats}/{N} salons classés dans des lignes afro complexes (tresses/locks/extensions/mixte/afro)",
                f"{themes.get('comprehension_prestation', 0)} salons avec avis négatifs sur malentendu de prestation",
                f"{aucun_sys}/{N} sans système booking classique → confirmation souvent humaine",
            ]
            + ex_preuves("comprehension_prestation", 2),
            "salons_concernes": complex_cats,
            "note_comptage": "Proxy structurel: catégories afro complexes Étape 1 + avis malentendu. Confiance élevée sur la nature du vertical.",
            "gravite": 9,
            "frequence": 9,
            "impact_eco": 9,
            "difficulte_actuelle": 9,
            "cout_potentiel": "Reprises gratuites, créneaux perdus, litiges, temps staff en DM",
            "outils": "Planity menus plats, WhatsApp, téléphone, site",
            "pourquoi_pas_resolu": "Planity/Fresha/Booksy vendent un créneau sur une liste; ils ne font pas le diagnostic afro (photo, mèches, état). WhatsApp « résout » au prix du chaos ops.",
            "confiance": "élevé",
            "confiance_score": 8,
            "wtp": 10,
        },
        {
            "id": "P02",
            "categories": [7, 6, 12],
            "probleme": "La durée réelle déborde le créneau théorique → planning en accordéon et retards en chaîne",
            "preuves": [
                f"{themes.get('duree_prestation', 0)} salons avec avis évoquant durée/trop long",
                f"{themes.get('attente_retard', 0)} salons avec avis attente/retard",
                f"{planity_still_pain} salons Planity ont encore des thèmes durée/prix/qualité/attente dans les avis API",
            ]
            + ex_preuves("duree_prestation", 2)
            + ex_preuves("attente_retard", 1),
            "salons_concernes": max(themes.get("duree_prestation", 0), themes.get("attente_retard", 0)),
            "note_comptage": "Comptage avis API (≤5/salon). Sous-estimation probable de la fréquence réelle. Structurel pour tresses/locks.",
            "gravite": 9,
            "frequence": 8,
            "impact_eco": 9,
            "difficulte_actuelle": 8,
            "cout_potentiel": "Heures perdues, clients suivants mécontents, overtime staff",
            "outils": "Durées fixes Planity/Fresha, négociation WhatsApp",
            "pourquoi_pas_resolu": "Durée catalogue fixe ≠ durée réelle (masse, longueur, texture, mèches). Les agendas généralistes ne capturent pas ces variables.",
            "confiance": "élevé",
            "confiance_score": 8,
            "wtp": 10,
        },
        {
            "id": "P03",
            "categories": [8, 16, 21],
            "probleme": "Prix final imprévisible (suppléments, devis, écart vs annoncé)",
            "preuves": [
                f"{themes.get('prix_ecart', 0)} salons avec avis négatifs prix/écart/supplément",
                f"{planity_n} salons sur Planity — le catalogue n'empêche pas les litiges prix",
            ]
            + ex_preuves("prix_ecart", 3),
            "salons_concernes": themes.get("prix_ecart", 0),
            "note_comptage": "Preuves directes via avis API. % = salons avec ≥1 avis négatif prix dans l'échantillon API.",
            "gravite": 8,
            "frequence": 7,
            "impact_eco": 8,
            "difficulte_actuelle": 7,
            "cout_potentiel": "Chargebacks de confiance, avis 1★, abandons, reprises",
            "outils": "Prix catalogue Planity, devis oral WA/tél",
            "pourquoi_pas_resolu": "Afficher un prix ne verrouille pas le devis (longueur, mèches, état). Surprise tarifaire = litige classique.",
            "confiance": "élevé",
            "confiance_score": 8,
            "wtp": 9,
        },
        {
            "id": "P04",
            "categories": [2, 21],
            "probleme": "Réservation non instantanée / friction (pas de self-serve ou dispo opaque)",
            "preuves": [
                f"{no_widget}/{N} salons: aucun widget Planity/Fresha/Booksy/Calendly détecté sur le site",
                f"{aucun_sys}/{N} classés « aucun système identifiable »",
                f"{themes.get('reservation_difficile', 0)} salons avec avis difficultés réservation/dispo",
            ]
            + ex_preuves("reservation_difficile", 2),
            "salons_concernes": max(no_widget, themes.get("reservation_difficile", 0)),
            "note_comptage": "Signal structurel site très fort; avis dispo plus faibles (API limitée).",
            "gravite": 8,
            "frequence": 9,
            "impact_eco": 8,
            "difficulte_actuelle": 8,
            "cout_potentiel": "Leads perdus, file d'attente humaine, conversion basse",
            "outils": "Téléphone, Instagram DM (non_verifie), WhatsApp, parfois Planity",
            "pourquoi_pas_resolu": "Même avec Planity, le catalogue afro pousse souvent au contact manuel. Sans outil, 100% manuel.",
            "confiance": "élevé",
            "confiance_score": 8,
            "wtp": 9,
        },
        {
            "id": "P05",
            "categories": [4, 21, 2],
            "probleme": "WhatsApp / DM comme « OS » de réservation → charge mentale et perte d'info",
            "preuves": [
                f"{wa_public} salons avec lien WhatsApp public sur site",
                f"{wa_tool} détections WhatsApp dans outils",
                f"{themes.get('communication', 0)} salons avec avis problèmes de communication/relance",
                "Conversations privées non lues (limite éthique) — signal = canal public + plaintes com",
            ]
            + ex_preuves("communication", 2),
            "salons_concernes": max(wa_tool, themes.get("communication", 0), wa_public),
            "note_comptage": "Sous-estimation: beaucoup de salons utilisent WA/IG sans lien crawlable.",
            "gravite": 9,
            "frequence": 8,
            "impact_eco": 8,
            "difficulte_actuelle": 9,
            "cout_potentiel": "Heures owner/manager dans l'inbox, no-show faute de process",
            "outils": "WhatsApp, Instagram DM",
            "pourquoi_pas_resolu": "WA n'est pas un PMS: pas de devis structuré, pas d'acompte natif, pas de durée dynamique, historique client fragmenté.",
            "confiance": "moyen",
            "confiance_score": 6,
            "wtp": 10,
        },
        {
            "id": "P06",
            "categories": [9, 11, 10],
            "probleme": "Acompte / anti-no-show absent ou flou → risque de créneaux brûlés",
            "preuves": [
                f"{no_acompte_site}/{N} salons: politique d'acompte non visible sur site",
                f"{themes.get('acompte', 0)} avis API mentionnant acompte explicitement",
                f"{themes.get('annulation_noshow', 0)} avis API annulation/no-show (échantillon faible)",
            ],
            "salons_concernes": no_acompte_site,
            "note_comptage": "Absence sur site = fait. Fréquence no-show dans avis API très sous-représentée (≤5 avis, biais positifs possibles).",
            "gravite": 8,
            "frequence": 7,
            "impact_eco": 9,
            "difficulte_actuelle": 7,
            "cout_potentiel": "Créneaux 3–6h perdus = perte brute majeure",
            "outils": "Acompte manuel WA, parfois Planity pay, souvent rien de visible",
            "pourquoi_pas_resolu": "Planity peut encaisser mais n'impose pas un funnel afro (devis→acompte). WA acompte = frictions + litiges.",
            "confiance": "moyen",
            "confiance_score": 6,
            "wtp": 10,
        },
        {
            "id": "P07",
            "categories": [19, 5, 22],
            "probleme": "Gestion des mèches / supply cliente vs salon → litiges qualité et coût",
            "preuves": [
                f"{themes.get('qualite_cheveux', 0)} salons avec avis négatifs qualité/cheveux/mèches",
            ]
            + ex_preuves("qualite_cheveux", 3),
            "salons_concernes": themes.get("qualite_cheveux", 0),
            "note_comptage": "Thème #1 dans les avis négatifs API du sample.",
            "gravite": 9,
            "frequence": 8,
            "impact_eco": 8,
            "difficulte_actuelle": 8,
            "cout_potentiel": "Reprises, remboursement partiel, avis 1★, coût mèches",
            "outils": "Accord oral WA, notes perso",
            "pourquoi_pas_resolu": "Les agendas beauté ne gèrent pas « qui fournit les mèches / quelle qualité / validation photo ».",
            "confiance": "élevé",
            "confiance_score": 8,
            "wtp": 9,
        },
        {
            "id": "P08",
            "categories": [22, 7, 3],
            "probleme": "Méta-problème vertical: la prestation afro est un projet (devis + supply + 3–6h), pas une coupe 30 min",
            "preuves": [
                f"Distribution catégories: {dict(cat_c)}",
                "Durées longues et variables documentées dans avis durée/attente",
                "Outils détectés majoritairement absents ou généralistes",
            ],
            "salons_concernes": N,
            "note_comptage": "Problème méta — haute confiance conceptuelle, ancré dans la distribution du sample.",
            "gravite": 10,
            "frequence": 9,
            "impact_eco": 9,
            "difficulte_actuelle": 9,
            "cout_potentiel": "Underfit permanent des outils coupe-européenne → ops bricolées",
            "outils": "Adaptation bricolée Planity/WA",
            "pourquoi_pas_resolu": "SQUIRE a gagné en verticalisant le barbershop. Planity/Fresha restent des agendas beauté généralistes: underfit du workflow « projet capillaire afro ».",
            "confiance": "élevé",
            "confiance_score": 9,
            "wtp": 10,
        },
        {
            "id": "P09",
            "categories": [12, 6],
            "probleme": "Retards / attente cliente au salon",
            "preuves": [
                f"{themes.get('attente_retard', 0)} salons avec avis attente/retard",
            ]
            + ex_preuves("attente_retard", 3),
            "salons_concernes": themes.get("attente_retard", 0),
            "note_comptage": "Preuves avis. Souvent conséquence de P02.",
            "gravite": 7,
            "frequence": 7,
            "impact_eco": 7,
            "difficulte_actuelle": 7,
            "cout_potentiel": "Avis négatifs, churn, compensation",
            "outils": "Planning manuel, SMS informels",
            "pourquoi_pas_resolu": "Sans durée réelle amont, les rappels Planity ne corrigent pas le débordement.",
            "confiance": "élevé",
            "confiance_score": 7,
            "wtp": 8,
        },
        {
            "id": "P10",
            "categories": [21, 4],
            "probleme": "Communication / relance défaillante (pas de réponse, flou RDV)",
            "preuves": [
                f"{themes.get('communication', 0)} salons avec avis communication",
            ]
            + ex_preuves("communication", 3),
            "salons_concernes": themes.get("communication", 0),
            "note_comptage": "Avis API. Canaux IG/WA privés non audités.",
            "gravite": 7,
            "frequence": 7,
            "impact_eco": 7,
            "difficulte_actuelle": 8,
            "cout_potentiel": "Leads froids, no-show, mauvaise réputation",
            "outils": "WhatsApp, téléphone, IG",
            "pourquoi_pas_resolu": "Inbox multi-canal sans états (qualifié / devis envoyé / acompte payé).",
            "confiance": "élevé",
            "confiance_score": 7,
            "wtp": 8,
        },
        {
            "id": "P11",
            "categories": [20],
            "probleme": "Avis/réputation: plaintes visibles (qualité, prix, attente) sans boucle de prévention amont",
            "preuves": [
                f"{patterns.get('salons_avec_probleme_avis', 0)} salons avec ≥1 problème typé depuis avis",
                f"Thèmes top: qualité {themes.get('qualite_cheveux')}, prix {themes.get('prix_ecart')}, durée {themes.get('duree_prestation')}",
            ],
            "salons_concernes": patterns.get("salons_avec_probleme_avis", 0),
            "note_comptage": "Basé sur avis API négatifs/thèmes.",
            "gravite": 7,
            "frequence": 7,
            "impact_eco": 7,
            "difficulte_actuelle": 6,
            "cout_potentiel": "Perte acquisition Google (note / conversion fiche)",
            "outils": "Google Business, réponses manuelles",
            "pourquoi_pas_resolu": "Les outils booking ne préviennent pas le malentendu prestation/prix qui génère l'avis 1★.",
            "confiance": "élevé",
            "confiance_score": 7,
            "wtp": 7,
        },
        {
            "id": "P12",
            "categories": [2, 1],
            "probleme": "Acquisition Google → appel/DM sans conversion structurée",
            "preuves": [
                "Tous les salons du sample ont une fiche Google (source extract)",
                f"Majorité sans booking self-serve ({aucun_sys}/{N})",
            ],
            "salons_concernes": aucun_sys,
            "note_comptage": "Proxy: présence Google + absence outil booking.",
            "gravite": 6,
            "frequence": 8,
            "impact_eco": 7,
            "difficulte_actuelle": 6,
            "cout_potentiel": "CAC Google gaspillé si lead non converti",
            "outils": "Google Business, téléphone",
            "pourquoi_pas_resolu": "GMB amène le clic; n'optimise pas qualification ni conversion afro.",
            "confiance": "moyen",
            "confiance_score": 6,
            "wtp": 7,
        },
        {
            "id": "P13",
            "categories": [11, 10],
            "probleme": "No-show / annulations tardives",
            "preuves": [
                f"{themes.get('annulation_noshow', 0)} salons avec avis API annulation/no-show seulement",
                "Sous-détection forte probable (sujet rarement détaillé dans 5 avis)",
            ]
            + ex_preuves("annulation_noshow", 2),
            "salons_concernes": themes.get("annulation_noshow", 0),
            "note_comptage": "CONFIDENCE FAIBLE sur le volume — problème probable métier mais peu prouvé dans l'API.",
            "gravite": 9,
            "frequence": 6,
            "impact_eco": 9,
            "difficulte_actuelle": 7,
            "cout_potentiel": "Créneau long perdu",
            "outils": "Rappels Planity optionnels, acompte manuel",
            "pourquoi_pas_resolu": "Sans acompte + politique claire liés au devis afro, les rappels seuls ne suffisent pas.",
            "confiance": "faible",
            "confiance_score": 3,
            "wtp": 9,
        },
        {
            "id": "P14",
            "categories": [5, 6],
            "probleme": "Catalogue prestations afro trop granulaire / difficile à self-serve",
            "preuves": [
                f"Catégories braids={cat_c.get('braids / tresses', 0)}, locks={cat_c.get('locks / cheveux naturels', 0)}, extensions={cat_c.get('extensions', 0)}",
                f"{planity_n} sur Planity — preuve que catalogue existe mais complexité reste",
            ],
            "salons_concernes": cat_c.get("braids / tresses", 0)
            + cat_c.get("locks / cheveux naturels", 0)
            + cat_c.get("extensions", 0),
            "note_comptage": "Proxy catégories Étape 1.",
            "gravite": 7,
            "frequence": 8,
            "impact_eco": 6,
            "difficulte_actuelle": 7,
            "cout_potentiel": "Mauvaise sélection service → P02/P03",
            "outils": "Listes Planity longues",
            "pourquoi_pas_resolu": "Une liste plate de 40 services ≠ assistant de choix (texture→style→durée→prix).",
            "confiance": "moyen",
            "confiance_score": 6,
            "wtp": 8,
        },
        {
            "id": "P15",
            "categories": [14, 15, 13],
            "probleme": "Fidélisation / réactivation (entretien locks, reprise tissage) peu outillée",
            "preuves": [
                "Aucune automation reprise/entretien détectée dans les crawls site de cette passe",
                "Cycles afro (6–8 sem) non modélisés dans outils détectés",
            ],
            "salons_concernes": N // 2,
            "note_comptage": "Absence d'évidence ≠ absence totale. Confiance faible — hypothèse ops.",
            "gravite": 5,
            "frequence": 5,
            "impact_eco": 6,
            "difficulte_actuelle": 5,
            "cout_potentiel": "LTV non capturée",
            "outils": "WhatsApp manuel",
            "pourquoi_pas_resolu": "CRM beauté générique ignore les cycles d'entretien afro.",
            "confiance": "faible",
            "confiance_score": 3,
            "wtp": 6,
        },
        {
            "id": "P16",
            "categories": [17, 18],
            "probleme": "Organisation multi-coiffeuses / indépendantes (planning partagé, commissions)",
            "preuves": [
                "Non mesuré directement dans extract avis/sites (pas de signal RH public fiable)",
            ],
            "salons_concernes": 0,
            "note_comptage": "Non prouvé dans ce dataset → exclu du TOP si confiance trop basse, conservé pour exhaustivité catégories.",
            "gravite": 6,
            "frequence": 5,
            "impact_eco": 6,
            "difficulte_actuelle": 7,
            "cout_potentiel": "non_chiffre",
            "outils": "non_identifie",
            "pourquoi_pas_resolu": "Données insuffisantes dans notre sample public.",
            "confiance": "faible",
            "confiance_score": 2,
            "wtp": 5,
        },
        {
            "id": "P17",
            "categories": [16, 8],
            "probleme": "Paiement final déconnecté du devis digital",
            "preuves": [
                f"Litiges prix documentés sur {themes.get('prix_ecart', 0)} salons",
                "Peu de preuves de caisse connectée au devis dans crawl",
            ],
            "salons_concernes": themes.get("prix_ecart", 0),
            "note_comptage": "Inféré depuis litiges prix + absence process acompte visible.",
            "gravite": 5,
            "frequence": 6,
            "impact_eco": 5,
            "difficulte_actuelle": 5,
            "cout_potentiel": "Écarts encaissement / disputes",
            "outils": "CB/espèces salon, Planity pay-in-store",
            "pourquoi_pas_resolu": "Sans devis verrouillé amont, le paiement aval hérite du flou.",
            "confiance": "faible",
            "confiance_score": 4,
            "wtp": 6,
        },
        {
            "id": "P18",
            "categories": [20, 21],
            "probleme": "Hygiène / accueil dégradent la note Google",
            "preuves": [
                f"{themes.get('hygiene_accueil', 0)} salons avec avis hygiène/accueil",
            ]
            + ex_preuves("hygiene_accueil", 2),
            "salons_concernes": themes.get("hygiene_accueil", 0),
            "note_comptage": "Réel mais WTP logiciel plus faible (ops salon, pas core Skedisy).",
            "gravite": 6,
            "frequence": 5,
            "impact_eco": 5,
            "difficulte_actuelle": 4,
            "cout_potentiel": "Note Google",
            "outils": "Procédures manuelles",
            "pourquoi_pas_resolu": "Pas un problème de SaaS booking — hors wedge principal.",
            "confiance": "moyen",
            "confiance_score": 6,
            "wtp": 3,
        },
        {
            "id": "P19",
            "categories": [1, 4],
            "probleme": "Instagram/TikTok comme acquisition sans bridge réservation mesurable",
            "preuves": [
                "URLs IG/TikTok parfois détectées sur sites; contenu/DM non audités",
                "Pas de compteur conversion IG→RDV dans données publiques",
            ],
            "salons_concernes": sum(
                1
                for f in fiches
                if (f.get("G_outils") or {}).get("instagram_url")
                or (f.get("reseaux_limites") or {}).get("instagram", {}).get("urls_publiques")
            ),
            "note_comptage": "URLs seulement — confiance faible sur le pain exact.",
            "gravite": 6,
            "frequence": 6,
            "impact_eco": 6,
            "difficulte_actuelle": 7,
            "cout_potentiel": "DM non convertis",
            "outils": "Instagram, Linktree éventuel",
            "pourquoi_pas_resolu": "IG n'est pas un moteur de devis/durée/acompte.",
            "confiance": "faible",
            "confiance_score": 3,
            "wtp": 7,
        },
        {
            "id": "P20",
            "categories": [3, 8, 9],
            "probleme": "Wedge ops: Qualif → devis/durée → acompte (demande WA/IG → booking structuré)",
            "preuves": [
                "Convergence P01+P02+P03+P05+P06 dans le sample",
                f"Planity présent chez seulement {planity_n}/{N} — et {planity_still_pain} ont encore des douleurs avis",
                "Professionnel paie pour réduire chaos inbox + no-show + litige prix",
            ],
            "salons_concernes": N,
            "note_comptage": "Synthèse SQUIRE — pas un 50e feature, le job-to-be-done.",
            "gravite": 10,
            "frequence": 9,
            "impact_eco": 10,
            "difficulte_actuelle": 9,
            "cout_potentiel": "Cumule pertes créneau + reprise + temps owner",
            "outils": "WA + Planity partiel + téléphone",
            "pourquoi_pas_resolu": "Aucun concurrent ne couple diagnostic afro + engagement financier avant le créneau long.",
            "confiance": "élevé",
            "confiance_score": 8,
            "wtp": 10,
        },
        {
            "id": "P21",
            "categories": [13],
            "probleme": "Pas de fiche cliente structurée (historique prestations, photos, mèches)",
            "preuves": [
                "Non observable directement; inféré du recours WA et absences CRM dans crawls",
            ],
            "salons_concernes": N // 2,
            "note_comptage": "Confiance faible.",
            "gravite": 5,
            "frequence": 6,
            "impact_eco": 5,
            "difficulte_actuelle": 6,
            "cout_potentiel": "Re-qualification à chaque visite",
            "outils": "WhatsApp history",
            "pourquoi_pas_resolu": "WA n'est pas un dossier cliente métier.",
            "confiance": "faible",
            "confiance_score": 3,
            "wtp": 6,
        },
    ]

    # Category coverage map
    by_cat: Dict[int, List[str]] = defaultdict(list)
    for p in PROBLEMS:
        for c in p["categories"]:
            by_cat[c].append(p["id"])

    ranked = []
    for p in PROBLEMS:
        row = {
            **p,
            "categories_labels": [CATEGORIES[c] for c in p["categories"]],
            "pct_salons": pct(p["salons_concernes"], N),
            "potentiel_skedisy": min(10, round(p["wtp"] * 0.7 + p["impact_eco"] * 0.3)),
            "score_composite": score_composite(p),
            "n_sample": N,
        }
        ranked.append(row)

    ranked.sort(key=lambda x: (-x["score_composite"], -x["confiance_score"], -x["wtp"]))

    # Exclude near-zero evidence from TOP display? Keep but note — P16 will sink
    top20 = ranked[:20]

    # Outputs
    out_full = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "method": "SQUIRE-style WTP ranking on public sample",
        "n_salons_analyses": N,
        "data_sources": [
            "AFRO_pertinents.json",
            "DEEP_FICHES_parcours_cliente.json",
            "DEEP_MATRICE_problemes.json",
            "DEEP_PATTERNS_opportunite.json",
        ],
        "scoring": {
            "formula": "0.28*wtp + 0.20*impact_eco + 0.12*gravite + 0.10*frequence + 0.05*difficulte + 0.25*confiance",
            "principle": "Privilégier ce pour quoi un pro paierait; pénaliser le non-prouvé",
        },
        "categories_22": CATEGORIES,
        "coverage_par_categorie": {
            CATEGORIES[c]: by_cat.get(c, []) for c in sorted(CATEGORIES)
        },
        "sample_stats": {
            "themes_avis": themes,
            "outils": tools,
            "no_widget_site": no_widget,
            "no_acompte_visible_site": no_acompte_site,
            "planity_with_remaining_pain": planity_still_pain,
        },
        "all_problems_ranked": ranked,
        "top20": top20,
        "wedge_recommande": {
            "titre": "Pas un autre Planity — Qualif → devis/durée → acompte",
            "pourquoi": (
                "Les douleurs à plus fort WTP + preuves sont la qualification afro, "
                "la durée réelle, le prix/devis, le chaos WA/DM, et l'acompte anti-no-show. "
                "Planity couvre l'agenda mais underfit le projet capillaire afro."
            ),
            "ids": ["P20", "P01", "P02", "P03", "P05", "P06", "P07", "P08"],
        },
    }

    (SCRIPT_DIR / "SQUIRE_ANALYSIS.json").write_text(
        json.dumps(out_full, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # TOP20 CSV
    fields = [
        "Rang",
        "Problème",
        "Preuves",
        "Nombre_salons_concernes",
        "Pct_salons",
        "Gravite_10",
        "Frequence_10",
        "Impact_economique_10",
        "Difficulte_actuelle_10",
        "Solutions_existantes",
        "Pourquoi_Planity_Fresha_Booksy_WhatsApp_ne_resolvent_pas",
        "Potentiel_Skedisy_10",
        "Confiance",
        "Score_composite",
        "Categories",
        "Cout_potentiel",
        "Id",
    ]
    with (SCRIPT_DIR / "SQUIRE_TOP20.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for i, p in enumerate(top20, 1):
            w.writerow(
                {
                    "Rang": i,
                    "Problème": p["probleme"],
                    "Preuves": " || ".join(p["preuves"][:4]),
                    "Nombre_salons_concernes": p["salons_concernes"],
                    "Pct_salons": p["pct_salons"],
                    "Gravite_10": p["gravite"],
                    "Frequence_10": p["frequence"],
                    "Impact_economique_10": p["impact_eco"],
                    "Difficulte_actuelle_10": p["difficulte_actuelle"],
                    "Solutions_existantes": p["outils"],
                    "Pourquoi_Planity_Fresha_Booksy_WhatsApp_ne_resolvent_pas": p["pourquoi_pas_resolu"],
                    "Potentiel_Skedisy_10": p["potentiel_skedisy"],
                    "Confiance": p["confiance"],
                    "Score_composite": p["score_composite"],
                    "Categories": " | ".join(p["categories_labels"]),
                    "Cout_potentiel": p.get("cout_potentiel"),
                    "Id": p["id"],
                }
            )

    # Markdown TOP20
    lines = [
        f"# TOP 20 problèmes salons afro IDF (SQUIRE)",
        f"",
        f"Sample: **{N}** salons afro pertinents · {datetime.now(timezone.utc).date().isoformat()}",
        f"",
        f"**Wedge:** {out_full['wedge_recommande']['titre']}",
        f"",
        f"{out_full['wedge_recommande']['pourquoi']}",
        f"",
        f"| Rang | Problème | Salons | % | Grav | Fréq | Impact € | Diff | Pot. Skedisy | Confiance | Score |",
        f"|---|---|---:|---:|---:|---:|---:|---:|---:|---|---:|",
    ]
    for i, p in enumerate(top20, 1):
        short = p["probleme"][:90] + ("…" if len(p["probleme"]) > 90 else "")
        lines.append(
            f"| {i} | {short} | {p['salons_concernes']} | {p['pct_salons']} | {p['gravite']} | {p['frequence']} | {p['impact_eco']} | {p['difficulte_actuelle']} | {p['potentiel_skedisy']} | {p['confiance']} | {p['score_composite']} |"
        )
    lines.append("")
    lines.append("## Détail TOP 10")
    for i, p in enumerate(top20[:10], 1):
        lines.append(f"### {i}. [{p['id']}] {p['probleme']}")
        lines.append(f"- Catégories: {', '.join(p['categories_labels'])}")
        lines.append(f"- Preuves:")
        for pr in p["preuves"][:4]:
            lines.append(f"  - {pr}")
        lines.append(f"- Outils actuels: {p['outils']}")
        lines.append(f"- Pourquoi pas résolu: {p['pourquoi_pas_resolu']}")
        lines.append(f"- Note comptage: {p['note_comptage']}")
        lines.append("")

    (SCRIPT_DIR / "SQUIRE_TOP20.md").write_text("\n".join(lines), encoding="utf-8")
    (SCRIPT_DIR / "FONDATEUR_WEDGE_DECISION.md").write_text(
        "\n".join(
            [
                "# Décision wedge Skedisy (fondateur)",
                "",
                f"**Recommandation:** {out_full['wedge_recommande']['titre']}",
                "",
                out_full["wedge_recommande"]["pourquoi"],
                "",
                "## Ce qu'il ne faut PAS construire en premier",
                "- Un énième agenda type Planity (feature parity)",
                "- Un CRM fidélisation générique (preuve faible dans le sample)",
                "- Un outil RH multi-indépendantes (non prouvé ici)",
                "",
                "## Ce qu'il faut vendre au pro",
                "« Tes DM WhatsApp/Instagram deviennent un devis + durée + acompte — "
                "avant un créneau de 3–6h. Moins de no-show, moins de litige prix, moins de chaos. »",
                "",
                f"Ids ancre: {', '.join(out_full['wedge_recommande']['ids'])}",
            ]
        ),
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "n": N,
                "top5": [
                    {"rang": i + 1, "id": p["id"], "score": p["score_composite"], "probleme": p["probleme"][:80]}
                    for i, p in enumerate(top20[:5])
                ],
                "wedge": out_full["wedge_recommande"]["titre"],
                "outputs": [
                    "SQUIRE_ANALYSIS.json",
                    "SQUIRE_TOP20.csv",
                    "SQUIRE_TOP20.md",
                    "FONDATEUR_WEDGE_DECISION.md",
                ],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
