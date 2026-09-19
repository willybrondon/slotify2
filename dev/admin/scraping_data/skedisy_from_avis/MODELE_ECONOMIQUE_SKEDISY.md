# Modèle économique Skedisy

**Décision produit :** abonnement logiciel + commission d’acquisition (1ʳᵉ visite Skedisy) + 0 % ensuite.  
**Fidélisation cliente :** produit d’abord (historique, profil, rebook, acompte), pas une subvention permanente Skedisy.

---

## 1. Trois leviers de revenu

| # | Leviers | Qui paie | Quand |
|---|---------|----------|--------|
| **1. Subscription** | Accès au logiciel Skedisy (agenda, messagerie métier, fiche presta, prep, etc.) | Salon | Récurrent (mensuel) |
| **2. Commission d’acquisition** | Lead / 1ʳᵉ résa d’une **vraie nouvelle** cliente apportée par Skedisy | Salon | **Une seule fois** par couple (cliente × salon) |
| **3. 0 % ensuite** | La relation et le CA futur restent au salon | — | 2ᵉ, 3ᵉ, Nᵉ RDV |

Skedisy ne se finance **pas** en taxant chaque RDV à vie.  
Skedisy se finance en **outil** (abonnement) + **acquisition** (lead qualifié).

---

## 2. Boucle fermée (objectif)

```
Skedisy acquiert la cliente
  → 1ʳᵉ résa (commission acquisition si eligible)
  → cliente reste sur Skedisy (raisons produit)
  → salon garde la cliente
  → Skedisy gagne : abonnement + (évent. fees paiement) + 1 commission lead
```

**Ne pas** compter uniquement sur « empêcher salon ↔ cliente de se parler ».  
**Compter** sur : historique, config/coiffure sauvée, rebook 2 taps, acomptes, reçus, fidélité, rappels prep, messagerie métier.

---

## 3. Parcours monétaire visite par visite

| Visite | Salon | Cliente | Skedisy |
|--------|-------|---------|---------|
| **1ʳᵉ** (apportée par Skedisy) | Paie commission acquisition | Prix normal (+ acompte si policy) | Commission lead |
| **1ʳᵉ** (salon direct / panel) | **0 %** commission | Prix normal | Abonnement seulement |
| **2ᵉ** | Prix normal (ou promo salon) | **Incentive Skedisy** optionnel : crédit €5 **ou** ~10 % (one-shot, plafonné, expire) | Coût marketing contrôlé — **pas** une subvention permanente |
| **3ᵉ+** | Fidélité / rebook **salon** (loyaltyProgram) | Prix normal − avantages salon | 0 % commission |

### Incentive 2ᵉ visite — règles

- Objectif : raison de **revenir via Skedisy** (« Book again on Skedisy → −10% / loyalty credit / priority »), pas de subventionner à vie.
- Forme : crédit / code one-shot (ex. €5 flat **ou** 10 % HT, le plus bas des deux si les deux sont configurés).
- Financeur préféré : **budget Skedisy plafonné** (cap mensuel) **ou** partagé salon/Skedisy — **pas** « Skedisy paie −10 % pour toujours ».
- Expire (ex. 60–90 jours après la 1ʳᵉ visite completed).
- Une seule utilisation par (user, salon).
- **Ne pas compter uniquement sur la promo** : historique, coiffure/config sauvée, rebook 2 taps, acomptes, reçus, fidélité, rappels — plus défendable qu’empêcher salon↔cliente de se parler.

### Fidélité 3ᵉ+

- `loyaltyProgram.minCompletedCount = 2` ⇒ réduction à partir de la **3ᵉ** visite completed (même presta / même salon).
- Financée par le **salon**, pas Skedisy.

---

## 4. « Vraiment nouvelle cliente apportée par Skedisy »

Eligible commission acquisition **ssi** :

