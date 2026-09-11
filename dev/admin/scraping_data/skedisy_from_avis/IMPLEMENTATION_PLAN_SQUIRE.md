# Plan d’implémentation — SQUIRE Blueprint × Skedisy existant

**Date :** 2026-09-11  
**Statut :** plan seulement — **aucun code modifié**  
**Références :** `PROMPT7_SQUIRE_BLUEPRINT.md` · inventaire codebase `dev/admin/*` + Flutter  
**Principe :** ne pas reconstruire l’agenda ; greffer le wedge Afro sur le stack booking/paiement déjà là.

---

## 0. Verdict en une phrase

Skedisy a déjà un **OS de réservation multi-salon** (lien public, catalogue, experts, créneaux, Stripe, rappels).  
Ce qui manque pour le SQUIRE Afro, c’est la couche **demande configurée → devis/durée → acompte → prep**, pas un nouveau calendrier.

---

## 1. Cartographie : existant vs Blueprint

| Couche Blueprint | État Skedisy | Preuves / points d’ancrage | Action |
|---|---|---|---|
| Lien public salon | **EXISTANT** | `GET /salon/:slug` · `salonportal/.../salon-booking.js` · `getShareUrl` · App Links | Réutiliser ; éventuellement URL dédiée `/demande` ou query `?flow=project` |
| Catalogue services | **PARTIEL** | `service.model.js` (name, duration fixe) · prix flat sur `salon.serviceIds` | Étendre : complexité, variables, règles |
| Complexity Engine | **ABSENT** | Hair profile = discovery/AI, **pas** gate booking | **Construire** |
| Pricing Engine (règles) | **ABSENT** | « À partir de » = min prix salon (UI) · coupons seulement | **Construire** |
| Duration Engine | **PARTIEL** | `duration` fixe · `checkInTime` / `checkOutTime` à la complétion | Réutiliser check-in/out ; ajouter estimateurs |
| Booking Engine | **EXISTANT** | Flow : services → expert → slot → contact → pay | Insérer étapes **avant** le slot pour S2/S3 |
| Acompte client | **ABSENT** | Stripe = montant **plein** · « deposit » code = wallet salon | **Construire** (payment partial) |
| Prep Engine | **ABSENT** | — | **Construire** (Phase 2) |
| Beauty CRM / Memory | **PARTIEL** | Historique bookings · pas de config/photos métier | **Construire** (Phase 3) |
| Dashboard pro | **EXISTANT** | Salon panel bookings · email accept/reject | Étendre : file « demandes / devis » |
| WA/IG natif | **ABSENT** (OK) | Share links + OG ; pas Business API | **Ne pas construire** V1 — scénario C = lien |
| Multi-staff / calendar | **EXISTANT** | Experts, slots, `TeamCalendar`, busy | Réutiliser tel quel |
| Notifications | **EXISTANT** | SMS 24h/2h · FCM · emails | Étendre messages devis/acompte |
| Paiements Stripe | **EXISTANT** | Connect + `stripe-intent` public | Réutiliser avec montant acompte |

### Stack technique à cibler (dev)

| Couche | Où travailler en priorité |
|---|---|
| API / models | `dev/admin/backend/` |
| Booking web public | `dev/admin/salonportal/public/salon-booking.js` (+ pages salon) |
| Panel pro | `dev/admin/salon/` |
| App cliente (later) | `dev/flutter/multi_salon_customer/` |
| App expert (later) | `dev/flutter/multi_salon_expert/` |
| Prod mirror | `prd/` — **ne synchroniser qu’après validation dev** |

**Règle :** MVP wedge d’abord sur **web public + panel salon + API**. Flutter en second (parité), sauf si un design partner n’utilise que l’app.

---

## 2. Gap critique vs flow actuel

### Flow actuel (FACT code)

```
Services (catalogue plat)
→ Expert
→ Date / créneau
→ Contact (guest OTP OK)
→ Paiement plein (Stripe / wallet / cash)
→ Booking pending|confirm
```

### Flow cible Blueprint (S2/S3)

```
Lien (WA/IG/bio) 
→ Famille service OU photo
→ 2–5 questions (Complexity Engine)
→ Devis + durée estimés
→ [option] validation pro si outlier
→ Créneau (réutiliser engine existant)
→ Acompte (nouveau)
→ Confirmation + prep checklist (Phase 2)
```

**S0 (simple)** peut garder le flow actuel presque intact (feature flag par service).

---

## 3. Architecture cible (greffe, pas rewrite)

