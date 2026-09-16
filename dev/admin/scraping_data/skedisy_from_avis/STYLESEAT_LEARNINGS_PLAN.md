# StyleSeat → Skedisy — apprentissages à intégrer aux plans

**Date :** 2026-09-15  
**Statut :** **plan / stratégie seulement — aucune implémentation**  
**Sources :** page StyleSeat braiders · documentation client StyleSeat · audit avis Skedisy (`SQUIRE_TOP20`, matrices, `SYNTHESE_CHAMPS_PRECISION_RESERVATION.md`)  
**Règle :** StyleSeat = **inspiration produit**, pas preuve de performance. Leurs claims marketing (↓ no-shows, etc.) ≠ faits indépendants.

---

## 0. Enseignement central

StyleSeat ne vend pas seulement un **agenda**.  
Il vend au pro la **suppression d’une chaîne de micro-problèmes** autour d’une prestation complexe :

> devis · réservation · acompte · préparation · durée · paiement · no-show · rebooking · acquisition · historique cliente

Plusieurs de ces micro-problèmes **recoupent** l’audit avis Skedisy : prix, durée, incompréhension presta, cheveux/extensions, attentes, communication.

### Vision produit recalée (à utiliser partout)

| Avant | Après (StyleSeat × avis) |
|---|---|
| Skedisy = système métier des salons Afro | Skedisy = le système qui transforme une **prestation de beauté complexe** en **rendez-vous parfaitement préparé** |

### Chaîne cœur (objet métier)

```
Prestation
→ Configuration (variantes + add-ons + photo)
→ Prix
→ Durée
→ Préparation
→ Acompte / politiques
→ Disponibilité
→ Rendez-vous
→ Paiement / solde
→ Historique (Beauty Profile)
→ Rebooking
```

**Ne pas** tout construire d’un coup. Cette chaîne oriente la roadmap (§15).  
**Conserver** les décisions déjà prises : un seul CTA « Réserver », pas de framing « Sur mesure / Devis », précisions **optionnelles** après choix de presta (`PRINCIPE_UX_PAS_SUR_MESURE.md`, `DECISION_RESERVATION_SANS_FRICTION.md`).

---

## 1. Cartographie StyleSeat → Skedisy (salon)

| Besoin salon | StyleSeat | Skedisy (cible plan) | Priorité plan |
|---|---|---|---|
| Réservations 24/7 | Lien / app | Lien IG / Google / site / WA → Skedisy | L1 (partiel existant) |
| Acompte | Dépôt pour bloquer créneau | Acompte **configurable par prestation** | L1 (partiel) |
| No-show / late cancel | Frais auto | Politique configurable + carte (si dispo) | L1 politique · L2 auto |
| Paiement | AutoCheckout / carte | Solde + acompte Stripe | L1–L2 |
| Durée | Selon taille / longueur / style | **Moteur de durée** (config + add-ons) | L1 |
| Prix | Selon config | **Moteur de prix** | L1 |
| Add-ons | Curly ends, human hair, takedown… | Add-ons **par presta** (prix + durée) | L1 |
| Préparation | Prep rules + forms | Fiche « Avant votre RDV » + rappels | L1 |
| Inspiration | Photo demandée | Photo optionnelle / obligatoire **selon presta** | L1 (upload fait) |
| Politiques | Acceptation avant résa | Politiques affichées + acceptées | L1 |
| Rappels | 48h + J0 + instructions | Rappels + prep | L1–L2 |
| Historique | Notes, photos | **Beauty Profile** | L2 |
| Rebooking | Relance durée de vie coiffure | « Reprendre ma dernière config » | L2 |
| Fidélisation | Loyalty | **Réduction même presta + historique** (L1) · points génériques = non | L1–L3 |
| Acquisition | Search StyleSeat | Marketplace Skedisy (plus tard) | L3 |
| Instagram | Porte d’entrée | IG → Skedisy → résa | L3 |
| Marketing | Posts AI, promos | Marketing auto **V1** (insights + promo + campagne rebook) — `SPRINT_H_MARKETING_AUTO.md` | L3 |
| Site | Site perso | Mini-site (partiel existant) | L3 |
| Paiement fractionné | Klarna | Éventuel | L4 |
| Tap to Pay | Mobile | TPE / Tap to Pay | L4 |
| Packages | Packs prépayés | Forfaits coiffure | L3 |
| Avis | Reviews profil | Avis liés presta | L3 |
| Smart Pricing | Dynamique | Plus tard | L4 |

