# Mise à jour suite nouvel extract (2026-09-11 18:06)

**Source nouvelle :** `extract_afro_avis_idf/*_20260911_180628.*`  
**Base des prompts 1–7 :** checkpoint / ALL ~12h (≈618–1758 places → **329** Afro pertinents)

---

## 1. Qu’est-ce qui a changé dans les données ?

| Indicateur | Avant (prompts) | Nouveau extract | Delta |
|---|---:|---:|---|
| Établissements uniques | ~618 (ALL 12h) / 1758 (checkpoint étape1) | **2973** | ×3–5 |
| Avec avis API | ~604 | **2901** | + |
| Salons avec avis négatifs index | 293 | **1374** | ×4,7 |
| Textes avis négatifs | ~533 | **2342** | ×4,4 |
| Email | 0 | **0** | inchangé |
| Téléphone / site | présents | plus nombreux | volume |

### Schéma avis / avis_négatifs

**Aucun nouveau champ.**  
Toujours : `auteur`, `note`, `texte`, `langue`, `relative_time`, `time`, `negatif`, `source_api`.

→ « Informations ajoutées » = **plus de salons + plus d’avis**, pas une enrichment de structure (pas d’email, pas d’inbox WA, pas de durée réelle).

### Themes (proxy mots-clés sur index négatifs — brut, non classifié Afro)

Ordre **inchangé** (renforce les prompts, ne les contredit pas) :

| Thème | Ancien index | Nouvel index |
|---|---:|---:|
| Prix | 136 | **563** |
| Mèches / qualité / tresses… | 125 | **546** |
| Durée / attente | 91 | **375** |
| Résa / WA / IG / joindre | 84 | **372** |
| Hygiène | 34 | **124** |
| Compréhension presta | 28 | **98** |
| Acompte / annulation | 11 | **59** |

**Note :** ces comptes incluent du bruit (ex. salons UV type « Black Sun » dans l’extract brut). La classification Afro (étape 1) reste obligatoire avant de mettre à jour les chiffres « officiels » des prompts.

---

## 2. Impact sur les conclusions des prompts

| Prompt / livrable | Faut-il changer la thèse ? | Faut-il rafraîchir les chiffres ? |
|---|---|---|
| **1** Classification | Non (méthode OK) | **Oui** — rejouer sur 2973 |
| **2** Parcours / patterns | Non (mêmes douleurs) | **Oui** — O1–O7 counts |
| **3** SQUIRE TOP20 | Non (ranking themes OK) | **Oui** — scores / % |
| **4** Wedge fondateur | **Non** — wedge tient | Mentionner sample élargi |
| **5** Audit épistémique | **Non** — limites inchangées | Mettre à jour N salons |
| **6** Product Strategy | **Non** | Annexer nouveaux N |
| **7** Blueprint | **Non** | Idem |
| **Implémentation** | **Non** (gaps code inchangés) | Rien de bloquant |
| **Marketing 3 mois** | **Non** | Contenu peut citer thèmes renforcés |

### Ce qui est renforcé (pas nouveau)

1. Prix imprévisible  
2. Qualité / mèches / cheveux  
3. Durée / attente  
4. Friction réservation / communication  

### Ce qui reste faible / à ne pas sur-interpréter

- **Acompte / no-show** : encore peu présent dans les avis Google (même à 59 salons proxy) → ne pas pivoter la stratégie marketing sur le no-show  
- Toujours **≤5 avis/salon** Google  
- Toujours **pas** d’inbox WA/IG, pas de durée prévue/réelle, pas d’email  

---

## 3. Modifications à faire (plan d’action)

### A — Obligatoire (données → analyses)

1. **Rejouer Prompt 1**  
   - Source : `_checkpoint.json` à jour **ou** `salons_afro_idf_ALL_20260911_180628.json`  
   - Vérifier que `etape1_classify.py` pointe bien sur le bon fichier  
   - Outputs attendus : nouveau `AFRO_pertinents.*`, `UNCERTAIN_*`, `AVIS_NEGATIFS_pour_produit.json`, `SUMMARY_etape1.json`