```
┌─────────────────────────────────────────────────────────┐
│  EXISTANT                                                │
│  Salon link · Guest OTP · Experts · Slots · Stripe · SMS │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│  NOUVEAU — « Project / Demand » layer                    │
│  ServiceConfig · PricingRules · DurationRules            │
│  Demand (draft) · Quote · DepositPayment · PrepChecklist │
└────────────┬────────────────────────────────────────────┘
             │ convertit en
┌────────────▼────────────────────────────────────────────┐
│  Booking existant (créneau + expert + status)            │
│  + champs: quoteId, configSnapshot, deposit*, durationEst│
└─────────────────────────────────────────────────────────┘
```

**Décision de design recommandée :**

- Introduire une entité **`ServiceDemand`** (ou `QuoteRequest`) **avant** le `Booking`, plutôt que de surcharger immédiatement tout le booking pour les cas incomplets.
- Quand acompte OK (+ créneau choisi) → créer / lier un `Booking` classique.
- Les services **S0** peuvent bypass et créer un booking direct (compatibilité).

Évite de casser le panel, Flutter, settlements, et les crons SMS qui attendent un booking.

---

## 4. Modèle de données à ajouter (conception — pas encore codé)

### 4.1 Extensions `Service` / attachment salon

| Champ | Rôle |
|---|---|
| `complexityTier` | `S0` \| `S1` \| `S2` \| `S3` |
| `configSchema` | liste de variables (id, label, type, options, required, affectsPrice, affectsDuration) |
| `requirePhoto` | bool |
| `basePrice` / garder prix salon | — |
| `pricingRules[]` | if variable=X then +€ |
| `durationRules[]` | if variable=X then +min |
| `depositPolicy` | `{ type: percent\|fixed, value, enabled }` |
| `prepInstructions` | texte / checklist items (Phase 2) |

Alternative V1 minimale : stocker config au niveau **salon-service** (pas le Service global admin) pour que chaque salon définisse ses règles.

### 4.2 Nouvelle collection `ServiceDemand` (MVP)

| Champ | Rôle |
|---|---|
| salonId, serviceId | |
| answers / config | snapshot variables |
| photoUrl(s) | |
| estimatedPrice, estimatedDuration | |
| depositAmount, depositStatus | unpaid \| paid \| waived |
| status | draft \| quoted \| awaiting_slot \| deposit_paid \| converted \| cancelled \| needs_salon_review |
| bookingId | null jusqu’à conversion |
| client contact | userId ou guest |
| source | `link` \| `web` \| `app` \| `manual` |
| channelHint | `whatsapp` \| `instagram` \| `google` \| `other` (déclaratif) |

### 4.3 Extensions `Booking` (au convert)

- `demandId` / `configSnapshot`
- `quotedPrice`, `estimatedDuration`
- `depositAmount`, `depositPaidAt`, `balanceDue`
- `actualDurationMinutes` (dérivé checkIn/checkOut — Phase 2)

### 4.4 Ne pas réutiliser tel quel

- `product.attributes` (e-commerce) — sémantique différente ; éventuellement s’inspirer du pattern UI, pas du modèle métier booking.
- Wallet « deposit » salon — vocabulaire trompeur ; garder séparé de l’acompte cliente.

---

## 5. Plan par phases (aligné Blueprint §20)

### Phase 1 — Wedge (0–3 mois) · **MUST BUILD**

Objectif : 20 salons collent un lien ; demandes → devis → acompte mesurables.

#### Feature 1 — Lien de demande
| | |
|---|---|
| **Réutiliser** | URL salon, share, QR, guest OTP |
| **Ajouter** | Entrée « Demande / Devis » distincte ou mode `complexityTier >= S1` ; UTM/source |
| **Surfaces** | salonportal + évent. deep link Flutter later |
| **KPI** | demandes créées / salon / sem |

#### Feature 2 — Complexity Engine
| | |
|---|---|
| **Réutiliser** | Rien de booking (hair-profile ≠) |
| **Ajouter** | Schema par service · renderer questions web · upload photo (Firebase/S3 déjà utilisé ailleurs) |
| **UX** | 2–5 champs max ; S0 = 0 question extra |
| **Panel pro** | Éditeur simple de variables (longueur, taille, mèches qui fournit, couleur) — **pas** 20 champs par défaut |
| **KPI** | % demandes avec config complète |

#### Feature 3 — Devis + durée estimés
| | |
|---|---|
| **Réutiliser** | Affichage prix existant côté UI |
| **Ajouter** | Endpoint `POST /api/public/demand/quote` : applique `pricingRules` + `durationRules` |
| **Règles V1** | 100% configurées par le salon (pas de ML) |
| **Outlier** | Flag `needs_salon_review` si hors bornes ou photo custom S3 |
| **KPI** | % devis acceptés (cliente continue) |

