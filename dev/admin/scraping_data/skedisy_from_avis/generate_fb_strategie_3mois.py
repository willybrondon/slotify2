# -*- coding: utf-8 -*-
"""
Stratégie posts Facebook Groupes Skedisy — 3 mois
- 4 posts / semaine × 4 semaines = 16 fichiers / mois
- Chaque fichier = 1 jour de publication
- 8 onglets : Client_Jour1..4 + Pro_Jour1..4 (variantes groupes)
"""
from __future__ import annotations

from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

OUT_ROOT = Path(__file__).with_name("FB_GROUPES_STRATEGIE_3MOIS")

GROUPS = [
    ("Black Geek / Recherche Coiffeuse Afro Pro IDF", "https://www.facebook.com/groups/134449370024416"),
    ("Coiffeuses Afro professionnelle en île de France", "https://www.facebook.com/groups/284571943882019"),
    ("Coiffeuses Afro Certifiées & Professionnelles IDF", "https://www.facebook.com/groups/1142079080008153"),
    ("JE CONSOMME AFRICAIN", "https://www.facebook.com/groups/2213701955383712/"),
    ("La Diaspora Africaine de France", "https://www.facebook.com/groups/1539354113070702"),
    ("Coiffeuse à domicile 93", "https://www.facebook.com/groups/4769417296405741"),
    ("Soins, Astuces et Conseils pour Cheveux Naturels", "https://www.facebook.com/groups/5749916125108167"),
    ("La femme belle en coiffure", "https://www.facebook.com/groups/667615722313297"),
    ("Coiffure, top modèle 2026", "https://www.facebook.com/groups/1584477032567635"),
    ("Coiffure afro à domicile France", "https://www.facebook.com/groups/1240347616412450"),
    ("Coiffeuses afro en île de France et ailleurs", "https://www.facebook.com/groups/1948257189237541/"),
    ("Glamour et gloire coiffure afro île de France", "https://www.facebook.com/groups/970050834928729/"),
    ("Les locksés d’île de France", "https://www.facebook.com/groups/2692720617599643/"),
    ("Votre coiffeuse Afro en Île-de-France", "https://www.facebook.com/groups/1331027702017734/"),
    ("Tresses afro en Île-de-France", "https://www.facebook.com/groups/241358959612399/"),
    ("Coiffure afro africaine île de France", "https://www.facebook.com/groups/259213433910722/"),
    ("Coiffure à domicile à Paris et île de france", "https://www.facebook.com/groups/1347267503122986/"),
    ("coiffures Afro au naturel", "https://www.facebook.com/groups/1324886558019993/"),
    ("SOS BEAUTÉS AFRO", "https://www.facebook.com/groups/105919819792897/"),
    ("Recherche Coiffeuse Afro Pro Ile-de-France (2)", "https://www.facebook.com/groups/333981471660575/"),
    ("Coiffeuse afro professionnelle", "https://www.facebook.com/groups/1236182034790135/"),
    ("Astuces beauté, conseils soin de la peau et cheveux", "https://www.facebook.com/groups/1249795580163427/"),
    ("Coiffure à domicile 95,94,93,92,91,78,77 et 27", "https://www.facebook.com/groups/302250931646026/"),
]

# 4 jours / semaine — rythme éditorial
DAY_PILLARS = {
    1: {
        "code": "DOULEUR",
        "label": "Douleur / micro-problème",
        "client_hook": "le chaos avant le RDV",
        "pro_hook": "le chaos agenda / DM",
    },
    2: {
        "code": "EDUCATION",
        "label": "Éducation / conseil afro",
        "client_hook": "comprendre presta & texture",
        "pro_hook": "expliquer son offre clairement",
    },
    3: {
        "code": "PREUVE",
        "label": "Preuve / démo Skedisy",
        "client_hook": "avant/après parcours résa",
        "pro_hook": "fiche + créneaux bookables",
    },
    4: {
        "code": "CONVERSION",
        "label": "Conversion / CTA week-end",
        "client_hook": "réserver maintenant",
        "pro_hook": "ouvrir / claimer le salon",
    },
}

# Thèmes mensuels (wedge produit)
MONTH_THEMES = {
    1: {
        "title": "Fin du chaos WhatsApp / DM",
        "client_focus": "réserver sans 15 messages",
        "pro_focus": "recevoir des RDV préparés",
        "cta_client": "Réserve sur skedisy.com (app gratuite).",
        "cta_pro": "Rejoins gratuitement : skedisy.com/professionnel",
    },
    2: {
        "title": "Presta claire (prix, durée, mèches, photo)",
        "client_focus": "savoir ce qu’on book vraiment",
        "pro_focus": "moins de litiges, devis visible",
        "cta_client": "Trouve ta presta et book sur skedisy.com.",
        "cta_pro": "Structure ton offre sur Skedisy Pro : skedisy.com/professionnel",
    },
    3: {
        "title": "Communauté IDF + agenda rempli",
        "client_focus": "salons afro près de chez toi",
        "pro_focus": "visibilité locale + créneaux remplis",
        "cta_client": "Explore les salons IDF sur skedisy.com et réserve.",
        "cta_pro": "Sois trouvable en IDF : skedisy.com/professionnel",
    },
}

