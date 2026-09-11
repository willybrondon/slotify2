# Étape 1 — Classification salons IDF (coiffure afro)

## Fichiers produits

| Fichier | Contenu |
|--------|---------|
| `AFRO_pertinents.json` / `.csv` | Salons pertinents pour l'étude afro (confiance moyen/élevé) |
| `UNCERTAIN_a_verifier.json` / `.csv` | Salons à vérifier (inconnu / signal insuffisant) |
| `DEEP_DIVE_recommandes.json` | Priorités d'analyse manuelle / enrichissement |
| `HORS_perimetre.json` | Hors étude afro (euro, spa, esthétique, autre…) |
| `ALL_classified.json` | Classification complète dédupliquée |
| `SUMMARY_etape1.json` | Comptages + limites méthodologiques |

## Limites des données (FAITS)

- Champ `about` = quasi toujours « Salon trouvé via Google Places » → **non discriminant**.
- `serviceIds` vides → **aucune prestation** exploitable.
- Pas de catégories Google Places dans `metadata` (seulement `department`, `website`, `scraped_at`).
- Pas d'Instagram/Facebook/TikTok dédiés sauf si l'URL `website` pointe vers un réseau.
- Images présentes mais **non analysées** (pas d'inférence visuelle).
- Champs sensibles ignorés : `password`, `claimToken`, etc.

## Règles de classification

1. Catégorie = meilleure correspondance lexicale dans **nom / description utile / URL**.
2. **Jamais** confiance `élevé` pour une catégorie afro-family si le **seul** signal est le nom.
3. `faits` = ce qui est littéralement dans le texte public du JSON.
4. `hypotheses` = interprétations non vérifiées (marquées séparément).
5. Les incertains **ne sont pas supprimés** : fichier `UNCERTAIN_*`.

## Fichiers

| Fichier | Rôle |
|--------|------|
| `AFRO_pertinents.*` | Sample afro (étape 1) |
| `DEEP_FICHES_parcours_cliente.json` | Fiches A–H (crawl sites) |
| `DEEP_FICHES_enrichies.json` | Fiches + preuves Planity/pages RDV |
| `DEEP_MATRICE_problemes_finale.csv` | Matrice Salon/Problème/Preuve/… |
| `DEEP_RAPPORT_parcours_cliente.md` | Synthèse parcours |
| `DEEP_PATTERNS_opportunite.json` | Clusters Skedisy |

## Fichiers (SQUIRE)

| Fichier | Rôle |
|--------|------|
| `SQUIRE_TOP20.csv` | Classement TOP 20 willingness-to-pay |
| `SQUIRE_ANALYSIS.json` | Scores + catégories 1–22 + thèse |
| `SQUIRE_RAPPORT.md` | Synthèse |
| Canvas IDE | `squire-afro-idf-top20.canvas.tsx` |


