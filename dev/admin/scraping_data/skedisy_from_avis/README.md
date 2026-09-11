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