StyleSeat insiste : le pro définit **taille, longueur, durée, prix, add-ons** par style, puis applique **dépôt / no-show**.  
Skedisy : même logique, mais **libellés coiffure** (finesse ≠ S/M/L vêtement) et config **salon-owner** (`SYNTHESE_CHAMPS_PRECISION_RESERVATION.md`).

---

## 2. Le « Service » devient un vrai objet métier

### Agenda classique
`Knotless Braids — 250 € — 5h`

### Cible Skedisy (inspiré braiders StyleSeat)

```
KNOTLESS BRAIDS
Configuration
- Finesse : Fines / Moyennes / Grosses
- Longueur : Épaules / Mi-dos / Taille / …
- Style : Classique / Boho (options salon)
- Mèches : inclus / apportées par la cliente
- Couleur mèches : si salon fournit (palette)
Add-ons
- Curly ends +€
- Human hair +€
- Takedown +€
Résultat
- Prix estimé
- Durée estimée
- Acompte
- Créneaux possibles
```

Aligné avec l’audit : le problème n’est **pas** seulement « avoir un créneau », c’est **qualifier le projet** avant.

---

## 3. Description de prestation = pièce centrale

Au-delà d’une ligne de catalogue, chaque presta (surtout projets) doit pouvoir porter :

| Bloc | Contenu exemple | Lien avis |
|---|---|---|
| **Inclus** | Pose, mèches?, finition | Prix / inclus flou |
| **Avant de venir** | ✓ lavés / démêlés / séchés · ✕ huile lourde | Prep / qualité |
| **À prévoir** | Durée ~Xh · arriver préparée | Durée / attente |
| **Important** | Supplément si prep insuffisante | Écart prix |
| **Photo** | Optionnelle / obligatoire | Malentendu rendu |
| **Politique** | Acceptation avant paiement | Acompte / annulation |

StyleSeat : *prep forms* + rappels qui **répètent** les instructions.  
Skedisy : `Réservation → Préparation → Rendez-vous` (pas seulement RDV).

---

## 4. Add-ons = levier moteur métier

Exemples StyleSeat : Curly ends, Takedown, Jumbo parts.

Pour Skedisy (catalogue suggéré, **activé par salon**) :

- Curly ends  
- Human hair  
- Takedown  
- Extra length  
- Couleur spéciale  
- Défrisage préalable  
- Lavage  
- Dépôt / fourniture mèches  

**Règle plan :** un add-on peut modifier automatiquement **prix**, **durée**, et plus tard **ressources**.

Différence avec les questions de config :  
- **Config** = paramètres du style (longueur, finesse, qui apporte).  
- **Add-on** = option tarifée / durée en plus, cochable.

---

## 5. Durée intelligente

| Niveau | Contenu | Statut plan |
|---|---|---|
| L1 | Durée = f(config + add-ons) | Partiel (rules) |
| L1+ | Durée prévue + buffer prep + temps bloqué agenda | À planifier |
| L2 | Durée moyenne réelle vs prévue (check-in/out) | À planifier |
| L4 | Distributions / alertes retards structurels | Intelligence |

**Épistémologie :** avis durée/attente = signal fort de **douleur**, pas mesure ops quotidienne. Traiter « durée réelle » comme **hypothèse à instrumenter**, pas comme fréquence prouvée.