CLIENT_ANGLES = [
    "Chaos WhatsApp",
    "Prix opaque",
    "Tresses / knotless",
    "Locks IDF",
    "Cheveux naturels",
    "Domicile / proximité",
    "Diaspora / communauté",
    "Urgence événement",
]

PRO_ANGLES = [
    "Moins de DM",
    "Agenda structuré",
    "No-show / créneaux longs",
    "Visibilité IDF",
    "Fiche salon claire",
    "Domicile pro",
    "Acquisition qualifiée",
    "Spécialisation afro",
]

header_fill = PatternFill("solid", fgColor="C45C26")
header_font = Font(bold=True, color="FFFFFF", name="Calibri", size=11)
wrap = Alignment(wrap_text=True, vertical="top")
thin = Border(
    left=Side(style="thin", color="DDDDDD"),
    right=Side(style="thin", color="DDDDDD"),
    top=Side(style="thin", color="DDDDDD"),
    bottom=Side(style="thin", color="DDDDDD"),
)


def g(i: int):
    return GROUPS[i % len(GROUPS)]


def client_post(month: int, week: int, day: int, variant: int) -> dict:
    theme = MONTH_THEMES[month]
    pillar = DAY_PILLARS[day]
    groupe, lien = g(week * 4 + day + variant * 3 + month)
    angle = CLIENT_ANGLES[(week + day + variant + month) % len(CLIENT_ANGLES)]
    cta = theme["cta_client"]

    bodies = {
        1: (
            f"On connaît toutes ce moment : 15 messages WhatsApp pour un créneau de {angle.lower()}… et toujours pas de réponse claire.\n\n"
            f"Skedisy (beauté afro en Île-de-France) te montre les salons et les prestations — tu réserves un vrai créneau. Moins de « tu es dispo samedi ? », plus de RDV confirmé.\n\n"
            f"Mois focus : {theme['title']}. On a transformé {theme['client_focus']} en parcours bookable.\n\n"
            f"{cta}"
        ),
        2: (
            f"Avant de booker, pose-toi la bonne question : est-ce que le salon comprend vraiment {angle.lower()} ?\n\n"
            f"Sur Skedisy, tu vois les prestas afro (tresses, locks, naturels…) en IDF et tu bloques la date sans improvisation.\n\n"
            f"Conseil du jour ({pillar['label']}) : {pillar['client_hook']} — puis passe à l’action.\n\n"
            f"{cta} Partage à une amie du groupe."
        ),
        3: (
            f"Avant Skedisy : chercher une coiffeuse via {angle.lower()} dans les commentaires.\n"
            f"Après : fiche salon + créneau réservé.\n\n"
            f"Le groupe lance la conversation ; la plateforme termine le job. Skedisy est pensé pour la beauté afro en Île-de-France.\n\n"
            f"Focus mois {month} : {theme['title']}.\n\n"
            f"{cta}"
        ),
        4: (
            f"Week-end qui arrive. Encore le temps de booker — ou encore une semaine de stress DM ?\n\n"
            f"Skedisy : salons afro IDF, presta visible, réservation en ligne. Angle du jour : {angle}.\n\n"
            f"Si tu en as marre du flou : ouvre skedisy.com maintenant. {cta}\n\n"
            f"Tague celle qui cherche encore."
        ),
    }
    return {
        "groupe": groupe,
        "lien": lien,
        "angle": f"{pillar['code']} · {angle}",
        "post": bodies[day],
        "meta": f"M{month} S{week} J{day} Client v{variant}",
    }


