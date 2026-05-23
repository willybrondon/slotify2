# Parcours site & salon portal — À faire avant les réseaux sociaux

> **Contexte :** Aujourd’hui, `skedisy.com` affiche les salons, services et experts sur le web, mais **la réservation se fait uniquement via l’app** (iOS / Android).  
> **Objectif :** Aligner site, fiches salon et communication sur l’[authenticité Skedisy](./AUTHENTICITE_SKEDISY.md) **avant** de proposer des posts Instagram, Facebook ou TikTok.  
> **Périmètre :** recommandations contenu / UX / message — **pas d’implémentation code** dans ce document.

---

## 1. Diagnostic : écarts entre promesse et réalité

| Zone | État actuel | Problème pour l’authenticité |
|------|-------------|------------------------------|
| **Homepage** (`salonportal/index.html`) | Forte page **B2B** afro IDF (hero afro, WhatsApp, tresses/locks) | Le visiteur **cliente** ne voit pas clairement « je cherche un salon » ; CTA « Book here » = téléchargement app, pas réservation web |
| **Homepage (legacy)** | Textes `language.js` : « 50 000+ salons », « 10M users » (template Planity) | **Contredit** l’authenticité : chiffres non Skedisy, ton généraliste |
| **FAQ** | « 10 million monthly users », exemples Haircut / Manicure / Facial | Même problème ; vocabulaire **non afro** |
| **Footer** | « Transform your salon management », POS, téléphone **+237** | Générique + signal géo **hors IDF** (Cameroun) |
| **Page salon web** (`/salon/{slug-id}`) | Services, staff, avis, boutons **Book Now** → deep link app ou `#download-customer` | OK techniquement, mais libellés **EN**, pas de message « communauté afro IDF » |
| **Fiches stores** | Beauté généraliste (massage, facial…) | Hors niche document authenticité |
| **Réservation web** | Absente | Pas un bug si **assumé** ; devient un problème si le site **laisse croire** qu’on réserve comme Planity sur le navigateur |

**Risque réseaux sociaux :** un post « Réserve en 2 clics » + lien `skedisy.com/salon/...` → la personne clique **Réserver** et ne comprend pas qu’il faut installer l’app → sentiment d’arnaque, pas d’inauthenticité communautaire.

---

## 2. Principe directeur : assumer le modèle « web = vitrine, app = réservation »

Ce modèle est **légitime** (NappyMe, beaucoup d’apps natives). Il colle à l’authenticité **si le message est honnête** :

> **Instagram / le site = découvrir le salon afro en IDF.**  
> **L’app Skedisy = réserver.**

C’est cohérent avec le pilier *« Découverte IG → Skedisy »* du document authenticité.  
**Ne pas promettre** une réservation 100 % navigateur tant qu’elle n’existe pas.

### Formule à utiliser partout (site + futurs posts)

| Contexte | Formulation recommandée |
|----------|-------------------------|
| Bouton salon web | **« Réserver sur l’app »** (pas « Book Now » seul) |
| Hero cliente | **« Trouve ton salon afro en IDF — réserve sur l’app »** |
| Réseaux | **« Lien en bio → salon → app »** ou **« 2 min sur l’app Skedisy »** |
| Stories | **« Étape 1 : voir le salon sur skedisy.com · Étape 2 : télécharger l’app pour réserver »** |

---

## 3. Ce qu’il faut faire sur skedisy.com (contenu & structure, sans parler code)

### Priorité A — Crédibilité & authenticité (bloquant pour les réseaux)

#### A1. Nettoyer les messages « faux Planity »

**À retirer ou remplacer** sur tout le site visible (FR prioritaire) :

- « 50 000+ salons », « 10M utilisateurs », « #1 plateforme » (si non vérifiable)
- FAQ « 10 million monthly users »
- Footer téléphone Cameroun si la cible communication est **IDF uniquement**

**À la place (chiffres honnêtes uniquement) :**

- Nombre réel de salons afro listés en IDF (même si petit : « 50 salons » vaut mieux que « 50 000 »)
- « Île-de-France » explicite dans le hero **cliente**
- « Gratuit pour commencer » côté pro (déjà vrai)

#### A2. Deux entrées claires sur la homepage

Aujourd’hui la home est surtout **recrutement salon**. Pour l’authenticité communauté, le visiteur doit choisir en 3 secondes :

| Je suis… | Message | Action principale |
|----------|---------|-------------------|
| **Cliente** | « Salons afro en Île-de-France » | **Trouver un salon** (liste / carte / recherche) + sous-texte « Réservation sur l’app » |
| **Gérant de salon** | « Rejoignez les salons afro IDF » | **Rejoindre / réclamer ma fiche** (déjà `request-adding-salon`, claim) |

Sans cette séparation, les posts Instagram clientes enverront vers une page « pour les pros ».

#### A3. Page ou section **« Trouver un salon afro (IDF) »**

Objectif : le lien partagé en bio / en post mène à une **liste filtrée** (ville, prestation : tresses, locks…), pas seulement à la home pro.

Contenu minimum (éditorial) :