---

## 6. Acompte / no-show / politiques

Modèle StyleSeat (inspiration) :

- Acompte % ou fixe  
- Late cancellation %  
- No-show %  
- Affiché **avant** paiement ; cliente accepte  

**Attention audit Skedisy :** no-show / acompte peu présents dans les avis Google → **feature pertinente ≠ problème #1 prouvé**.  
Prioriser : **acompte + politique claire** (litige prix / engagement créneau long). Automatisation no-show carte = L2.

Inclure aussi (jour J, déjà dans décisions) : retard > X min → supplément configurable.

---

## 7. Préparation dans la boucle de réservation

```
Aujourd’hui :  Réservation → RDV
Cible :        Réservation → Préparation → RDV
```

Post-confirm : checklist prep + photo + durée + acompte/solde.  
Rappels J-2 / J-0 **réinjectent** les instructions.

Répond directement aux thèmes incompréhension + cheveux/extensions.

---

## 8. Beauty Profile

StyleSeat : notes + photos + historique.  
Skedisy (ambition L2) :

- Type / longueur / densité / sensibilités  
- Préférences (tension, longueur habituelle, couleur)  
- Historique prestations + configs  
- CTA **« Reprendre ma dernière configuration »**

Réduit la friction de re-qualification (aligné choix « précisions optionnelles » + mémoire).

---

## 9. Rebooking (protective styles)

StyleSeat : relance selon **durée de vie** de la coiffure (ex. 6–8 semaines).  
Skedisy L1 (implémenté) / L2 Beauty Profile :

- « Votre Knotless arrive à échéance »  
- Même coiffeuse / même config / nouveau créneau  

→ détail technique : `REBOOKING_AUTO_IMPLEMENTATION.md`

Moteur de rétention vertical Afro — **pas** CRM générique en V1.

---

## 10. Packages / forfaits

StyleSeat Service Packages = crédits prépayés.  
Skedisy L3 : packs entretien (takedown + pose + suivi), packs silk press, etc.  
= revenus récurrents + fidélisation.

---

## 11. Acquisition : deux valeurs à vendre au salon

| Valeur 1 — garder | Valeur 2 — apporter (plus tard) |
|---|---|
| IG / WA / Google / clientes existantes → Skedisy | Marketplace / search « Knotless Paris » → salon |

Ne pas promettre V2 dans le wedge fondateur ; l’annoncer comme **niveau croissance**.

---

## 12. Côté cliente (couverture StyleSeat Help)

Découvrir · Réserver · Payer · Sécuriser · Fidéliser.  
Skedisy priorise d’abord **Réserver + Payer + Sécuriser + Préparer** sur le lien salon ; discovery marketplace = L3.

---

## 13. Croisement avec l’audit avis → 7 problèmes produit

(Chiffres = ordres de grandeur des analyses Skedisy ; se référer aux docs source pour N exacts.)

| # | Question cliente / salon | Réponse produit |
|---|---|---|
| 1 | Combien ça coûte vraiment ? | Moteur de prix (+ add-ons) |
| 2 | Combien de temps ? | Moteur de durée |
| 3 | Quoi faire avant de venir ? | Préparation + rappels |
| 4 | La coiffeuse a-t-elle compris ? | Config + photo + validation soft |
| 5 | Qu’est-ce qui est inclus ? | Fiche presta structurée + add-ons |
| 6 | Et si je ne viens pas / j’annule ? | Acompte + politiques acceptées |
| 7 | Comment retrouver ma coiffure habituelle ? | Beauty Profile + rebooking |

---

## 14. Roadmap à 4 niveaux (canon StyleSeat × Skedisy)

### 🔴 Niveau 1 — Indispensable (Service + Booking Engine)

