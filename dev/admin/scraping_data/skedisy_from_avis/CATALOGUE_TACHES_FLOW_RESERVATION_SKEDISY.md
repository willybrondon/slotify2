# Catalogue — Flow réservation Skedisy actuel + tâches + infos salon custom

**Statut :** spécification produit — **pas d’implémentation**  
**Base :** tunnel web actuel `salon-booking.js` (modale page salon)  
**Règle :** on **garde** les étapes actuelles ; on **ajoute** des tâches ; chaque étape a un slot **« Infos salon »** configurable.

---

## 1. Flow actuel Skedisy (inchangé comme squelette)

```
E0  Entrée page salon / CTA « Réserver » / deep link
E1  Prestations (services)     ← multi-select catalogue
E2  Professionnel (expert)
E3  Date & créneau
E4  Coordonnées (guest OTP / compte)
E5  Paiement (cash / Stripe / wallet + coupon)
E6  Confirmation succès
```

*(Hors tunnel mais liés : rappels SMS 24h/2h existants post-booking.)*

---

## 2. Capacité salon universelle — « Infos / champs custom »

Sur **chaque** étape E1–E6 (et optionnellement E0), le salon peut ajouter :

| Type d’élément | Exemple | Comportement |
|---|---|---|
| **Texte info** (non bloquant) | « Prévoir 4–6h », « Parking derrière » | Affiché, pas de saisie |
| **Question** (texte / select / oui-non / nombre) | « Longueur », « Qui apporte les mèches » | Réponse stockée sur la résa |
| **Photo** (upload) | Inspiration, état cheveux | Liée à la résa / devis |
| **Case à cocher obligatoire** | « J’accepte les conditions d’acompte » | Bloque Continuer si non cochée |
| **Lien** | Instagram du salon, FAQ | Ouverture externe |

### Règles produit

1. Chaque élément a : `étape`, `label`, `type`, `obligatoire?`, `services ciblés?` (tous ou liste), `ordre`.
2. Les réponses partent dans le **snapshot réservation** (et Demand si devis).
3. Le salon active/désactive sans changer le flow global.
4. Skedisy propose un **catalogue de tâches recommandées** (ci-dessous) ; le salon peut en ajouter d’autres libres.

---

## 3. Catalogue complet par étape

Légende : **Existant** = déjà dans Skedisy · **À brancher** = wedge Afro · **Custom salon** = toujours possible

---

### E0 — Entrée (page salon / ouverture modale)

| # | Élément / tâche | Statut | Notes |
|---|---|---|---|
| E0.1 | CTA « Réserver » | **Existant** | Ouvre la modale |
| E0.2 | Deep link / App Links | **Existant** | Partage salon |
| E0.3 | CTA unifié (pas second « Devis ») | **À brancher** | Convergence flow |
| E0.4 | Capture canal (WA / IG / Google) | **À brancher** | UTM ou `?from=` |
| E0.5 | Lien « reprendre ma dernière presta » | **À brancher** | Si cliente connue |
| E0.C | **Infos salon custom** (bandeau, message d’accueil résa) | **Custom salon** | Toujours |

---

### E1 — Prestations (services)  *étape la plus enrichie*

| # | Élément / tâche | Statut | Notes |
|---|---|---|---|
| E1.1 | Liste / grille des services | **Existant** | Multi-select |
| E1.2 | Filtres catégories | **Existant** | Tabs catégories |
| E1.3 | Affichage prix + durée catalogue | **Existant** | Flat price |
| E1.4 | Hint multi-services | **Existant** | |
| E1.5 | Guidage familles (tresses / locks / lace…) | **À brancher** | Réduit confusion styles |
| E1.6 | Après sélection : **questions config** (0–N selon service) | **À brancher** | afroConfig.configSchema |
| E1.7 | Upload **photo** inspiration (si activé service) | **À brancher** | |
| E1.8 | Question **mèches** (cliente / salon) | **À brancher** | Souvent dans schema |
| E1.9 | Flag **événement** (mariage, shoot…) | **À brancher** | Option salon |
| E1.10 | **Calcul devis + durée** dynamique | **À brancher** | Inline sous les services |
| E1.11 | Afficher **breakdown** prix / durée | **À brancher** | |
| E1.12 | Case « J’ai compris le devis » | **À brancher** | Preuve |
| E1.13 | File review salon si outlier (bloque créneau) | **À brancher** | S3 |
| E1.C | **Infos / questions / photos custom salon** | **Custom salon** | Par service ou global E1 |

---

### E2 — Professionnel (expert)

| # | Élément / tâche | Statut | Notes |
|---|---|---|---|
| E2.1 | Liste experts pour service(s) | **Existant** | API experts |
| E2.2 | Photo / nom / note | **Existant** | |
| E2.3 | Expert pré-sélectionné (deep link) | **Existant** | Hint |
| E2.4 | Filtrer experts **capables** de la config | **À brancher** | Post-qualif |
| E2.5 | Afficher niveau (junior / senior) | **À brancher** | Si salon renseigne |
| E2.6 | Option « n’importe quel pro dispo » | **À brancher** | Like SQUIRE any |
| E2.C | **Infos custom salon** (ex. « Marie = lace only ») | **Custom salon** | Texte / badge |

---

### E3 — Date & créneau