2. **Rejouer Prompt 2** (crawl sites + matrice)  
   - Sur le **nouveau** set Afro pertinent seulement  
   - Nouveau `DEEP_PATTERNS_opportunite.json` (outils booking, acompte visible, thèmes)

3. **Rejouer Prompt 3**  
   - Nouveau `SQUIRE_TOP20.*` / `SQUIRE_ANALYSIS.json`

### B — Mise à jour documentaire (léger)

4. Ajouter un encadré « Sample 2026-09-11 18:06 » dans :
   - `PROMPT5_AUDIT_EPISTEMOLOGIQUE.md`  
   - `PROMPT6_PRODUCT_STRATEGY_AUDIT.md`  
   - `PROMPT7_SQUIRE_BLUEPRINT.md`  
   - `IMPLEMENTATION_PLAN_SQUIRE.md` (1 ligne : base data élargie, wedge inchangé)

5. **Ne pas** réécrire le wedge / MVP / engines tant que l’étape 1–3 n’a pas confirmé un changement d’ordre des thèmes sur le sous-échantillon **Afro pertinent**.

### C — Inutile / distraction

- Relancer un Prompt 6/7 « from scratch »  
- Changer le plan d’implémentation code (Demand / Complexity / Acompte)  
- Ajouter newsletter/blog à cause du volume d’avis  
- Traiter les 2973 comme « tous Afro » sans reclassification  

### D — Vigilance qualité

- L’index négatifs contient des **hors-cible** (UV, etc.) → le bruit augmente avec le volume  
- Après étape 1 : comparer ratio `afro_pertinent / input` vs 329/1758  
- Si beaucoup d’UNCERTAIN : prioriser revue manuelle avant deep dive  

---

## 4. Est-ce que le produit / implémentation change ?

**Non, pas sur la base du seul volume.**

Le nouvel extract **confirme** :

- Même moment de vérité (qualif / prix / durée / prep)  
- Même wedge : Qualif → devis/durée → acompte  
- Même MVP 5 features  

Seule évolution possible **après** re-run 1–3 :

- Ajuster les **priorités de variables** du Complexity Engine (ex. si « perruque/lace » monte fortement vs braids)  
- Ajuster les **exemples marketing** / posts douleur avec citations plus fraîches  

---

## 5. Checklist courte

- [ ] Pointer étape 1 sur extract `180628` / checkpoint à jour  
- [ ] Exécuter `etape1_classify.py`  
- [ ] Exécuter `etape2_parcours_cliente.py`  
- [ ] Exécuter `etape3_squire_rank.py`  
- [ ] Diff des `SUMMARY_*` et `DEEP_PATTERNS_*` (ordre des thèmes)  
- [ ] Si ordre inchangé → patch doc « N mis à jour, thèse confirmée »  
- [ ] Si ordre change → note courte + éventuel ajustement Blueprint §Service Engine seulement  

---

## 6. Synthèse

| Question | Réponse |
|---|---|
| Nouveaux champs avis ? | **Non** |
| Plus de preuves sur les mêmes douleurs ? | **Oui** (volume ×~4) |
| Remettre en cause SQUIRE / wedge ? | **Non** |
| Action immédiate ? | **Rejouer prompts 1→3**, puis mettre à jour les chiffres dans 5–7 |
| Action code Skedisy ? | **Aucune** liée à cet extract |

---

## 7. FAIT — re-run effectué (2026-09-11 soir)

| Étape | Résultat |
|---|---|
| Prompt 1 | **458** Afro pertinents / 2973 (était 329) · 2182 uncertain · 333 hors |
| Prompt 2 | 246 sites OK · thèmes : qualité **118**, prix **96**, durée **73**, compréhension **63**… |
| Prompt 3 | TOP5 inchangé · wedge **confirmé** |
| Ordre thèmes | **Identique** → Blueprint / MVP / plan implémentation **non réécrits** |
| Docs 5–7 | Chiffres mis à jour |

*Document généré pour cadrer la suite — section 7 = exécution.*
