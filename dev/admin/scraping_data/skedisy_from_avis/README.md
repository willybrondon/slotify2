# Skedisy — build from real Google avis (extract_afro_avis_idf)

Workstream product/research based on Places Legacy extraction (IDF, avis + avis négatifs).

## Prompt 1 — Classification

```bash
python etape1_classify.py
```

→ `AFRO_pertinents.*`, `UNCERTAIN_a_verifier.*`, `AVIS_NEGATIFS_pour_produit.json`

## Prompt 2 — Parcours cliente (enquête publique)

```bash
python etape2_parcours_cliente.py
```

→ `DEEP_FICHES_parcours_cliente.json` (A–H)  
→ `DEEP_MATRICE_problemes.csv` (Salon | Problème | Preuve | Source | …)  
→ `DEEP_PATTERNS_opportunite.json`, `DEEP_RAPPORT_parcours_cliente.md`

## Prompt 3 — SQUIRE

```bash
python etape3_squire_rank.py
```

## Prompt 5 — Audit épistémologique

→ `PROMPT5_AUDIT_EPISTEMOLOGIQUE.md`  
→ Canvas: `skedisy-audit-hypotheses.canvas.tsx`

## Prompt 6 — Product Strategy Audit (SQUIRE)

→ `PROMPT6_PRODUCT_STRATEGY_AUDIT.md`  
→ Canvas: `skedisy-product-strategy-audit.canvas.tsx`

## Prompt 7 — SQUIRE Blueprint (décision build)

Sans interviews terrain — base = données publiques + Prompts 1–6.

→ `PROMPT7_SQUIRE_BLUEPRINT.md`  
→ Canvas: `skedisy-squire-blueprint.canvas.tsx`

## Plan d’implémentation (sans code)

Cartographie existant Skedisy × Blueprint · phases · sprints · décisions D1–D7.

→ `IMPLEMENTATION_PLAN_SQUIRE.md`

## Suite nouvel extract (2973 places · 2026-09-11 18:06)

Plus d’avis / avis négatifs (volume), schéma inchangé.  
→ `UPDATE_APRES_EXTRACT_180628.md`

**Re-run fait :** prompts 1→2→3 · **458** Afro pertinents · thèmes ordre inchangé · chiffres prompts 5–7 mis à jour · wedge/MVP non réécrits.

## Sprint A — code foundations (FAIT)

→ `SPRINT_A_DEMAND_FOUNDATIONS.md`  
Models + `/api/public/demand/*` + `/salon/demand/*` · moteur devis Knotless S2.

## Sprint B/C/D — tunnel + acompte + panel (FAIT code)

→ `SPRINT_B_TUNNEL_DEPOSIT.md` · `SPRINT_C_PANEL_CONFIG.md`  
Tunnel web · Stripe acompte · convert booking · inbox + config salon + lien WA.

## Sprint E — onboarding + notifs (FAIT code)

→ `SPRINT_E_ONBOARDING_NOTIFS.md`  
Checklist 3 étapes · emails demande/acompte · reste dû bookings.

## Marketing 3 mois

→ `PROPOSITION_MARKETING_3MOIS.md`

## StyleSeat — apprentissages à intégrer (plan only)

Lecture braiders StyleSeat + help client × audit avis.  
**Aucune implémentation** — enrichit vision, Service Engine, prep, add-ons, Beauty Profile, rebooking, roadmap L1–L4.

→ `STYLESEAT_LEARNINGS_PLAN.md`  
→ Rebooking auto (L1) : `REBOOKING_AUTO_IMPLEMENTATION.md`  
→ Fidélisation (rebook + historique) : `FIDELISATION_REBOOKING.md`

**Vision recalée :** Skedisy = système qui transforme une prestation complexe en **rendez-vous parfaitement préparé** (chaîne Prestation → Config → Prix → Durée → Prep → Acompte → RDV → Historique → Rebooking).