1. Premier contact via canal Skedisy (`web` / `app` / `link` demand) — pas `salon_panel`.
2. Aucun booking non-annulé **chez ce salon** avant pour ce `userId` (et anti-abus soft : même mobile/email si merge guest).
3. Snapshot figé sur le booking : `acquisitionAttributed=true`, `commissionReason=acquisition_first`.

Sinon : `commissionReason=none` → **platformFee = 0**.

---

## 5. Écart code actuel → cible

| Aujourd’hui | Cible |
|-------------|--------|
| % plat sur **chaque** booking (si wallet commission on) | % **seulement** acquisition 1ʳᵉ Skedisy |
| Pas d’attribution canal | `Booking.channel` + `UserSalonRelation` |
| Pas d’abonnement | `salon.subscription` + Stripe Subscription (phase dédiée) |
| Loyalty souvent dès 2ᵉ | Loyalty dès **3ᵉ** ; incentive one-shot en 2ᵉ |
| `firstBookingCashback` stub | Remplacé par incentive 2ᵉ visite structuré |

**Feature flag :** `setting.acquisitionCommissionOnly`  
- `false` (défaut) = comportement legacy (compat).  
- `true` = modèle acquisition-only.

---

## 6. Phases d’implémentation

| Phase | Contenu | Statut |
|-------|---------|--------|
| **A** | Doc + attribution + gate commission (flag) | **Fait** (`acquisitionCommissionOnly`, channel, UserSalonRelation) |
| **B** | Incentive 2ᵉ visite appliqué au checkout (crédit one-shot + cap) | Suivant — snapshot déjà figé sur booking |
| **C** | Abonnement Stripe (plans + webhooks) | Catalogue admin **fait** — Stripe checkout plus tard |
| **D** | Reports admin (MRR sub + fees acquisition + coût incentives) | Plus tard |

---

## 7. Phrase cadrage salon

> Skedisy = votre logiciel (abonnement) + un canal qui vous amène de nouvelles clientes (commission une fois).  
> Ensuite, 0 % : la cliente est à vous.  
> On aide la cliente à **revenir via Skedisy** (rebook, profil, acompte, fidélité) — sans taxer chaque RDV.

---

## 8. Plans SaaS (contrôle admin) — vs StyleSeat

**StyleSeat aujourd’hui :** essentiellement **un** plan Premium (~35$/mo), avec **opt-out** des tools de croissance (New Client Connection 30% 1ʳᵉ, Smart Pricing). Pas de Basic vs Premium classiques.

**Skedisy :** multi-tiers **éditables dans l’admin** (`/admin/subscriptions`) :

| Plan | Prix seed | Intention |
|------|-----------|-----------|
| **Free** | 0€ | Essai — agenda + page publique |
| **Basic** | 29€ | Logiciel quotidien (paiements, messagerie, rebook, deposits) |
| **Premium** | 49€ | Croissance StyleSeat-like (marketplace, leads, marketing, fidélité, afro config) |
| **Enterprise** | 99€ | Multi-lieux, branding, support |

- Matrice de features : `SubscriptionPlan.features[]` (clés dans `subscriptionFeatures.js`)
- Opt-out salon : `salon.subscription.featureOverrides` (comme StyleSeat)
- Attribution manuelle : fiche salon admin → « Attribuer le plan »
- Gate runtime : `subscription.service` → `resolveSalonSubscription` / `salonHasFeature`

---

## Références code

- Commission actuelle : `salonBookingWallet.service.js`, `booking.cotroller.js`
- Fidélité : `loyalty.service.js`, `salon.loyaltyProgram`
- Attribution : `acquisition.service.js`, `userSalonRelation.model.js`
- Demand source : `serviceDemand.source` / `channelHint`
- **Plans SaaS :** `subscriptionPlan.model.js`, `subscription.service.js`, admin UI `SubscriptionPlans.js`

---

*Document interne — modèle économique Skedisy (subscription + acquisition + retention produit).*
