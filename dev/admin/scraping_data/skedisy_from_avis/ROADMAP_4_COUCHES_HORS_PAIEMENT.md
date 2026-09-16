# Roadmap Skedisy — 4 couches (hors paiement)

**Date :** 2026-09-16  
**Positionnement :** *le système métier qui transforme chaque prestation Afro en rendez-vous préparé, rentable et réservable* — pas « le Planity Afro ».  
**Hors scope de ce doc :** Stripe, acompte encaissé, AutoCheckout, Klarna, Tap to Pay, pourboire, solde auto (déjà partiellement en place ailleurs ; on ne les priorise pas ici).

Sources : page StyleSeat Braiders + centre d’aide · audit avis · code actuel (`afroQuote`, `detailCard`, rebooking, marketing, messaging).

---

## État des 4 couches

| Couche | Intention | État |
|--------|-----------|------|
| **1. Réserver correctement** | Config → prix/durée clairs → créneau réel | **Partiel fort** — moteur de devis + fiche « avant de réserver » ; add-ons non branchés au calcul |
| **2. Préparer correctement** | Prep, photo, politiques comprises, rappels utiles | **Partiel** — `detailCard` + SMS 24h/2h ; pas de J-2 checklist ni acceptation politique |
| **3. Gérer correctement** | Temps / mèches / prévu vs réalisé | **Faible** — durée cotée oui ; pas de stock mèches ni durée réelle capturée |
| **4. Faire revenir & développer** | Rebook, profil, acquisition, marketing | **Bon V1** — rebook, IG, Message, marketing auto, fidélité même presta ; packages absents |

---

## Déjà solide (ne pas refaire)

- Devis Afro : `configSchema` + `pricingRules` / `durationRules` → prix + durée (`afroQuote.service.js`)
- Fiche presta salon : inclus / prep ✓✕ / photo / note (`detailCard`)
- Tunnel : config → devis → créneau calé sur durée cotée
- Politiques salon (heures gratuites, % retard, no-show) — config + cancel lifecycle
- Rebooking protective style + « reprendre config »
- Acquisition : fiche publique, IG, Message, marketing insights/promos/campagne
- Fidélité même prestation

---

## Ce qui reste à faire (priorisé, **sans paiement**)

### P0 — Service Engine réel (cœur produit)

Aujourd’hui : **réponses → règles** + add-ons **affichés** mais **non calculés**.

| Manque | Pourquoi (audit) | Livrable |
|--------|------------------|----------|
| Add-ons **sélectionnables** qui bougent **prix + durée** (+ prep optionnelle) | Prix / durée / mèches | Brancher `detailCard.addons` (ou `addonRules`) dans `computeQuote` |
| Variantes libellées coiffure (finesse, longueur, supply) UX salon | Seed trop « S/M/L vêtement » | Templates par famille + éditeur salon (déjà partiellement dans `SYNTHESE_CHAMPS…`) |
| Affichage découverte sans « À partir de » opaque | 78 salons / prix | Sur fiche + tunnel : **prix calculé** ; listing = « devis selon config » si variable |
| Durée cotée = seule source pour bloquer le calendrier | 57 durée / 41 attente | Buffer prep optionnel ; ne plus retomber sur `Service.duration` catalogue |

### P1 — Comprendre avant de réserver + prep

| Manque | Livrable |
|--------|----------|
| Acceptation **politique** avant confirm (pas l’encaissement) | Checkbox « J’ai lu… » liée à `cancellationPolicy` |
| Tolérance **retard** (ex. 15 min) | Champ salon + texte fiche + rappel |
| Rappels **J-2** avec `prepMust` / `prepAvoid` réels | Étendre crons (au-delà de 24h/2h) |
| Checklist cliente : photo manquante / prep non confirmée | États sur booking + SMS soft + UI compte |
| Remplacer bullets hardcodés post-confirm | Injecter `detailCard` du salon |

### P2 — Beauty Profile + photos résultat

| Manque | Livrable |
|--------|----------|
| Profil **serveur** (pas seulement localStorage) | Cheveux, préférences, dernière config, historique |
| Photo **après** prestation | Inspiration vs résultat ; « refaire comme la dernière fois » |
| Rebook avec **créneaux suggérés** | 2–3 dispo proches après due date |

### P3 — Opérations verticales

| Manque | Livrable |
|--------|----------|
| Prévu vs réalisé (durée ± prix) | Remplir `actualDurationMinutes` au checkout ; moyenne → suggestion « +20 min » |
| Ressources mèches | Packs / qui fournit / alerte veille de RDV (pas un ERP stock V1) |
| Packages multi-visites | Pack pose + entretien (rétention) |

