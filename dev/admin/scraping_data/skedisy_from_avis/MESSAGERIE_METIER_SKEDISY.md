# Messagerie métier Skedisy

**Promesse :** pas un chat générique —  
`Client → Prestation → Qualification → Expert → Réservation`

**Statut code aujourd’hui :** inbox salon↔cliente (texte + photos) existe.  
**Manque :** lien presta/RDV, qualification, assignation expert, statut, auto-réponses, routage.

---

## 1. Nouveau fonctionnement

```
Client → Inbox du salon → Skedisy qualifie → bonne personne
         └─ réponse auto (si fiche presta connue)
```

| Règle | Comportement |
|--------|----------------|
| 1 | Tous les messages arrivent dans une **inbox salon commune**. Le salon reste maître. |
| 2 | Skedisy **identifie le sujet** (règles d’abord, IA ensuite). |
| 3 | Le salon peut **attribuer** la conversation à un expert. |
| 4 | L’expert répond depuis **son espace**, quand il est dispo. |
| 5 | Si l’expert travaille → message en **file** + accusé client. |
| 6 | Skedisy peut répondre **automatiquement** aux questions déjà renseignées sur la fiche presta. |
| 7 | Toute la conversation reste liée à la **presta / RDV** (photo, options, prix, durée, date). |

### Routage sujet → destinataire

| Sujet | Destination |
|--------|-------------|
| Prix / réservation / annulation | Salon |
| Question technique cheveux | Expert concerné (presta) |
| Préparation | Réponse auto Skedisy d’abord |
| Réclamation / paiement | Salon |

### Statut expert (affiché)

| État | Sens |
|------|------|
| 🟢 Disponible | Peut répondre |
| 🟡 Avec une cliente | Message en file + ack |
| ⚪ Hors ligne | Message en file + ack |

**Ack type :**  
« Votre message a bien été reçu. Le professionnel répondra dès que possible. »

### Auto-réponses (sources = config salon, pas invention)

- prix · durée · préparation · inclus · politique d’annulation · dispo (créneaux)

---

## 2. Exemple produit

> Cliente : « Est-ce que je peux faire cette knotless avec mes cheveux actuels ? »

1. Skedisy détecte **question technique**  
2. Conversation liée à la presta **Knotless** (+ photo si fournie)  
3. Attribution → experte qui fait les knotless  
4. Experte répond quand dispo  
5. CTA **Réserver** dans le fil (même service / options / photo)

---

## 3. Écart vs code actuel

| Brique | Existe | Gap |
|--------|--------|-----|
| Inbox salon partagée | Oui (`Messages.js`, `salonConversation`) | Pas d’identité staff / assignee |
| Messages + photos | Oui | Pas `serviceId` / `bookingId` / `demandId` |
| Assigner à un expert | Non | Champ + API + UI + notif expert |
| Routage auto par sujet | **Oui** (règles + chips) | — |
| Statut expert messaging | **Oui** | — |
| AI / FAQ sur fiche presta | **Oui** (grounded, pas Gemini libre) | Créneaux live = P3 optionnel |
| Demand / devis inbox | Oui (séparé) | Relié via `demandId` |

**Principe :** garder Demand (devis→acompte→booking) et Messaging (Q&A humaine) distincts, reliés par `serviceId` / `demandId` / `bookingId`.

---

## 4. Phases de build

### P0 — Contexte presta (funnel) · **FAIT**

Objectif : le fil n’est plus « salon × user », c’est « autour d’une presta ».

1. ~~Étendre `SalonConversation` : `serviceId`, `bookingId?`, `demandId?`, `topic?`~~
2. ~~Ouverture Message depuis fiche presta (`Poser une question`) avec contexte~~
3. ~~En-tête inbox salon : nom presta + topic + liens demand/booking~~
4. ~~CTA soft dans le fil cliente : « Réserver cette prestation »~~

### P1 — Personnes & file · **FAIT**

1. ~~`assignedExpertId` + bouton **Assigner à un expert** (filtrés par `serviceId`)~~
2. ~~Filtre inbox : toutes / non attribuées / par expert + notif FCM expert~~
3. ~~Statuts messaging : available / with_client / offline (isAttend + RDV en cours)~~
4. ~~Accusé auto si expert 🟡/⚪ (cooldown 30 min)~~

### P2 — Qualification auto + AI métier · **FAIT**

1. ~~Classifier sujet (mots-clés + chips client)~~
2. ~~Auto-assign selon topic technique + experts de la presta~~
3. ~~Réponses auto **uniquement** depuis `detailCard` + politique d’annulation~~ (prep / prix / booking / cancel)
4. ~~Ne pas fusionner le concierge découverte~~ (toujours séparé)

**Routage :**
| Sujet | Action |
|--------|--------|
| Technique | Auto-assign expert (si presta connue) |
| Prep / prix / booking / cancel | Réponse auto grounded si données salon |
| Paiement / réclamation | Salon (humain) |
| Autre | Salon |

---

## 5. Différence Skedisy (ce qu’on vend)

| Chat classique | Messagerie métier Skedisy |
|----------------|---------------------------|
| Client → Salon → Expert à la main | Client → Inbox → Qualif → Salon **ou** Expert |
| Fil orphelin | Fil = presta + photo + options + RDV |
| Expert surveillé 24/7 | Expert répond quand dispo ; salon garde le contrôle |
| FAQ inventée | FAQ = fiche prestation configurée |

**Phrase cadrage :**

> Skedisy ne remplace pas WhatsApp par un chat.  
> Il transforme chaque message en **qualification de prestation** qui mène à la bonne personne, puis à la réservation.

---

## 6. KPI à suivre

- % messages avec `serviceId` renseigné  
- % sujets préparés résolus en auto (sans humain)  
- Temps médian 1ʳᵉ réponse humaine (salon vs expert)  
- Taux fil → réservation / demand créée  
- % conversations assignées à un expert

---

## Références

- Inbox actuelle : `salonConversation.model.js`, `salonMessaging.service.js`, `Messages.js`, `salon-messaging.js`
- Fiche presta : `detailCard` / Service Engine  
- Demand : `serviceDemand` (ne pas écraser)  
- Wedge fondateur : `FONDATEUR_WEDGE_DECISION.md` (chaos WA/DM = douleur #1 adjacente)

---

*Document interne — vision messagerie métier (à brancher après acompte / prep J-1 / profil).*
