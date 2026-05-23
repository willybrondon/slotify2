# Audit alignement — Site · App · Authenticité

> **Objectif :** checklist page par page avant gros push réseaux (IG / FB / TikTok).  
> **Références :** [AUTHENTICITE_SKEDISY.md](./AUTHENTICITE_SKEDISY.md) · [PARCOURS_SITE_AVANT_RESEAUX.md](./PARCOURS_SITE_AVANT_RESEAUX.md) · [CATEGORIES_SERVICES_AFRO_IDF.md](./CATEGORIES_SERVICES_AFRO_IDF.md)  
> **Date audit :** mai 2026 · **Périmètre :** IDF uniquement, beauté afro

**Légende :**  
- ✅ Aligné ou acceptable  
- 🟡 Partiel — à corriger avant pub massive  
- ❌ Non aligné — bloquant ou prioritaire  
- ⬜ Non vérifié en prod (à cocher après déploiement)

---

## Synthèse exécutive

| Zone | Statut global | Priorité |
|------|---------------|----------|
| Home cliente `/` | 🟡 Bon message, détails mineurs | P2 |
| Home pro `/professionnel/` | 🟡 Bon message | P2 |
| **Stores Play / App Store** | ❌ Hors repo, copy généraliste en ligne | **P1** |
| **Fiches salon** `/salon/...` | ❌ EN, pas d’encart IDF | **P1** |
| **Pages catégorie** `/category/...` | ❌ EN, copy générique | **P1** |
| **Catégories API / admin** | ❌ ≠ 5 catégories afro IDF | **P1** |
| Pages légales | ❌ Téléphone +237 | **P1** |
| Blog `/blog/` | ✅ Hub minimal (guides + à venir) | — |
| App Flutter (in-app) | 🟡 À valider store + parcours | P2 |
| Chiffres publics | ✅ Pas de faux 50k/10M sur home refaite | — |
| Réseaux sociaux (footer) | ✅ Liens FB / IG / TikTok | — |

**Verdict :** le **site marketing refondu** raconte la bonne histoire ; le **parcours public complet** (fiche salon → app, stores, catégories) n’est **pas encore** aligné pour une campagne à grande échelle.

---

## Ordre de travail recommandé

1. ⬜ **P1 — Stores** : textes afro + IDF (client + expert si listé)  
2. ⬜ **P1 — Fiches salon** : « Réserver sur l’app », FR, encart IDF  
3. ⬜ **P1 — Catégories** : 5 catégories en base + admin + menu site  
4. ⬜ **P1 — Légal** : retirer +237, contact IDF / support@skedisy.com  
5. ✅ **P2 — Blog** : hub minimal `/blog/`  
6. ✅ **P2 — Pages catégorie** : FR + « Voir & réserver sur l’app » (Lot A)  
7. ⬜ **P2 — Nettoyage** `language.js` (clés Planity dormantes)  
8. ⬜ **P3 — Chiffre honnête** salons IDF (si affiché en pub)

---

## 1. Stores (Google Play · App Store)

> Les textes stores **ne sont pas dans le repo** — mise à jour manuelle dans les consoles. Comparer avec ce qui est **en ligne** aujourd’hui.

### 1.1 App cliente

