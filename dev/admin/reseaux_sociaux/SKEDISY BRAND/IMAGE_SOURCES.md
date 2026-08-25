# Images Skedisy — sources pour Runway

Deux types d’images **déjà sur Skedisy** — pas besoin de générer une fausse façade.

---

## 1. Photos salons (priorité Runway)

Uploadées par les salons → `https://skedisy.com/storage/...`

**Usage Runway :** Gen-4 **References** pour shots « découverte salon » et « sortie coiffée » — la vitrine / intérieur doit matcher la photo réelle.

| Salon | Zone | Images | Fiche |
|--------|------|--------|--------|
| For Eve Hair | Paris 18 · Château Rouge | `SALONS/For Eve Hair Paris 18/exterior/` | [fiche](https://skedisy.com/salon/for-eve-hair-salon-de-tresses-et-tissages-chteau-rouge-paris-18-69cc37) |
| Coiffure Beauté Brasil | Paris 13 | `SALONS/Coiffure Beaute Brasil Paris 13/exterior/` | [fiche](https://skedisy.com/salon/coiffure-beaute-brasil-6885e2) |
| Taco coiffure | Paris 10 · Strasbourg | `SALONS/Taco Coiffure Paris 10/exterior/` | [fiche](https://skedisy.com/salon/taco-coiffure-69c99f) |
| Solivans Hair | Paris 5 | *(à déposer)* 8 images storage | [fiche](https://skedisy.com/salon/solivans-hair-6842c7) |
| PMT Coiffure | Paris 12 | *(à déposer)* | [fiche](https://skedisy.com/salon/pmt-coiffure-69c998) |
| Mars | Paris 14 | *(à déposer)* | [fiche](https://skedisy.com/salon/mars-6a2ec9) |

**Comment récupérer :** ouvrir la fiche salon → clic droit sur l’image → ou inspecter la page (JSON-LD `"image": "https://skedisy.com/storage/..."`).

---

## 2. Visuels marque Skedisy (ambiance / mood)

Dans le repo : `dev/admin/salonportal/public/images/`  
Copies locales : `SKEDISY BRAND/reference-shots/`

| Fichier | Usage |
|---------|--------|
| `hero-tresses-salon-interior.png` | Ambiance salon pro (comme hero site) |
| `client-tresses-en-cours.png` | Résultat tresses / client |
| `client-experience-salon.png` | Expérience salon |
| `pro-square-locks.png` | Locks / texture |

**Usage Runway :** référence **style / lumière / coiffure** — pas pour remplacer la photo du salon partenaire.

---

## 3. Saint-Denis / Montreuil

Pas encore de fiche Skedisy **live** avec photos propres en 93 (sitemap actuel = 35 salons).  
En attendant : **Paris 10** (Taco, Bd Strasbourg) = proche Faubourg Saint-Denis · ou réclamer un salon 93 → photos iront dans `storage/`.

---

## Règle Runway

| Shot | Image |
|------|--------|
| Maya (personnage) | `CHARACTERS/Skedisy Girl/reference/maya-ref-01.png` |
| Façade / salon réel | Photo **`skedisy.com/storage`** du salon |
| Ambiance coiffure | Optionnel : `SKEDISY BRAND/reference-shots/` |
| UI / prix | **Jamais IA** — card ou recording réel |