| # | Élément / tâche | Statut | Notes |
|---|---|---|---|
| E3.1 | Calendrier / mois | **Existant** | |
| E3.2 | Créneaux matin / après-midi | **Existant** | |
| E3.3 | Blocage créneaux occupés | **Existant** | |
| E3.4 | Chaîne de slots selon **durée** | **Existant** | Durée catalogue |
| E3.5 | Utiliser **durée devis** si config | **À brancher** | Anti-accordéon |
| E3.6 | Afficher durée réservée (« 5h15 ») | **À brancher** | Transparence |
| E3.7 | Soft-hold pendant paiement | **À brancher** | Option |
| E3.C | **Infos custom salon** (ex. « Pas de pose lace le dimanche ») | **Custom salon** | |

---

### E4 — Coordonnées (détails / OTP)

| # | Élément / tâche | Statut | Notes |
|---|---|---|---|
| E4.1 | Email + téléphone | **Existant** | |
| E4.2 | Envoi / vérif OTP guest | **Existant** | |
| E4.3 | Connexion compte existant | **Existant** | authUrls |
| E4.4 | Prefill si déjà connectée | **Existant** | |
| E4.5 | Lier historique / dernière config | **À brancher** | Mémoire |
| E4.6 | Consentement contact / rappel | **À brancher** | Option RGPD soft |
| E4.C | **Infos / champs custom salon** (ex. « Prénom pour le RDV », « Âge enfant ») | **Custom salon** | |

---

### E5 — Paiement

| # | Élément / tâche | Statut | Notes |
|---|---|---|---|
| E5.1 | Récap services / total / taxe | **Existant** | |
| E5.2 | Coupon | **Existant** | |
| E5.3 | Choix cash / Stripe / wallet | **Existant** | Selon settings salon |
| E5.4 | Stripe Payment Element | **Existant** | |
| E5.5 | Si devis : payer **acompte** (pas le plein) | **À brancher** | depositPolicy |
| E5.6 | Afficher **reste dû** au salon | **À brancher** | |
| E5.7 | Afficher **règles annulation / report** | **À brancher** | Texte salon |
| E5.8 | Case acceptation conditions acompte | **À brancher** | |
| E5.9 | Promo appliquée **sur montant devis** | **À brancher** | Cohérence |
| E5.C | **Infos custom salon** (ex. « Acompte non remboursable sous 48h ») | **Custom salon** | |

---

### E6 — Confirmation (succès)

| # | Élément / tâche | Statut | Notes |
|---|---|---|---|
| E6.1 | Message succès + n° résa | **Existant** | |
| E6.2 | Récap date / pro / services | **Existant** (partiel) | Enrichir |
| E6.3 | Récap **config + devis + durée + acompte** | **À brancher** | Preuve écrite |
| E6.4 | **Checklist prep** (mèches, lavage, arrivée) | **À brancher** | |
| E6.5 | Lien / PDF récap | **À brancher** | |
| E6.6 | Rappels 24h / 2h | **Existant** (SMS post-book) | Enrichir copy |
| E6.7 | Rappels avec checklist | **À brancher** | |
| E6.8 | Règle reprise après-vente (texte) | **À brancher** | |
| E6.9 | CTA « reprendre cette config » (plus tard) | **À brancher** | |
| E6.C | **Infos custom salon** (ex. adresse précise, code immeuble, IG) | **Custom salon** | |

---

### Post-réservation (hors étapes modale, même « flow vie »)

| # | Élément / tâche | Statut |
|---|---|---|
| P.1 | Notif salon nouvelle résa | **Existant** (emails admin/salon) |
| P.2 | Notif « devis à valider » / acompte | **À brancher** (partiel Demand) |
| P.3 | Push retard salon / statut attente | **À brancher** |
| P.4 | Check-in / durée réelle | **À brancher** |
| P.5 | Solde final + reçu | **À brancher** |
| P.C | Messages custom salon dans rappels | **Custom salon** |

---

## 4. Modèle « le salon ajoute une info »

```
SalonBookingField {
  step: "services" | "expert" | "datetime" | "contact" | "payment" | "confirm" | "entry"
  kind: "info" | "text" | "select" | "boolean" | "number" | "photo" | "link" | "checkbox_required"
  label: string
  helpText?: string
  required: boolean
  options?: string[]          // si select
  applyToServiceIds?: id[]    // vide = toutes les résas
  sortOrder: number
  enabled: boolean
}
```

**UI panel salon (cible) :**  
Paramètres réservation → par étape → « Ajouter une information / question » → aperçu tunnel.

**Stockage réponses :**  
`booking.customAnswers` / `demand.answers` (merge), visible panel + emails.

---

## 5. Ordre d’activation recommandé (sans casser le flow)

1. **E1** : questions + devis inline + photo (services projet)  
2. **E3** : durée = devis  
3. **E5** : acompte + reste dû + règles  
4. **E6** : checklist prep  
5. **Custom salon** disponible dès le début sur toutes les étapes (même avant wedge complet)

---

## 6. Anti-friction (rappel)

- Pas de nouvelle étape « Devis » dans la barre d’étapes.  
- Les tâches E1.6–E1.12 se jouent **dans** Prestations.  
- Custom salon = infos courtes ; pas un 2ᵉ formulaire de 15 champs par défaut.  
- S0 sans afroConfig = flow actuel quasi inchangé + customs si le salon en met.

---

Canvas : `skedisy-booking-tasks-catalog.canvas.tsx`