| # | Critère | Statut | Fichier / action |
|---|---------|--------|------------------|
| 1.1.1 | Titre mentionne beauté **afro** ou cheveux texturés | ⬜ | [Play](https://play.google.com/store/apps/details?id=com.skedisy.customer) · [App Store](https://apps.apple.com/fr/app/skedisy/id6752954525) |
| 1.1.2 | Description mentionne **Île-de-France** (pas « toute la France ») | ⬜ | Console stores |
| 1.1.3 | Prestations citées : tresses, locks, perruques, homme, esthétique | ⬜ | Aligné [AUTHENTICITE §16](./AUTHENTICITE_SKEDISY.md#16-alignement-fiches-stores-priorité) |
| 1.1.4 | Retirer massage, facial, spa générique, « tous types de beauté » | ⬜ | Doc dit encore copy généraliste |
| 1.1.5 | Concierge IA mentionné comme **option**, pas headline seule | ⬜ | |
| 1.1.6 | Captures d’écran = app réelle (salons afro si possible) | ⬜ | |

**Copy prêt à coller :** voir **[LOT_B_STORES_FR.md](./LOT_B_STORES_FR.md)** (Play + App Store, cliente + expert, légendes captures, checklist).

### 1.2 App expert / pro

| # | Critère | Statut | Fichier / action |
|---|---------|--------|------------------|
| 1.2.1 | Package `com.skedisy.expert` — description **salons afro IDF** | ⬜ | Play Console |
| 1.2.2 | Agenda, réservations, pas « beauté générique » | ⬜ | |

### 1.3 Repo technique (métadonnées build)

| # | Critère | Statut | Fichier |
|---|---------|--------|---------|
| 1.3.1 | `pubspec.yaml` description = placeholder générique | 🟡 | `dev/flutter/multi_salon_customer/pubspec.yaml` |
| 1.3.2 | Pas de `fastlane` / metadata store versionnée | 🟡 | À créer si vous versionnez le copy store |

---

## 2. Site marketing — skedisy.com

### 2.1 Page cliente `/` (`salonportal/index.html`)

| # | Critère | Statut | Notes |
|---|---------|--------|-------|
| 2.1.1 | Hero : beauté afro + **IDF** | ✅ | |
| 2.1.2 | Parcours **découvrir sur le site / réserver sur l’app** | ✅ | FAQ + hero |
| 2.1.3 | 5 catégories en bandeau (Tresses, Locks, Perruques, Homme, Esthétique) | ✅ | Pills footer trust bar |
| 2.1.4 | Menu catégories = **API** (peut différer des 5) | 🟡 | Voir §5 |
| 2.1.5 | Photos communauté (`images/client/`) | ✅ | |
| 2.1.6 | Noir & blanc, pas violet / dégradés IA | ✅ | |
| 2.1.7 | QR **cliente** seulement (pas expert) | ✅ | |
| 2.1.8 | Pas de stats Planity (50k / 10M) sur la page | ✅ | |
| 2.1.9 | Footer : WhatsApp **+33**, réseaux sociaux | ✅ | |
| 2.1.10 | Lien **Blog** → `/blog/` | ✅ | `salonportal/blog/index.html` |
| 2.1.11 | Témoignages = éditoriaux (OK si pas présentés comme avis vérifiés en pub) | 🟡 | |

### 2.2 Page pro `/professionnel/`

| # | Critère | Statut | Notes |
|---|---------|--------|-------|
| 2.2.1 | Message salons afro IDF, gratuit pour commencer | ✅ | |
| 2.2.2 | Problème Instagram / WhatsApp (pas seul argument) | ✅ | |
| 2.2.3 | Séparation claire cliente vs pro | ✅ | Lien « Clients » |
| 2.2.4 | Photos pro (`images/pro/`) | ✅ | |

### 2.3 Autres pages salonportal

| Page | Statut | Problème principal |
|------|--------|-------------------|
| `ai-concierge.html` | 🟡 | OK pilier compréhension ; copy EN partiel |
| `request-adding-salon.html` | 🟡 | Formulaire pro, pas critique réseaux clientes |
| `docs/index.html` | 🟡 | Doc technique EN, exemples Haircut / Facial |
| `cookies.html` / `privacy.html` / `terms.html` | ❌ | **+237** en footer contact |
| Anciennes pages non refondues | 🟡 | Vérifier si encore servies en prod |

---

## 3. Fiches salon web `/salon/{slug-id}`

> Générées par le backend : `dev/admin/backend/controller/user/salon.controller.js`

| # | Critère | Statut | Ligne / zone code (indicatif) |
|---|---------|--------|-------------------------------|
| 3.1 | `<html lang="fr">` par défaut | ❌ | `lang="en"` ~L972 |
| 3.2 | CTA principal **« Réserver sur l’app »** (pas « Book Now ») | ❌ | Hero ~L2068, services ~L832 |
| 3.3 | Sous-texte : réservation sur l’app Skedisy (gratuite) | ❌ | |
| 3.4 | Encart fixe **Île-de-France · beauté afro** | ❌ | |
| 3.5 | Value props génériques (« Elegant Atmosphere », « Expert Stylists ») | ❌ | ~L2100–2114 |
| 3.6 | Sections EN : Staff, Services, Other Services | ❌ | |
| 3.7 | Deep link / `#download-customer` fonctionnel | ✅ | `openApp()` |
| 3.8 | Pas de promesse réservation 100 % navigateur | ✅ | Redirige app |
| 3.9 | Meta title/description mentionnent salon + IDF si possible | 🟡 | À vérifier par fiche |

**Test manuel :** ouvrir 2–3 fiches salons IDF en prod après déploiement backend.

---

## 4. Pages catégorie `/category/{slug-id}`

> `dev/admin/backend/controller/user/category.controller.js`

| # | Critère | Statut | Notes |
|---|---------|--------|-------|
| 4.1 | `lang=fr` par défaut ou détection | 🟡 | Query `?lang=fr` supportée |
| 4.2 | CTA **« Voir & réserver sur l’app »** (pas « View & Book ») | ❌ | ~L497 |
| 4.3 | Meta / description **afro IDF**, pas « beauty services near you » générique | ❌ | ~L506–516 |
| 4.4 | Encart app + badges stores | ❌ | |
| 4.5 | Salons listés = bien IDF afro (données scraping) | ⬜ | Données |

---

## 5. Catégories API · Admin · Menu site

### 5.1 Cible (doc)

| # | Catégorie |
|---|-----------|
| 1 | Tresses |
| 2 | Locks |
| 3 | Perruques |
| 4 | Homme |
| 5 | Esthétique |

### 5.2 État actuel

| # | Critère | Statut | Source |
|---|---------|--------|--------|
| 5.2.1 | MongoDB `Category` = 5 noms ci-dessus (FR/EN) | ⬜ | Admin + API prod |
| 5.2.2 | Menu `skedisy.com` = mêmes 5 (API `/api/public/categories`) | ⬜ | `script.js` → `loadCategories()` |
| 5.2.3 | Services salons rattachés aux bonnes catégories | ⬜ | Migration données |
| 5.2.4 | Fichier scraping `cameroon_salon_services.json` = **Cameroun**, catégories génériques (Coiffure, Soins…) | ❌ | Pas le modèle IDF 5 catégories |
| 5.2.5 | Admin panel : création / édition catégories alignée | ⬜ | `admin/backend` category routes |
| 5.2.6 | App Flutter : filtres = 5 catégories | ⬜ | App release |

**Action :** script migration catégories + mapping services existants → voir [CATEGORIES_SERVICES_AFRO_IDF.md](./CATEGORIES_SERVICES_AFRO_IDF.md).

---

## 6. Pages légales & contact

| Fichier | +237 présent | WhatsApp / email IDF | Statut |
|---------|--------------|----------------------|--------|
| `privacy/index.html` | ❌ Oui | support@skedisy.com | ❌ |
| `privacy.html` | ❌ Oui | | ❌ |
| `terms/index.html` | ❌ Oui | | ❌ |
| `terms.html` | ❌ Oui | | ❌ |
| `docs/index.html` (footer) | ❌ Oui | | ❌ |
| `documentation.html` | ❌ Oui | | ❌ |
| Home refaite footer | ✅ | +33 WhatsApp | ✅ |

**Remplacer par :** support@skedisy.com · [WhatsApp +33 7 66 16 03 94](https://wa.me/33766160394) · pas de numéro Cameroun sur communication IDF.

---

## 7. Blog

| # | Critère | Statut |
|---|---------|--------|
| 7.1 | Lien header « Blog » → URL valide | ✅ `salonportal/blog/index.html` · routes `/blog`, `/blog/` |
| 7.2 | Contenu aligné authenticité (IDF, afro, parcours) | ✅ Hub guides (catégories, app, IA, pro) + « articles à venir » |
| 7.3 | Articles longs / CMS | ⬜ Phase 2 (Medium, Notion, etc.) |

---

## 8. App Flutter cliente

> Package `salon_2` — `dev/flutter/multi_salon_customer/`

| # | Critère | Statut | Notes |
|---|---------|--------|-------|
| 8.1 | Onboarding / home parlent **afro** ou IDF | ⬜ | À parcourir en build |
| 8.2 | Filtres catégories = 5 du doc | ⬜ | Lié §5 |
| 8.3 | Parcours réservation clair (salon → experte → créneau) | ✅ | Produit |
| 8.4 | Concierge IA = cheveux texturés | ✅ | Feature |
| 8.5 | Pas de copy « 10M users » in-app | ⬜ | |
| 8.6 | Stores ≠ code (déjà §1) | ❌ | |

**Fichiers utiles pour review :** `lib/language/french_language.dart`, écrans `home`, `search`, `category_*`.

---

## 9. App Flutter expert

| # | Critère | Statut |
|---|---------|--------|
| 9.1 | Positionnement pro / salon afro en store | ⬜ §1.2 |
| 9.2 | App utilisable sans message « beauté générique » | ⬜ |

---

## 10. Chiffres & preuves en public

| # | Critère | Statut | Notes |
|---|---------|--------|-------|
| 10.1 | Aucun « 50 000 salons » / « 10M users » sur home refaite | ✅ | |
| 10.2 | Clés Planity encore dans `language.js` (dormantes) | 🟡 | `hero.subtitle`, `faq.newClientsDesc`, etc. |
| 10.3 | Si pub avec chiffre salons : **nombre réel IDF** uniquement | ⬜ | Ex. « X salons afro en Île-de-France » |
| 10.4 | Témoignages site = ne pas citer comme « clients réelles » sans accord | 🟡 | |

**Obtenir chiffre salons :** requête admin / Mongo `Salon` count IDF actifs.

---

## 11. Réseaux sociaux (préparation contenu)

| # | Critère | Statut |
|---|---------|--------|
| 11.1 | Liens footer : [Facebook](https://www.facebook.com/profile.php?id=61586655939283), [Instagram](https://www.instagram.com/skedisy/), [TikTok](https://www.tiktok.com/@skedisy) | ✅ |
| 11.2 | Bio IG alignée [AUTHENTICITE §9](./AUTHENTICITE_SKEDISY.md) | ⬜ |
| 11.3 | Liens en bio → fiche salon ou home **pas** page pro seule | ⬜ |
| 11.4 | Posts suivent piliers + formule « découvrir → app » | ⬜ |

---

## 12. Checklist « prêt pour 1er post Instagram »

Cocher **tous** les P1 avant lien en bio vers campagne :

- [ ] **1.1** Store cliente : description afro + IDF en ligne  
- [ ] **3.2** Fiche salon test : « Réserver sur l’app » + encart IDF  
- [ ] **5.2** Au moins 5 catégories correctes visibles sur le site  
- [ ] **6** Plus de +237 sur privacy/terms  
- [ ] **7** Blog : page ou lien retiré  
- [ ] **2.1.2** Story / post explique : site = vitrine, app = réservation  
- [ ] **10.3** Aucun chiffre inventé dans le visuel du post  

---

## 13. Fichiers à modifier (référence dev)

| Priorité | Fichier | Changement attendu |
|----------|---------|-------------------|
| P1 | Consoles Google / Apple | Copy stores |
| P1 | `salon.controller.js` | FR, CTA app, encart IDF, retirer copy générique |
| P1 | `category.controller.js` | FR, CTA app, meta afro IDF |
| P1 | `privacy/*`, `terms/*`, `docs` footer | Contact IDF |
| P1 | Migration Mongo + admin | 5 catégories |
| P2 | `salonportal/blog/` ou redirect | Blog |
| P2 | `language.js` | Supprimer / isoler clés Planity |
| P2 | `script.js` | Blog URL finale |

---

## 14. Suivi des versions

| Date | Action | Par |
|------|--------|-----|
| 2026-05 | Création audit initial (code dev) | — |
| | Déploiement fiches salon FR | |
| | Stores mis à jour | |
| | Catégories migrées | |
| | Premier post réseaux | |

---

*Mettre à jour ce fichier après chaque lot de corrections. Cocher ⬜ en prod une fois vérifié sur skedisy.com.*