def pro_post(month: int, week: int, day: int, variant: int) -> dict:
    theme = MONTH_THEMES[month]
    pillar = DAY_PILLARS[day]
    groupe, lien = g(week * 5 + day + variant * 2 + month + 1)
    angle = PRO_ANGLES[(week + day + variant + month) % len(PRO_ANGLES)]
    cta = theme["cta_pro"]

    bodies = {
        1: (
            f"On a arrêté de tout gérer dans Instagram et WhatsApp.\n\n"
            f"Avec Skedisy, tes clientes IDF voient tes prestas afro et réservent — tu reçois des RDV préparés, pas 40 messages à minuit. Angle : {angle}.\n\n"
            f"Mois focus : {theme['title']} — {theme['pro_focus']}.\n\n"
            f"{cta}"
        ),
        2: (
            f"Être pro, c’est aussi expliquer clairement {angle.lower()} sans perdre 20 minutes en DM.\n\n"
            f"Skedisy te donne une fiche salon pensée beauté afro (tresses, locks, naturels…) : l’offre est lisible, le créneau est bookable.\n\n"
            f"Éducation du jour ({pillar['label']}) : {pillar['pro_hook']}.\n\n"
            f"{cta}"
        ),
        3: (
            f"Preuve simple : quand ton agenda est bookable, tu n’es plus seulement « visible » — tu es réservable.\n\n"
            f"Skedisy = vitrine + réservations pour salons afro en Île-de-France. Focus : {angle}.\n\n"
            f"Le contenu attire ; la réservation encaisse. {theme['title']}.\n\n"
            f"{cta}"
        ),
        4: (
            f"Cette semaine, ouvre des créneaux — ne les laisse pas au hasard des stories.\n\n"
            f"Skedisy Pro : sois trouvable par des clientes qui cherchent déjà une coiffeuse afro en IDF. Angle : {angle}.\n\n"
            f"{cta}\n\n"
            f"Envoie ce post à une collègue du groupe."
        ),
    }
    return {
        "groupe": groupe,
        "lien": lien,
        "angle": f"{pillar['code']} · {angle}",
        "post": bodies[day],
        "meta": f"M{month} S{week} J{day} Pro v{variant}",
    }


def write_sheet(ws, title: str, rows: list[dict], audience: str):
    ws.title = title[:31]
    headers = [
        "N°",
        "Groupe Facebook",
        "Lien du groupe",
        "Angle / thématique",
        "Post (FR) — prêt à publier",
        "Audience",
        "Meta planning",
        "Plateforme",
    ]
    ws.append(headers)
    for col, _ in enumerate(headers, 1):
        cell = ws.cell(1, col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(wrap_text=True, vertical="center")
    for i, r in enumerate(rows, 1):
        ws.append(
            [
                i,
                r["groupe"],
                r["lien"],
                r["angle"],
                r["post"],
                audience,
                r.get("meta", ""),
                "Facebook Group",
            ]
        )
    widths = [5, 40, 46, 26, 78, 12, 18, 14]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.row_dimensions[1].height = 28
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row, min_col=1, max_col=8):
        for cell in row:
            cell.alignment = wrap
            cell.border = thin
        ws.row_dimensions[row[0].row].height = 110
    ws.freeze_panes = "A2"
    if ws.max_row > 1:
        ws.auto_filter.ref = f"A1:H{ws.max_row}"


def write_guide_sheet(ws, month: int, week: int, day: int):
    theme = MONTH_THEMES[month]
    pillar = DAY_PILLARS[day]
    ws.title = "Guide"
    lines = [
        ["Skedisy — Guide fichier jour"],
        [],
        [f"Mois {month} · Semaine {week} · Jour {day} ({pillar['code']})"],
        [f"Thème du mois : {theme['title']}"],
        [f"Pilier du jour : {pillar['label']}"],
        [],
        ["8 onglets"],
        ["Client_Jour1 à Client_Jour4 = 4 variantes clientes (groupes / angles différents)"],
        ["Pro_Jour1 à Pro_Jour4 = 4 variantes salons / coiffeuses"],
        [],
        ["Comment publier"],
        ["1. Choisir 1–2 groupes pertinents dans l’onglet Client_Jx"],
        ["2. Copier le post tel quel (ou adapter 1 mot au groupe)"],
        ["3. Faire de même côté Pro sur les groupes pros"],
        ["4. Ne pas spammer : 1 post / groupe / jour max, engagement authentique"],
        [],
        ["Structure virale (dans le texte, sans libellés)"],
        ["Hook → valeur Skedisy → intrigue → CTA + partage"],
        [],
        ["Liens"],
        ["Clientes : https://skedisy.com"],
        ["Pros : https://skedisy.com/professionnel"],
        ["Claim / rejoindre : https://skedisy.com/salon/rejoindre"],
    ]
    for row in lines:
        ws.append(row)
    ws.column_dimensions["A"].width = 100


def build_day_file(path: Path, month: int, week: int, day: int):
    wb = Workbook()
    # Remove default after creating guide first
    guide = wb.active
    write_guide_sheet(guide, month, week, day)

    # 4 client tabs + 4 pro tabs
    # Each tab = posts for that "variante jour" (same calendar day, alternate groups)
    for v in range(1, 5):
        rows = [client_post(month, week, day, v)]
        # enrich: 4 group rows per variante
        for extra in range(1, 4):
            rows.append(client_post(month, week, day, v + extra * 2))
        ws = wb.create_sheet()
        write_sheet(ws, f"Client_Jour{v}", rows, "Client(e)")

    for v in range(1, 5):
        rows = [pro_post(month, week, day, v)]
        for extra in range(1, 4):
            rows.append(pro_post(month, week, day, v + extra * 2))
        ws = wb.create_sheet()
        write_sheet(ws, f"Pro_Jour{v}", rows, "Pro")

    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(path)


