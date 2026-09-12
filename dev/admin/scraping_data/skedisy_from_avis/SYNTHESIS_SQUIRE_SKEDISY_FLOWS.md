# Synthèse — 40 problèmes · Flow SQUIRE · Flow Skedisy

**Statut :** analyse seule — pas d’implémentation  
**Sample :** 458 salons Afro IDF  
**Somme :** 20 TOP data + 20 structurels = **40**

---

## 1. Flow SQUIRE (référence barbershop)

```
S0  Entrée          Google / Instagram / site / app
S1  Salon           Choisir le shop
S2  Service         Prestation (+ add-ons)
S3  Barber          Pro précis ou « any barber »
S4  Créneau         Date + heure
S5  Contact         Infos légères
S6  Paiement        CB / Apple Pay / Google Pay
S7  Confirm         SMS / email + rappels
```

**Logique :** service → slot → pay. Adapté à une coupe courte.  
**Manque pour l’Afro :** qualif, devis dynamique, durée configurée, supply mèches, prep, acompte lié au devis.

---

## 2. Les 40 problèmes (somme)

### Bloc A — TOP data (#1–20)

| # | Problème | Preuve |
|---:|---|---|
| 1 | Projet Afro ≠ coupe 30 min | Méta 458 |
| 2 | Pas de funnel Qualif → devis → acompte | Wedge |
| 3 | Sans qualification = malentendu | 63 |
| 4 | Durée réelle > catalogue | 73 |
| 5 | Résa non instantanée / dispo opaque | 343 · 55 |
| 6 | Mèches / supply → litiges | 118 |
| 7 | WA/DM = OS de résa | 54 |
| 8 | Prix final ≠ annoncé | 96 |
| 9 | Acompte absent ou flou | 230 |
| 10 | Attente / retard | 50 |
| 11 | Communication / relance | 54 |
| 12 | No-show / annulation tardive | 9 (faible) |
| 13 | Avis 1★ sans prévention | 179 |
| 14 | Catalogue trop granulaire | proxy |
| 15 | Google → appel/DM | 343 |
| 16 | IG/TikTok sans bridge | proxy |
| 17 | Paiement final ≠ devis | lié 96 |
| 18 | Fidélisation / reprise faible | proxy |
| 19 | Pas de fiche cliente | proxy |
| 20 | Hygiène / accueil | 46 — **hors software** |

### Bloc B — Structurels (#21–40)

| # | Problème | Niveau |
|---:|---|---|
| 21 | Photo inspiration non attachée au RDV | P/I |
| 22 | « À partir de » sans variables | F/I |
| 23 | Accord oral seulement | I |
| 24 | Règles annulation / report floues | I |
| 25 | Retard salon non annoncé | P |
| 26 | Changement de pro non communiqué | I |
| 27 | Canaux parallèles → double book | I |
| 28 | Prep J-1 absente | P |
| 29 | Solde surprise en fin de presta | P |
| 30 | Pas de preuve écrite du devis | I |
| 31 | Confusion noms de styles | P |
| 32 | Durée marketing ≠ durée bookée | I |
| 33 | Impossible de « refaire la même » | I |
| 34 | Événement critique sans garde-fou | F |
| 35 | Niveau pro opaque | I |
| 36 | Longue presta sans jalons | I |
| 37 | Pas de statut pendant l’attente | I |
| 38 | Promo déconnectée du devis | I |
| 39 | Historique perdu entre RDVs | I |
| 40 | Reprise après-vente non clarifiée | P |

---

## 3. Proposition flow Skedisy (unifié · couvre #1–40)

**Principe :** un seul CTA « Réserver ». Pas « devis **ou** réservation ».  
Profondeur adaptive selon le service (S0→S3).

```
K0   LIEN UNIQUE
     Bio IG / Google / message WA → un lien
     → #5 #7 #15 #16 #27

K1   ACCUEIL
     Cadre : on fige config + prix + durée avant le créneau
     → #1 #2 #23

K2   STYLE GUIDÉ
     Famille / style clair (pas liste plate de 40)
     → #14 #3 #31

K3   QUALIFICATION + PHOTO
     0–5 questions · photo inspiration · flag événement (mariage…)
     → #3 #6 #14 #21 #34

K4   DEVIS + DURÉE VERROUILLÉS
     Breakdown prix · durée bookable · preuve écrite
     → #8 #4 #17 #22 #30 #32

K5   VALIDATION SALON (si besoin)
     Outlier / S3 / événement — sinon skip
     → #3 #11 #34

K6   PRO + CRÉNEAU
     Slot = durée du devis · niveau pro visible
     → #4 #5 #10 #26 #35

K7   IDENTITÉ LÉGÈRE (OTP)
     → #5

K8   ACOMPTE + RÈGLES
     Deposit · reste dû · annulation / report clairs
     → #9 #12 #17 #24 #29

K9   CONFIRMATION + PREP
     Récap figé · checklist mèches / arrivée
     → #6 #11 #1 #23 #28 #30

K10  RAPPELS J-1 / 2h
     + checklist
     → #11 #12 #6 #10 #28

K11  JOUR J
     Check-in · statut attente · notif si retard salon
     → #4 #10 #25 #36 #37

K12  SOLDE / REÇU
     Reste = devis − acompte · promo cohérente
     → #17 #29 #38

K13  APRÈS
     Reprendre ma config · règle reprise · mémoire
     → #13 #18 #19 #33 #39 #40
```

**#20 Hygiène :** process salon, pas une étape logiciel.

---

## 4. Côte à côte

| Moment | SQUIRE | Skedisy |
|---|---|---|
| Entrée | Book from Google/IG | Même esprit : **1 lien** (WA = porte) |
| Avant créneau | Service (+ add-on) | **Qualif → devis → durée** |
| Créneau | Durée catalogue | **Durée = devis** |
| Argent | Pay (souvent plein) | **Acompte lié + solde** |
| Prep | Faible | **Checklist mèches / arrivée** |
| Jour J | Rappels SMS | + **statut / retard** |
| Après | Loyalty générique | **Reprendre ma config** |

---

## 5. Anti-patterns

- Deux CTA « Devis » vs « Réserver »
- Formulaire 15 champs pour tout le monde
- Créneau **avant** prix/durée
- Acompte sans devis visible
- Remplacer WhatsApp (garder le lien dedans)

---

Canvas : `skedisy-squire-flows-40.canvas.tsx`  
Détail problèmes : `ANALYSE_FLOW_IDEAL_40_PROBLEMES.md`
