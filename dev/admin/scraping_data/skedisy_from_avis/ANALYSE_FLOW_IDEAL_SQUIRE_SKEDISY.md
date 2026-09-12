# Flow idéal Skedisy — SQUIRE · 20 problèmes · parcours anti-friction

**Statut :** analyse seule — **aucune implémentation**  
**Sources :** `SQUIRE_TOP20.md` · `DEEP_PATTERNS_opportunite.json` · `PROMPT7` · docs getsquire online booking  
**Sample :** 458 salons Afro IDF

---

## 1. Flow de réservation SQUIRE (référence)

SQUIRE verticalise le **barbershop** (prestations courtes, catalogue stable). Flow cliente typique :

| Étape | Cliente | Logique |
|---|---|---|
| 0 | Entre via Google / Instagram / site / app salon | Acquisition → booking |
| 1 | Choisit le salon | Multi-barber |
| 2 | Choisit le service (+ add-ons) | Catalogue + upsell |
| 3 | Choisit le barber **ou** « any barber » | Match service + dispo |
| 4 | Choisit date + créneau | Agenda temps réel |
| 5 | Donne ses infos (souvent léger) | Faible friction |
| 6 | Paie (CB / Apple Pay / Google Pay) | Engagement |
| 7 | Reçoit confirm + rappels SMS/email | Rétention / no-show ↓ |

**Ce que SQUIRE ne demande pas :** texture, longueur, mèches, photo inspiration, devis multi-variables, checklist supply.  
**Pourquoi ça marche chez eux :** une coupe 30–45 min tient dans *service → slot → pay*.  
**Pourquoi ce flow seul underfit l’Afro :** un knotless 4–6h n’est pas une ligne catalogue — les données (Planity présent + avis prix/durée/qualité) le montrent déjà.

---

## 2. Les 20 problèmes récurrents (données déjà présentes)

Comptages = **nombre de salons** touchés dans le sample (pas le volume d’avis du marché). Signal avis API ≤5/salon → sous-estimation probable.