### Déjà V1 / polish seulement

Acquisition, Instagram porte d’entrée, Message, marketing auto (occupancy → promo, échéances → campagne), loyalty même presta.

---

## MVP produit recommandé (hors paiement)

1. **Service Engine** — variantes + add-ons qui calculent  
2. **Fiche « Ce que vous devez savoir »** — complète + acceptation politique  
3. **Durée réelle au calendrier** (+ buffer optionnel)  
4. **Prep auto** — J-2 + checklist photo/prep  
5. **Beauty Profile lite** — dernière config + historique + photos  

Puis V2 : prévu/réalisé, ressources mèches, rebook smart slots, packages.

---

## Prochaine étape : blueprint Knotless (design avant code)

Objectif : une presta réelle, de bout en bout — **création salon → affichage cliente → schéma données → calcul prix/durée**.

### A. Création salon (panel)

```
Prestation : Knotless Braids
Catégorie  : Tresses
Base       : 180 € · 3h (référence « large / épaules » sans add-on)
Acompte    : (hors focus — déjà paramétrable ; ne pas bloquer le design)
Durée de vie protective : 7 semaines → rebook

Variantes (obligatoires)
- Finesse nattes : Fines | Moyennes | Grosses     (+0 / +40 / +80 € · +0 / +60 / +120 min)
- Longueur      : Épaules | Mi-dos | Taille | Fesses  (+0 / +50 / +90 / +130 € · +0 / +60 / +120 / +180 min)

Supply
- Mèches : Cliente apporte | Salon fournit
  si Salon → Couleur mèches (1B, 27, 30, 613…)  (+0 à +25 € selon option)

Add-ons (toggle)
- Curly ends     +30 € / +30 min
- Human hair     +80 € / +0 min (ou +15 min)
- Takedown       +45 € / +45 min
- Lavage         +20 € / +20 min

Prep (detailCard)
✓ Propres, lavés, séchés, démêlés
✕ Pas d’huile / leave-in lourd
Important : prep supplémentaire → possible supplément
Photo inspiration : recommandée (requise si salon coche)
```

### B. Affichage cliente (fiche + tunnel)

```
Knotless Braids — Moyennes / Mi-dos + Curly ends

Description …
Avant votre RDV  ✓ / ✕
À prévoir        ~5h30
Mèches           Incluses (salon) / À apporter
Photo            [Ajouter]
Politique        Annulation / no-show (texte) → [J’accepte]

Votre sélection
  Knotless → Moyennes → Mi-dos → 1B → Curly ends
Prix 310 € · Durée 5h30
[Choisir un créneau]
```

### C. Données (cible schéma)

```
salon.serviceIds[].afroConfig
  configSchema[]          // variantes + supply
  pricingRules[]
  durationRules[]
  addonDefs[]             // NEW: { id, label, addPrice, addMinutes, prepNote? }
  detailCard{…}
  styleLifetimeWeeks

ServiceDemand / booking
  answers{ finesse, longueur, meches_qui, couleur?, addons: ['curly_ends'] }
  quotedPrice, estimatedDurationMinutes
  clientAnswers (copie)
  // plus tard: actualDurationMinutes, resultPhotoUrls[]
```

### D. Calcul (exemple)

| Choix | Δ prix | Δ durée |
|-------|-------:|--------:|
| Base | 180 | 180 |
| Moyennes | +40 | +60 |
| Mi-dos | +50 | +60 |
| Curly ends | +30 | +30 |
| **Total** | **300** | **330 min (5h30)** |

(Ajuster les chiffres au seed salon ; l’important est la **formule**.)

### E. Critères « done » pour ce blueprint

- [ ] Salon configure Knotless sans JSON brut (UI variantes + add-ons)
- [ ] Cliente voit le **même** prix/durée qu’en base après sélection
- [ ] Créneau bloqué = durée cotée
- [ ] Prep + politique visibles avant confirm
- [ ] Rebook reprend la **dernière config** (déjà partiel)

---

## Argumentaire marketing (prudence audit)

| Argument OK | À éviter sans data ops |
|-------------|-------------------------|
| Moins de surprises prix / durée / rendu | « Les salons Afro souffrent massivement des no-shows » |
| Clientès savent comment se préparer | WhatsApp = OS unique (hypothèse) |
| Instagram vend, Skedisy gère après le clic | Claims StyleSeat (↓ no-shows) comme faits |

Douleurs documentées à servir en premier : **prix, durée, incompréhension presta, cheveux/extensions**.
