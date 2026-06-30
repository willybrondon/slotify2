# Comptabilité EI Skedisy — modèles Google Sheets

Modèles pour une **entreprise individuelle** en **réel simplifié BIC** + **réel simplifié TVA** (exercice au **31/12**).

## Import dans Google Sheets

1. [Google Sheets](https://sheets.google.com) → **Nouveau** → **Importer**
2. Importer chaque fichier CSV comme **onglet séparé** :
   - `01-recettes.csv` → onglet **Recettes**
   - `02-depenses.csv` → onglet **Dépenses**
   - `03-tva-trimestre.csv` → onglet **TVA**
   - `04-categories-depenses.csv` → onglet **Catégories**
   - `05-synthese-annuelle.csv` → onglet **Synthèse**
   - `06-stripe-rapprochement.csv` → onglet **Stripe**
   - `07-lignes-facture.csv` → onglet **Lignes facture**

Ou : copier-coller le contenu de chaque CSV dans un onglet.

## Facture PDF

- Ouvrir `facture-modele.html` dans Chrome → remplacer les `[placeholders]`
- **Ctrl+P** → Enregistrer en PDF
- Référence mentions : `mentions-legales-facture.txt`

## Formules utiles (à ajouter dans Google Sheets)

### Onglet Recettes — ligne totaux

```
=SUM(E2:E1000)   → Total HT
=SUM(F2:F1000)   → Total TVA collectée
=SUM(G2:G1000)   → Total TTC
```

### Onglet Dépenses — ligne totaux

```
=SUM(E2:E1000)   → Total dépenses HT
=SUM(F2:F1000)   → Total TVA déductible
```

### Onglet TVA — remplir depuis les autres onglets (exemple T1)

- **TVA collectée** : somme colonne TVA des recettes du trimestre
- **TVA déductible** : somme colonne TVA des dépenses du trimestre
- **TVA nette** : collectée − déductible (si négatif = crédit de TVA)

### Onglet Synthèse

```
Résultat = Total recettes HT − Total dépenses HT
```

## Rapprochement Stripe (onglet Stripe)

1. Stripe Dashboard → **Paiements** → **Exporter** (CSV) — ou Balance transactions
2. Coller les lignes dans l’onglet **Stripe** (colonnes alignées)
3. Renseigner **N° facture liée** pour chaque `charge` encaissée
4. Vérifier : **Net encaissé** Stripe ≈ **TTC** de la facture (colonne Écart = 0)
5. Les **frais Stripe** → copier en **Dépenses** (catégorie Frais bancaires)

Formule utile (TTC → HT dans Recettes) :

```
HT  = TTC / 1,2
TVA = TTC - HT
```

Exemple Google Sheets (TTC en G2) : `=G2/1,2` pour HT, `=G2-E2` pour TVA.

## Workflow facture → compta

1. Créer la facture (`facture-modele.html` → PDF)
2. Saisir les lignes dans **Lignes facture** (multi-lignes si besoin)
3. Reporter le total dans **Recettes** (une ligne par facture)
4. Si paiement Stripe : lier dans **Stripe** + marquer Encaissé = Oui dans Recettes

## Règles Skedisy

1. **Compte bancaire pro** uniquement pour l’activité
2. **Une facture** par commission / abonnement / prestation facturée
3. Conserver PDF dans un dossier : `Factures émises/` et `Factures reçues/`
4. **Stripe** : export mensuel → onglet Stripe + frais en Dépenses
5. Déclaration **CA3** chaque trimestre (si option trimestrielle cochée)
6. Déclaration **2031** chaque printemps pour l’exercice clos au 31/12

## Numérotation factures

Format conseillé : `F-AAAA-001`, `F-AAAA-002`, … (sans trou)

Mentions minimales : nom EI, SIRET, adresse, date, description, HT, TVA, TTC, conditions de paiement.

## Calendrier 2026 (exercice 31/12)

| Échéance | Action |
|----------|--------|
| 30/04/2026 | CA3 T1 |
| 31/07/2026 | CA3 T2 |
| 31/10/2026 | CA3 T3 |
| 31/01/2027 | CA3 T4 |
| Avr.–mai 2027 | 2031 + impôt sur le revenu |

## Outils en ligne (optionnel)

- **Indy**, **Tiime**, **Henrri**, **Freebe** — peuvent remplacer ou compléter ces tableurs pour les CA3.

---

*Modèle indicatif — faire valider la première clôture par un expert-comptable si besoin.*