| # | Problème récurrent | Preuve dans le projet | Moment où la personne le subit |
|---:|---|---|---|
| **1** | La presta Afro est un **projet** (devis + supply + 3–6h), pas une coupe 30 min | Méta TOP20 · distribution braids/locks/extensions | Tout le parcours |
| **2** | Pas de funnel **Qualif → devis/durée → acompte** | Wedge fondateur P20 | Avant le créneau |
| **3** | Impossible de confirmer sans **qualification** (style, longueur, mèches, photo) | 456/458 complexes · **63** malentendu | Au moment de « réserver » |
| **4** | **Durée réelle** déborde le créneau catalogue → retards en chaîne | **73** durée · 50 attente | Jour J / planning |
| **5** | Réservation **non instantanée** / dispo opaque | **343** sans outil · **55** avis résa | Entrée |
| **6** | **Mèches / supply** cliente vs salon → litiges qualité & coût | **118** qualité/mèches (#1 avis) | Avant + jour J |
| **7** | **WhatsApp / DM** = OS de résa → chaos, perte d’info | **54** com · WA détecté | Demande initiale |
| **8** | **Prix final ≠ annoncé** / suppléments surprise | **96** prix | Jour J / fin presta |
| **9** | **Acompte** absent ou flou → créneaux longs non engagés | **230** sans politique visible | Avant confirm |
| **10** | **Attente / retard** au salon | **50** attente | Jour J |
| **11** | **Communication** / relance défaillante | **54** com | Après message / avant RDV |
| **12** | **No-show** / annulation tardive | **9** avis (signal **faible**) | Post-confirm |
| **13** | Avis **1★** (qualité/prix/attente) sans prévention amont | **179** salons ≥1 thème | Après presta |
| **14** | Catalogue **trop granulaire** / difficile à self-serve | Proxy TOP20 | Choix du service |
| **15** | Google → **appel/DM** sans conversion structurée | 343 sans booking | Acquisition |
| **16** | IG/TikTok sans **bridge** réservation mesurable | Proxy TOP20 | Acquisition |
| **17** | Paiement final **déconnecté** du devis digital | Lié aux 96 prix | Checkout / caisse |
| **18** | **Fidélisation** / reprise (locks, tissage) peu outillée | Proxy TOP20 | Retour |
| **19** | Pas de **fiche cliente** (historique, photos, mèches) | Proxy TOP20 | Retour |
| **20** | **Hygiène / accueil** | **46** hygiène | Jour J — **hors wedge software** |

---

## 3. Flow Skedisy proposé — un seul parcours, problèmes tués en amont

**Règle :** une entrée « Réserver ». Pas de choix « devis **ou** réservation ».  
La profondeur s’adapte (S0 simple → S3 outlier). Le booking est la **conséquence** d’une presta définie.

### Parcours cliente (idéal)

```
0. LIEN UNIQUE (IG bio / Google / message WA)
   → tue #5 #7 #15 #16
   WhatsApp reste le canal humain ; Skedisy = le moteur.

1. ACCUEIL SALON
   → tue #1 #2 (cadre mental : « on fige prix + durée avant le créneau »)

2. CHOIX FAMILLE / PRESTATION (guidé, pas liste plate de 40)
   → tue #14 #3

3. QUALIFICATION ADAPTATIVE (0–5 questions + photo si besoin)
   → tue #3 #6 #14
   Ex. longueur, taille nattes, qui apporte les mèches, couleur, photo.

4. DEVIS + DURÉE VERROUILLÉS (breakdown visible)
   → tue #8 #4 #17
   La personne voit : prix estimé, durée estimée, ce qui a fait monter le prix.

5. VALIDATION SALON (seulement si outlier / S3 / photo custom)
   → tue #3 #11
   Sinon : skip immédiat.

6. PRO + CRÉNEAU (slots = durée du devis, pas durée catalogue fictive)
   → tue #4 #5 #10

7. IDENTITÉ LÉGÈRE (OTP email/tél)
   → tue #5 (pas de mur compte app)

8. ACOMPTE LIÉ AU DEVIS (reste dû affiché)
   → tue #9 #12 #17

9. CONFIRMATION + PREP CHECKLIST
   → tue #6 #11 #1
   « Apportez X mèches / arrivez à H / durée prévue Y »

10. RAPPELS 24h / 2h (+ checklist)
    → tue #11 #12 #6 #10

11. JOUR J — check-in / démarrage (durée réelle capturable plus tard)
    → tue #4 #10

12. APRÈS — solde · option photo résultat · « reprendre ma config »
    → tue #13 #17 #18 #19
```

### #20 Hygiène
Non résolu par un flow booking. Skedisy réduit les 1★ nés du **malentendu** (prix/durée/config) — pas le ménage.

---

## 4. Matrice problème → étape qui le prévient

| # | Étape(s) | Mécanisme |
|---:|---|---|
| 1 | Tout | Config + durée + acompte natifs |
| 2 | 3→4→8 | Ordre imposé Qualif→Devis→Acompte |
| 3 | 3 | Complexity Engine |
| 4 | 4, 6, 11 | Durée dynamique + slot réel |
| 5 | 0, 6 | Self-serve + dispo |
| 6 | 3, 9, 10 | Qui fournit + checklist |
| 7 | 0 | WA = lien, pas OS |
| 8 | 4, 8 | Devis accepté avant slot |
| 9 | 8 | Deposit policy |
| 10 | 4, 6, 10 | Planning calé + rappels |
| 11 | 5, 9, 10 | Statuts + notifs |
| 12 | 8, 10 | Acompte + rappels |
| 13 | 3–10 | Prévention amont |
| 14 | 2, 3 | Guidage + questions |
| 15 | 0 | Bridge booking |
| 16 | 0 | Lien bio |
| 17 | 8, 12 | Acompte + solde liés |
| 18 | 12 | Reprendre config |
| 19 | 3, 12 | Snapshot + photos |
| 20 | — | Hors scope software |

---

## 5. Anti-patterns (friction à ne pas réintroduire)

- Deux CTA « Devis » vs « Réserver »
- Formulaire 15 champs pour tout le monde
- Compte app obligatoire avant de voir un prix
- Créneau **avant** prix/durée
- Acompte sans devis visible
- Remplacer WhatsApp (le garder comme porte d’entrée vers le lien)

---

## 6. Différence SQUIRE vs Skedisy (même *esprit*, autre *métier*)

| | SQUIRE | Skedisy (ce flow) |
|---|---|---|
| Unité | Coupe / chair time | **Projet** capillaire configuré |
| Avant le slot | Service (+ add-on) | **Qualif → devis → durée** |
| Paiement | Souvent plein / carte | **Acompte lié au devis** + solde |
| Prep | Faible | Checklist mèches / arrivée |
| Canal | Book from Google/IG | **Même idée** : un lien, pas un chaos DM |

---

Canvas : `skedisy-ideal-booking-flow.canvas.tsx`
