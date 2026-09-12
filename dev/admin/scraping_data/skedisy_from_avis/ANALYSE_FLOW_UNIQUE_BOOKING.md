# Analyse — Un seul flow booking (convergence devis ↔ réservation)

**Date :** 2026-09-12  
**Question :** Avec les données personnes (avis Afro), l’expérience doit différer du booking catalogue — mais **pas** via deux produits (devis *ou* résa). Que faire converger ?

**Canvas :** `skedisy-flow-convergence.canvas.tsx`

---

## Verdict

**Option C — Une coquille booking + Complexity Engine (adaptive).**

- **1 CTA** : « Réserver » (lien WA/IG = même entrée).
- **Profondeur variable** selon tier service (S0→S3) : 0 question → 2–5 questions / photo / review salon.
- **Interne :** S1+ = `ServiceDemand` (devis + acompte) → convert `Booking` ; S0 = `Booking` direct.
- La cliente ne choisit jamais « devis vs réservation ».

**Rejeter** le dual tunnel actuel (2 CTA).  
**Éviter** « always Demand » pour S0 (friction inutile + risque break stack booking).

---

## Pourquoi (données)

| Signal | Implication |
|---|---|
| Prix / durée / compréhension = top douleurs | Qualif avant créneau quand la presta l’exige |
| 343/458 sans widget booking | Un lien unique depuis WA, pas un menu de modes |
| Blueprint §6–7 | Workflow *dynamique*, pas deux tunnels figés |
| Wedge fondateur | Qualif→devis→acompte = *étapes*, pas un second produit |

La différenciation vs Planity = **configuration → prix/durée → engagement**, pas un bouton « Devis ».

---

## Options scorées

| | A Dual (actuel) | B Always Demand | **C Adaptive shell** |
|---|---:|---:|---:|
| Clarté cliente | 2 | 4 | **5** |
| Fit avis | 3 | 5 | **5** |
| S0 rapide | 5 | 2 | **5** |
| Diff. Planity | 3 | 5 | **5** |
| Coût / risque | 5 | 2 | 3 |
| Inbox pro | 2 | 5 | 4 |
| **Total** | 20 | 23 | **27** |

---

## Flow unifié (vue)

```
Lien / Réserver
  → Service
  → Qualif (0–N selon afroConfig / tier)
  → Récap prix + durée  (catalogue OU devis)
  → Créneau (durée = estimate)
  → Paiement (acompte si policy, sinon flux actuel)
  → Confirm (Booking ; Demand liée si S1+)
```

---

## Migration si C validé

1. Fusionner dans `salon-booking.js` les steps qualif/devis (retirer 2ᵉ CTA).
2. Checkout unique (acompte vs plein selon règles service).
3. Déprécier `salon-afro-demand.js`.
4. Panel Demand = file S1+ / review / acomptes (pas un 2ᵉ monde cliente).
5. Flutter plus tard = **même règle**, un seul flow.

---

## Décision à confirmer

- [ ] **C** — coquille unique adaptive (recommandé)
- [ ] B — Demand pour tout
- [ ] A — garder dual temporairement

Une fois C confirmé → implémentation web fusion avant toute feature app.