- Titre : *« Salons de beauté afro en Île-de-France »*
- Filtres visibles : département / ville / type de prestation
- Carte ou liste avec **photos réelles** (pas Unsplash seul)
- Encart fixe : **« La réservation se fait sur l’app Skedisy (gratuite) »** + badges App Store / Play Store

#### A4. Aligner le **visuel** sur l’app (noir / communauté)

Le site salonportal utilise encore une esthétique **bleue / rouge type Planity** + hero **stock**. L’app cliente est **noir / minimal**.

Pour l’authenticité :

- Photos : **vrais salons IDF** (même 5–10 en rotation)
- Couleurs : rapprocher du noir `#000` et accents app (`#6F42E5`, `#E96E14`)
- Moins « startup beauté générique », plus **annuaire communautaire local**

---

### Priorité B — Parcours fiche salon (`/salon/...`)

C’est la page la plus partagée depuis les réseaux.

#### B1. Bandeau en haut de fiche (contenu à rédiger)

Exemple :

> **Salon afro · Île-de-France**  
> Consulte les prestations et l’équipe ici. Pour réserver un créneau, ouvre l’app Skedisy (gratuite).

#### B2. Boutons & libellés en **français**

Remplacer « Book Now », « Other Services », « Staff » par :

- **Réserver sur l’app**
- **Autres prestations**
- **L’équipe**

#### B3. Parcours en 3 étapes visibles (infographie légère)

1. **Découvrir** — tu es sur la fiche salon  
2. **Télécharger** — app iPhone ou Android (liens stores + QR)  
3. **Réserver** — choisir prestation, experte, date dans l’app  

#### B4. Si l’app n’est pas installée

Le comportement actuel (deep link → fallback download) est bon **si expliqué** avant le clic :

- Micro-copy sous le bouton : *« Ouvre l’app si tu l’as déjà, sinon tu seras guidé vers le téléchargement »*

#### B5. Services : langage afro

Vérifier que les libellés scraped / saisis utilisent **tresses, tissage, locks**, pas seulement « Haircut » / « Service ». Sinon les fiches **contredisent** « beauté afro uniquement ».

---

### Priorité C — Salon portal & parcours pro (`/salonpanel/`)

Pour les posts **@skedisy.pro** et le recrutement salons :

#### C1. Message d’accueil aligné authenticité

- *« L’outil des salons afro en Île-de-France »*
- Pas « all-in-one beauty » générique

#### C2. Page claim mise en avant

Lien visible depuis la home pro : **« Votre salon est peut-être déjà sur Skedisy — réclamez votre fiche »** → `skedisy.com/salon/claim`

C’est un argument **authentique et unique** (scraping + claim).

#### C3. Kit salon (hors site, mais à préparer avant réseaux)

- QR vers fiche salon ou app
- Texte type : *« Réservez-nous sur Skedisy »* à afficher en vitrine
- Aligné avec ce que la cliente verra en arrivant depuis Instagram

---

### Priorité D — AI Concierge (`ai-concierge.html`)

Atout différenciant pour le pilier **Compréhension**.

#### D1. Positionner en français autour des cheveux texturés

- Sous-titre actuel EN : à traduire et ancrer *« cheveux afro / texturés · Île-de-France »*
- Fin du parcours : **toujours** CTA app + salons recommandés **IDF**

#### D2. Ne pas promettre réservation web depuis l’IA

- *« Recommandation sur le web → réservation dans l’app »*

---

### Priorité E — Fiches App Store / Play Store (contenu, pas code)

Bloquant : aujourd’hui les stores **contredisent** le site afro.

**Réécriture** selon [AUTHENTICITE_SKEDISY.md](./AUTHENTICITE_SKEDISY.md) section 16 :

- Titre : mention **afro** + **Île-de-France**
- Retirer massage / facial / spa en première ligne
- Screenshots : parcours **salon afro → prestation → confirmation** (FR)

Les posts « Télécharge l’app » doivent mener à une fiche **cohérente** avec la promesse Instagram.

---

### Priorité F — Pages légales & confiance

- CGU / Privacy : préciser *« réservation via application mobile »* si le site dit « plateforme »
- Contact : **support@skedisy.com** + si possible ligne **France / IDF** (éviter confusion +237 en footer public IDF)
- Supprimer liens footer morts (« My Account », « Pricing » sans page)

---

## 4. Parcours cible (à refléter sur le site avant campagnes)

```
Réseau social (Reel, story, post)
        ↓
  skedisy.com/salon/{slug}   OU   page « Salons IDF »
        ↓
  Découverte : avis, services, équipe, prix, durée
        ↓
  CTA clair : « Réserver sur l’app » (+ stores)
        ↓
  App installée → parcours réservation (expert, créneau, paiement)
        ↓
  SMS rappel 24h / 2h
```

**Ce parcours doit être visible sur le site** (schéma, FAQ courte, bandeau). Sinon les réseaux créent une attente fausse.

---

## 5. Structure site (implémentée)