#### Feature 4 — Acompte
| | |
|---|---|
| **Réutiliser** | Stripe Connect + PaymentIntent |
| **Changer** | Intent sur `depositAmount` (pas `amount` plein) ; metadata `demandId` |
| **Après pay** | status demand → puis création booking (créneau déjà choisi ou soft-hold) |
| **Solde** | `balanceDue` payé cash / Stripe jour J (réutiliser cashAfterService) |
| **Attention** | Settlements / platformFee : définir règle (commission sur acompte only vs total) — **décision produit avant code** |
| **KPI** | % devis → acompte payé |

#### Feature 5 — Dashboard demandes pro
| | |
|---|---|
| **Réutiliser** | Layout salon panel, notifs email |
| **Ajouter** | Vue kanban/liste : draft / à valider / payé / converti |
| **Actions** | Ajuster devis · waive deposit · convertir · refuser |
| **KPI** | temps médian traitement ; demandes/j |

#### Hors scope Phase 1 (explicite)
Marketplace · WA Business API · CRM memory · prep checklist riche · Flutter parity complète · rewrite booking · IA gadget.

---

### Phase 2 — OS léger (3–6 mois)

| Item | Ancrage existant | Build |
|---|---|---|
| Prep checklist | — | Champs + SMS/email J-2 (réutiliser Twilio/FCM) |
| Durée réelle | checkIn / checkOut | Calcul minutes + champ `actualDuration` + UI 1 tap fallback |
| Rappels enrichis | SMS 24h/2h | Inclure « amenez mèches X / photo validée » |
| Soft sync calendrier | Slots existants | Hold créneau à devis (TTL) pour éviter double book |
| Sync Planity | — | **Optionnel / later** — pas bloquant wedge |

---

### Phase 3 — Beauty CRM + Client Memory (6–9 mois)

| Item | Ancrage | Build |
|---|---|---|
| Historique config | bookings history | Lier `configSnapshot` + photos au user/salon |
| « Reprendre ma presta » | — | Prefill demand depuis dernière demand convertie |
| Notes salon | complains/reviews partiels | Fiche cliente salon-scoped |

---

### Phase 4 — Data / intelligence (9–12 mois)

- Recalage durée/prix **par salon** à partir des couples config → réel  
- Analytics panel : acomptes, écarts durée, litiges (proxy)  
- **Pas** de chatbot générique

---

### Phase 5 — Platform (12+)

- Benchmarks anonymes, expansion multi-ville, supply éventuel  
- Seulement si usage quotidien Phase 1–3 prouvé

---

## 6. Découpage technique recommandé (sprints Phase 1)

### Sprint A — Fondations données (1–2 sem)
1. Spec figée : champs ServiceDemand + deposit policy + commission  
2. Models + migrations / indexes Mongo  
3. Feature flag salon : `afroProjectFlowEnabled`  
4. Seeds : 1–2 services démo Knotless S2 avec 4 variables  

*Livrable : API interne quote dry-run sans UI.*

### Sprint B — Panel pro config (1–2 sem)
1. UI : tier + variables + règles prix/durée + acompte %  
2. Liste demandes (lecture seule d’abord)  
3. Validation design partners (config en &lt; 30–60 min)

*Livrable : salon peut publier un service configurable.*

### Sprint C — Tunnel cliente web (2–3 sem)
1. Brancher `salon-booking.js` : branche S0 vs S1+  
2. Steps : service → questions/photo → devis → slot (reuse) → acompte Stripe  
3. Guest OTP inchangé  
4. Confirmation page + email/SMS existants adaptés  

*Livrable : parcours bout-en-bout staging.*

### Sprint D — Paiement acompte + conversion booking (1–2 sem)
1. PaymentIntent montant partiel  
2. Webhook → demand paid → create booking linked  
3. Balance due visible panel + app later  
4. Cas cash acompte (si besoin design partner)  

*Livrable : argent réel test Stripe Connect.*

### Sprint E — Dashboard + polish + 20 salons (2 sem)
1. Kanban demandes + actions adjust/waive  
2. Analytics simples (compteurs KPI)  
3. Copy FR « lien à coller dans WhatsApp »  
4. Onboarding checklist salon  

*Livrable : go design partners.*

**Durée indicative Phase 1 :** ~8–11 semaines calendaires (1 équipe full-stack).

---

## 7. Surfaces UI — quoi toucher / quoi ne pas toucher