**Service Engine**
- Description structurée (inclus / prep / important / politique)
- Prix & durée de base
- Variantes (finesse, longueur, mèches, …) — salon configurable
- Add-ons (prix + durée)
- Photo inspiration selon règle presta
- Conditions / acceptation politique

**Booking Engine**
- Dispos (existant)
- Acompte configurable
- Politique annulation / no-show (affichée)
- Rappels (+ prep)

*Alignement code actuel :* demand/quote inline, acompte partiel, upload photo, seed config — **à étendre**, pas à réécrire en tunnel séparé.

### 🟠 Niveau 2 — Difficile à remplacer

- Beauty Profile (historique, photos, préférences, dernière config)
- Smart Rebooking (« reprendre ma dernière »)
- Actual vs Planned (durée / prix réel vs estimé)
- Application auto late-cancel / no-show (si carte)

### 🟡 Niveau 3 — Croissance salon

- Marketplace / acquisition
- IG → Skedisy, Google → Skedisy
- Promotions, fidélité, packages
- Stats / réactivation

### 🟢 Niveau 4 — Intelligence Skedisy

Apprendre par presta réelle : configs choisies, durées réelles, add-ons populaires, retour clientes, retards, prep problématiques, prix acceptés, rentabilité.  
= « SQUIRE de la coiffure Afro », pas clone Planity ni clone StyleSeat.

---

## 15. Ce qu’on n’implémente **pas** maintenant

Ce document **n’autorise aucun code**.  
Les sprints existants restent valides ; les items StyleSeat ci-dessus s’ajoutent aux **backlogs plan** (`TACHES_PAR_ETAPE`, `IMPLEMENTATION_PLAN`, catalogues).

---

## 16. Documents à tenir alignés

| Doc | Rôle après StyleSeat |
|---|---|
| `README.md` | Index + lien vers ce fichier |
| `FONDATEUR_WEDGE_DECISION.md` | Vision « RDV parfaitement préparé » |
| `IMPLEMENTATION_PLAN_SQUIRE.md` | Phases × niveaux 1–4 StyleSeat |
| `PROMPT7_SQUIRE_BLUEPRINT.md` | Chaîne cœur + Service objet métier |
| `TACHES_PAR_ETAPE_WORKFLOW.md` | Add-ons, prep fiche, politiques, rebooking |
| `CATALOGUE_TACHES_FLOW_RESERVATION_SKEDISY.md` | Types de tâches add-on / prep / policy |
| `SYNTHESE_CHAMPS_PRECISION_RESERVATION.md` | Config vs add-ons ; pas S/M/L |
| `DECISION_RESERVATION_SANS_FRICTION.md` | Prep post-confirm ; politiques sans friction morte |
| `PRINCIPE_UX_PAS_SUR_MESURE.md` | Service riche ≠ badge « Sur mesure » |
| `PROPOSITION_MARKETING_3MOIS.md` | Pitch « micro-problèmes » + 2 valeurs |

---

## 17. Décisions figées (StyleSeat × Skedisy)

1. Le cœur n’est pas l’agenda : c’est la **chaîne Prestation → … → Rebooking**.  
2. Le **Service** est un objet métier (config + add-ons + prep + politiques).  
3. **Add-ons** sont first-class (prix + durée).  
4. **Préparation** fait partie de la réservation (confirm + rappels).  
5. **Beauty Profile + rebooking** = différenciation L2.

**Roadmap produit (hors paiement) :** `ROADMAP_4_COUCHES_HORS_PAIEMENT.md` — état code + gaps P0–P3 + blueprint Knotless.  
**Implémentation P0–P3 (prep J-1) :** `SPRINT_I_P0_P3_SERVICE_ENGINE.md`.  
6. **Marketplace** = L3, pas le wedge.  
7. Claims StyleSeat ≠ preuves ; avis Skedisy = priorisation.  
8. UX Skedisy : rester dans le tunnel **Réserver** unique (pas second produit StyleSeat-like nommé « projet »).