| URL | Public |
|-----|--------|
| `skedisy.com/` | **Clientes** — catégories, QR app, parcours découvrir → app |
| `skedisy.com/professionnel/` | **Pros** — acquisition salon, sans menu catégories |
| Bouton **Pro** (avant Login) en haut à droite | → `/professionnel/` |

## 5b. Homepage cliente : blocs (message)

1. **Hero cliente** — « Beauté afro en Île-de-France » + CTA « Parcourir » / « Télécharger l’app »  
2. **Hero pro** | voir `/professionnel/`  
3. **Preuves communauté** — badges tresses / locks / naturel (déjà présent)  
4. **Comment ça marche (3 étapes)** — Découvrir → App → Réserver  
5. **Salons mis en avant** — 6–12 fiches IDF réelles (nom + ville + photo)  
6. **Problème WhatsApp** (déjà présent) — garder, c’est authentique  
7. **IA Concierge** — lien secondaire « Pas sûre de la prestation ? »  
8. **FAQ courte cliente** — « Pourquoi l’app ? » « C’est gratuit ? » « Quelles zones ? »  
9. **CTA pro** — claim / demande d’ajout salon  

Réduire ou supprimer : stats Planity, sections « institut / spa » génériques si encore présentes ailleurs sur le site.

---

## 6. FAQ cliente à ajouter (texte prêt pour le site)

**Pourquoi dois-je télécharger l’app pour réserver ?**  
Skedisy te permet de voir les salons afro en Île-de-France sur le site. Pour choisir ton créneau, ton experte et payer en sécurité, la réservation se fait sur l’app Skedisy (gratuite).

**Puis-je réserver depuis Instagram ?**  
Tu peux découvrir un salon sur Instagram ; pour bloquer un créneau confirmé, utilise le lien Skedisy puis l’app.

**Skedisy couvre quelles zones ?**  
Île-de-France uniquement (Paris et banlieue). Pas d’Antilles ni d’outre-mer pour l’instant.

**C’est pour quels types de prestations ?**  
Tresses, tissages, locks, perruques, soins cheveux naturels — salons spécialisés afro, pas les instituts généralistes.

---

## 7. Ce que les réseaux pourront / ne pourront pas dire (selon avancement)

| État du site | OK en post | À éviter |
|--------------|------------|----------|
| **Actuel** (app only, stats Planity, home pro) | Teasing communauté, « bientôt », DM vers support | « Réserve sur le lien » sans mention app ; chiffres nationaux |
| **Après Priorité A+B** | « Voir le salon → app » ; salons par ville ; série « Chez nous en IDF » | « Comme Planity sur le web » |
| **Après stores alignés** | Campagne téléchargement app ; UGC avec QR salon | « Meilleure app beauté » générique |
| **Si un jour réservation web** | « Réserve en 2 clics » sans friction | — |

---

## 8. Plan d’action recommandé (ordre)

| Phase | Actions | Durée indicative | Débloque |
|-------|---------|------------------|----------|
| **0** | Valider la formule « web = vitrine, app = réservation » | 1 réunion | Message réseaux cohérent |
| **1** | Copy : retirer stats Planity, FR sur fiches salon, FAQ cliente, footer IDF | 1–2 semaines (contenu) | Crédibilité |
| **2** | Structure home : entrée cliente + liste salons IDF | Dépend dev / contenu | Liens bio Instagram |
| **3** | Fiches stores FR afro IDF + visuels | 1 semaine | Posts « télécharge l’app » |
| **4** | 10 salons pilotes : photos réelles + QR vitrine | 2–4 semaines terrain | Série « Chez nous en IDF » |
| **5** | **Alors seulement** : calendrier posts IG / FB / TikTok | — | Campagne lancement |

---

## 9. Lien avec le document authenticité

Chaque évolution site doit renforcer un **pilier** :

| Action site | Pilier |
|-----------|--------|
| Liste salons par ville IDF | Territoire + Appartenance |
| Libellés tresses / locks | Compréhension |
| Portraits salons + claim | Visibilité |
| Parcours honnête app | Confiance (sans promesse fausse) |
| IA Concierge FR afro | Compréhension |

**Test avant publication réseau :**  
*« Quelqu’un qui clique depuis Instagram comprend-il en 10 secondes qu’il découvre un salon afro IDF et qu’il réserve via l’app ? »*

---

## 10. Synthèse

Skedisy n’a pas besoin de **réservation web** pour être authentique avant les réseaux sociaux. Il a besoin que **skedisy.com raconte la même histoire** que le document authenticité :

- **Communauté afro · Île-de-France · salons physiques**
- **Site = découverte · App = réservation** (dit clairement)
- **Chiffres et visuels vrais** (pas Planity, pas générique)
- **Fiche salon partageable** comme destination des posts

Tant que le visiteur croit réserver « comme sur Planity » en restant sur le navigateur, **aucun post Instagram ne pourra sauver la confiance** — même avec les meilleurs hooks.

---

*Voir aussi : [AUTHENTICITE_SKEDISY.md](./AUTHENTICITE_SKEDISY.md) · [README.md](./README.md)*