| Surface | Phase 1 | Notes |
|---|---|---|
| `salon-booking.js` | **Oui** | Cœur cliente |
| Salon panel services | **Oui** | Config rules |
| Salon panel bookings | **Oui** | + onglet Demandes |
| Backend public booking APIs | **Oui** | Nouveaux endpoints demand/* ; booking create depuis demand |
| Flutter customer | Later | Parité après web stable |
| Flutter expert | Later | Voir demandes / durée réelle |
| Admin platform | Minimal | Feature flag / support |
| AI Concierge / hair-profile | **Ne pas mixer V1** | Peut alimenter S3 photo later ; risque distraction |
| Product e-commerce attributes | Non | |

---

## 8. Risques & décisions à trancher avant code

| # | Décision | Options | Recommandation |
|---|---|---|---|
| D1 | Demand séparé vs booking enrichi | A/B | **Demand séparé** puis convert |
| D2 | Commission plateforme | Sur acompte / sur total / différé | Trancher finance avant Sprint D |
| D3 | Hold créneau avant acompte | Soft TTL 15–30 min vs payer d’abord | Payer devis puis slot **ou** slot soft-hold — tester UX |
| D4 | Services S0 | Bypass flow | Oui — ne pas forcer questionnaire |
| D5 | Flutter en Phase 1 | Oui/Non | **Non** sauf contrainte partenaire |
| D6 | Validation pro obligatoire S3 | Auto vs manual | Manual si photo custom |
| D7 | Sync `prd/` | Quand | Après 2–3 salons stables en staging |

---

## 9. Critères de succès Phase 1 (produit)

| KPI | Seuil indicatif (à affiner) |
|---|---|
| Salons avec flow activé | 20 |
| Demandes / salon / sem | ≥ 5 (médiane) |
| Devis → acompte | ≥ 30% (hypothèse à mesurer) |
| Salons actifs hebdo M2 | ≥ 60% des onboardés |
| Tickets « trop de questions » | Surveiller abandon step questions |

Métrique ultime (Blueprint) : **usage quotidien du salon pour les prestations complexes**, pas volume marketplace.

---

## 10. Mapping exact MVP Blueprint → tickets

| MVP # | Ticket epic | Dépend de | Réutilise |
|---|---|---|---|
| 1 Lien demande | `EPIC-LINK` | Flag salon | Share URL, slug |
| 2 Complexity Engine | `EPIC-CONFIG` | Schema service | Upload media existant |
| 3 Devis+durée | `EPIC-QUOTE` | EPIC-CONFIG | — |
| 4 Acompte | `EPIC-DEPOSIT` | EPIC-QUOTE, Stripe | stripe-intent pattern |
| 5 Dashboard | `EPIC-INBOX` | Demand model | Salon Admin layout |

Ordre de build obligatoire : **CONFIG → QUOTE → LINK flow → DEPOSIT → INBOX**  
(Inbox lecture peut démarrer en parallèle dès Demand model.)

---

## 11. Ce qu’il ne faut pas faire pendant l’implémentation

- Réécrire le calendrier / multi-staff  
- Remplacer WhatsApp par une inbox maison  
- Construire la marketplace « plus de salons »  
- Brancher Gemini sur le tunnel de réservation V1  
- Imposer une taxonomie Afro universelle figée (laisser le salon définir ses variables)  
- Traiter le no-show comme unique pitch marketing (acompte = engagement prestation longue)  
- Modifier `prd/` en premier  

---

## 12. Prochaine action concrète (sans coder encore)

1. Valider ce plan (surtout **D1–D3** commissions / hold créneau).  
2. Rédiger une **spec technique courte** (OpenAPI demand + quote + deposit) d’1–2 pages.  
3. Choisir 3–5 salons design partners (idéalement braids/tresses S2).  
4. Ensuite seulement : Sprint A.

---

## Annexe — Fichiers existants à lire en premier au kickoff code

| Fichier | Pourquoi |
|---|---|
| `dev/admin/backend/models/booking.model.js` | Extension / lien demand |
| `dev/admin/backend/models/service.model.js` | Tier + schema |
| `dev/admin/backend/models/salon.model.js` | Prix service, flags, Stripe |
| `dev/admin/salonportal/public/salon-booking.js` | Flow UI à brancher |
| `dev/admin/backend/controller/.../publicWebBooking.controller.js` | APIs publiques |
| Controllers Stripe booking / Connect | Pattern PaymentIntent |
| `dev/admin/salon/src/...` service table + Admin bookings | Panel |
| SMS reminder hooks dans `index.js` | Étendre Phase 2 |

*Fin du plan — aucun fichier applicatif modifié.*