def write_month_calendar(month_dir: Path, month: int):
    wb = Workbook()
    ws = wb.active
    ws.title = "Calendrier"
    headers = [
        "Fichier",
        "Semaine",
        "Jour",
        "Pilier",
        "Thème mois",
        "Audience principale",
        "CTA",
    ]
    ws.append(headers)
    for col, _ in enumerate(headers, 1):
        c = ws.cell(1, col)
        c.fill = header_fill
        c.font = header_font
    theme = MONTH_THEMES[month]
    for week in range(1, 5):
        for day in range(1, 5):
            pillar = DAY_PILLARS[day]
            fname = f"M{month:02d}_S{week}_J{day}_{pillar['code']}.xlsx"
            ws.append(
                [
                    fname,
                    week,
                    day,
                    f"{pillar['code']} — {pillar['label']}",
                    theme["title"],
                    "Client + Pro (8 onglets)",
                    theme["cta_client"] if day % 2 else theme["cta_pro"],
                ]
            )
    for i, w in enumerate([36, 10, 8, 36, 36, 24, 48], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "A2"

    ws2 = wb.create_sheet("Strategie")
    for row in [
        [f"Stratégie Facebook Groupes — Mois {month}"],
        [],
        [f"Thème : {theme['title']}"],
        [f"Focus clientes : {theme['client_focus']}"],
        [f"Focus pros : {theme['pro_focus']}"],
        [],
        ["Cadence : 4 publications / semaine (J1 douleur, J2 éducation, J3 preuve, J4 conversion)"],
        ["16 fichiers = 4 semaines × 4 jours"],
        ["Chaque fichier = 8 onglets (Client_Jour1–4 + Pro_Jour1–4)"],
        [],
        ["KPI à suivre (pas les likes)"],
        ["Commentaires utiles / questions"],
        ["Clics vers skedisy.com / professionnel"],
        ["Claims / inscriptions salon"],
        ["Signaux produit (prix, mèches, WhatsApp, durée)"],
    ]:
        ws2.append(row)
    ws2.column_dimensions["A"].width = 90

    wb.save(month_dir / f"_CALENDRIER_MOIS_{month:02d}.xlsx")


def write_readme(root: Path):
    text = """# Stratégie posts Facebook Groupes — Skedisy (3 mois)

## Cadence
- **4 posts / semaine** (Jour 1 → 4)
- **16 fichiers / mois** (4 semaines × 4 jours)
- **3 mois** préparés = **48 fichiers** + 3 calendriers

## Contenu d’un fichier jour
8 onglets :
1. `Client_Jour1` … `Client_Jour4` — variantes clientes (groupes / angles)
2. `Pro_Jour1` … `Pro_Jour4` — variantes salons / coiffeuses
3. `Guide` — mode d’emploi du jour

Chaque onglet contient plusieurs posts prêts à copier-coller (colonnes : Groupe, Lien, Angle, Post).

## Piliers hebdo
| Jour | Code | Rôle |
|------|------|------|
| 1 | DOULEUR | Micro-problème (DM, prix, chaos) |
| 2 | EDUCATION | Conseil / compréhension presta afro |
| 3 | PREUVE | Démo Skedisy / avant-après parcours |
| 4 | CONVERSION | CTA week-end / rejoindre |

## Thèmes mensuels
1. Fin du chaos WhatsApp / DM
2. Presta claire (prix, durée, mèches, photo)
3. Communauté IDF + agenda rempli

## Publication
- 1 post max par groupe et par jour
- Adapter 1–2 mots au ton du groupe si besoin
- Client → https://skedisy.com
- Pro → https://skedisy.com/professionnel

Généré par `generate_fb_strategie_3mois.py`.
"""
    (root / "README.md").write_text(text, encoding="utf-8")


def main():
    if OUT_ROOT.exists():
        # keep folder; overwrite files
        pass
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    write_readme(OUT_ROOT)

    total = 0
    for month in (1, 2, 3):
        month_dir = OUT_ROOT / f"mois_{month:02d}"
        month_dir.mkdir(parents=True, exist_ok=True)
        write_month_calendar(month_dir, month)
        for week in range(1, 5):
            for day in range(1, 5):
                pillar = DAY_PILLARS[day]["code"]
                fname = f"M{month:02d}_S{week}_J{day}_{pillar}.xlsx"
                build_day_file(month_dir / fname, month, week, day)
                total += 1
                print("OK", fname)

    print(f"Done: {total} day files + 3 calendars in {OUT_ROOT}")


if __name__ == "__main__":
    main()
