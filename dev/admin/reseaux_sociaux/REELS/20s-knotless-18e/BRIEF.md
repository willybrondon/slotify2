# Reel 20 s — « Tu cherches des knotless dans le 18e ? »

**Format :** 9:16 · ~20 secondes · Instagram / TikTok  
**Principe :** Runway pour Maya + ambiance ; **données / carte / UI = réels**.

Hook cible : *Tu cherches une coiffeuse pour tes knotless dans le 18e ?*

---

## Storyboard (6 shots)

| # | Durée | Source | Contenu | Voix / texte |
|---|-------|--------|---------|--------------|
| **1** | ~3 s | **Runway** | **Skedisy Girl** marche à Paris (Gen-4 + `CHARACTERS/Skedisy Girl/reference/`) | « Tu cherches une coiffeuse pour tes knotless dans le 18e ? » |
| **2** | ~2–3 s | **Réel** | Carte Paris **exacte** → zoom / highlight **18e** | Texte on-screen optionnel : `Paris → 18e` |
| **3** | ~3 s | **Runway** | Skedisy Girl découvre un salon — **photo réelle** (`SALONS/…/exterior/`) | — |
| **4** | ~3 s | **Réel / data** | Card **données Skedisy** : nom · Knotless · prix · note · créneau (jamais inventés) | Chiffres = app / back-office |
| **5** | ~3–4 s | **Recording app** | Écran Skedisy réel → tap **RÉSERVER** (`APP UI RECORDINGS/customer-app/booking/`) | — |
| **6** | ~3–4 s | **Runway** | Skedisy Girl sort du **vrai** salon, knotless (réf. hairstyle + photo salon) | — |
| **End** | ~2 s | **Brand** | Logo + claim (`SKEDISY BRAND/outro/`) | **SKEDISY** · *Trouve. Compare. Réserve.* |

**Total cible :** ~20 s (ajuster ±2 s au montage).

---

## Assets à préparer avant génération

```
REELS/20s-knotless-18e/
├── BRIEF.md                 ← ce fichier
├── map/                     ← export carte Paris → 18e (anim ou stills)
├── data-card/               ← capture / export données réelles (prix, note, créneau)
└── export/                  ← master final .mp4

CHARACTERS/Skedisy Girl/reference/maya-ref-01.png
LOCATIONS/Paris 18/
SALONS/<SalonRéel>/exterior/   (+ interior si besoin)
HAIRSTYLES/knotless/
APP UI RECORDINGS/customer-app/booking/   ← parcours jusqu’à RÉSERVER
SKEDISY BRAND/outro/
```

Personnages uniques : **Skedisy Girl** / **Skedisy Boy** (pas d’autres visages marque).  
Salon, prix, note, créneau = **copiés depuis Skedisy**, jamais inventés.

---

## Prompt Runway — Shot 1

> Skedisy Girl / Maya (use brand character reference), 27, Black French Parisian woman walking in a Paris street near the 18th arrondissement, stylish casual, natural expression, daylight, vertical 9:16, cinematic, no phone UI, no fake text overlays.

## Prompt Runway — Shot 3

> Skedisy Girl / Maya (same brand character reference) discovering a real hair salon storefront — match this salon exterior reference photo exactly, Paris 18 neighborhood feel, curious approach, vertical 9:16, no fake app UI.

## Prompt Runway — Shot 6

> Skedisy Girl / Maya (same brand character reference) leaving the same salon exterior with fresh knotless braids (hairstyle reference), confident walk, warm golden light, cinematic vertical 9:16, authentic Paris street, no fake logos.

---

## Montage (ordre)

1. Shot 1 (Runway) + VO / sous-titre hook  
2. Shot 2 (carte réelle) — transition nette  
3. Shot 3 (Runway + réf. salon)  
4. Shot 4 (data réelle — overlay ou card exportée)  
5. Shot 5 (screen recording → tap RÉSERVER)  
6. Shot 6 (Runway sortie salon)  
7. Outro brand : **SKEDISY** / *Trouve. Compare. Réserve.*

**Transitions cinéma** (téléphone, zoom carte) : Runway Edit Studio / Aleph — sans réécrire le contenu de l’écran.

**Clips IA :** préférer les **Workflows** sauvés (`WORKFLOWS/`) plutôt que de régénérer à la main à chaque salon.

---

## Checklist qualité « crédible »

- [ ] Même **Skedisy Girl** (réf. Gen-4) sur shots 1, 3, 6  
- [ ] Carte Paris / 18e **géographiquement juste**  
- [ ] Photo salon **réelle** en référence shot 3 + 6  
- [ ] Prix, note, créneau = **vraies données Skedisy**  
- [ ] Bouton RÉSERVER = **recording app**, pas UI générée  
- [ ] CTA final = claim marque, pas de stats inventées  

---

## Variantes (même template)

| Slot | Exemple A (ce brief) | Exemple B |
|------|----------------------|-----------|
| Style | Knotless | Boho / Fulani / Locs |
| Zone | 18e | Saint-Denis / Montreuil / Créteil |
| Prix / créneau | 70 € · Sam. 14h | Valeurs réelles du jour |
| Salon | Partenaire confirmé | Autre fiche Skedisy |

Garder la structure 6 shots ; ne changer que les assets réels.
