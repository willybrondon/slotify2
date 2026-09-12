# Tâches × étapes — workflow réservation Skedisy

**Statut :** catalogue produit — **pas d’implémentation**  
**Squelette :** Entrée → Prestations → Pro → Créneau → Contact → Paiement → Confirm (+ post-résa)

Légende : **Existant** · **À ajouter** · **Custom salon** (toujours possible sur l’étape)

---

## Vue rapide

| Étape | Tâches clés à ajouter |
|---|---|
| **E0 Entrée** | Canal d’origine · reprendre presta · message salon |
| **E1 Prestations** | Infos durée/prix · questions · photo · estimation · custom |
| **E2 Pro** | Filtre config · junior/senior · any · custom |
| **E3 Créneau** | Durée = estimation · plage affichée · soft-hold · custom |
| **E4 Contact** | Mémoire config · consentement · custom |
| **E5 Paiement** | Acompte · reste dû · annulation · custom |
| **E6 Confirm** | Récap unifié · checklist prep · PDF · custom |
| **P Post-résa** | Question salon · réponse cliente · jour J (retard/durée/solde) · rappels |

---

## E0 — Entrée (page salon / CTA / deep link)

| ID | Tâche | Statut |
|---|---|---|
| E0.1 | CTA « Réserver » | Existant |
| E0.2 | Deep link / App Links | Existant |
| E0.3 | Un seul CTA (pas second tunnel devis) | Existant / à finaliser |
| E0.4 | Capture canal (WA / IG / Google / UTM) | **À ajouter** |
| E0.5 | Lien « reprendre ma dernière presta » | **À ajouter** |
| E0.C | Message d’accueil / bandeau **custom salon** | **Custom salon** |

---

## E1 — Prestations

| ID | Tâche | Statut |
|---|---|---|
| E1.1 | Liste / grille services | Existant |
| E1.2 | Filtres catégories | Existant |
| E1.3 | Prix + durée catalogue | Existant |
| E1.4 | Hint multi-services | Existant |
| E1.5 | Infos carte : fourchette durée, « à partir de », ce qui fait varier | **À ajouter** |
| E1.6 | Texte prep sur la presta (cheveux propres / secs…) | **À ajouter** |
| E1.7 | Guidage familles (tresses / locks / lace…) | **À ajouter** |
| E1.8 | Questions config 0–N (longueur, densité…) | Partiel / **à enrichir** |
| E1.9 | Photo inspiration (soft, non bloquante) | Partiel / **à enrichir** |
| E1.10 | Question mèches (cliente / salon) | **À ajouter** |
| E1.11 | Flag événement (mariage / shoot) | **À ajouter** |
| E1.12 | Estimation prix + durée (inline, non bloquante) | Partiel / **à finaliser wording** |
| E1.13 | Breakdown prix / durée | Partiel |
| E1.14 | Soft pending si salon doit valider (pas de cul-de-sac) | Partiel |
| E1.C | Infos / questions / photos **custom salon** | **Custom salon** |

---

## E2 — Professionnel

| ID | Tâche | Statut |
|---|---|---|
| E2.1 | Liste pros pour service(s) | Existant |
| E2.2 | Photo / nom / note | Existant |
| E2.3 | Pré-sélection expert (deep link) | Existant |
| E2.4 | Filtrer pros capables de la **config** | **À ajouter** |
| E2.5 | Niveau junior / senior | **À ajouter** |
| E2.6 | Option « n’importe quel pro dispo » | **À ajouter** |
| E2.C | Infos **custom salon** (ex. Marie = lace only) | **Custom salon** |

---

## E3 — Date & créneau

| ID | Tâche | Statut |
|---|---|---|
| E3.1 | Calendrier | Existant |
| E3.2 | Créneaux matin / après-midi | Existant |
| E3.3 | Blocage busy | Existant |
| E3.4 | Chaîne de slots selon durée | Existant |
| E3.5 | Utiliser **durée estimée** (config) | Partiel / **à fiabiliser** |
| E3.6 | Afficher plage réservée (« 5h15 ») | Partiel |
| E3.7 | Soft-hold pendant paiement | **À ajouter** |
| E3.C | Infos **custom salon** (ex. pas de lace le dimanche) | **Custom salon** |

---

## E4 — Coordonnées

| ID | Tâche | Statut |
|---|---|---|
| E4.1 | Email + téléphone | Existant |
| E4.2 | OTP guest | Existant |
| E4.3 | Compte / prefill | Existant |
| E4.4 | Lier historique / dernière config | **À ajouter** |
| E4.5 | Consentement contact / rappel | **À ajouter** |
| E4.C | Champs **custom salon** | **Custom salon** |

---

## E5 — Paiement

| ID | Tâche | Statut |
|---|---|---|
| E5.1 | Récap / total / taxe | Existant |
| E5.2 | Coupon | Existant |
| E5.3 | Cash / Stripe / wallet | Existant |
| E5.4 | Acompte (si politique service) | Partiel |
| E5.5 | Afficher reste dû au salon | Partiel |
| E5.6 | Règles annulation / report (texte) | **À ajouter** |
| E5.7 | Promo cohérente avec estimation | **À ajouter** |
| E5.C | Infos **custom salon** | **Custom salon** |

---

## E6 — Confirmation

| ID | Tâche | Statut |
|---|---|---|
| E6.1 | Succès + n° résa | Existant |
| E6.2 | **Confirm unifiée** : RDV + estimation + durée | Partiel / **à finaliser** |
| E6.3 | Checklist prep (mèches, arrivée, lavage) | Partiel |
| E6.4 | Lien / PDF récap | **À ajouter** |
| E6.5 | CTA « reprendre cette config » | **À ajouter** |
| E6.C | Infos **custom salon** (adresse, code, IG) | **Custom salon** |

---

## P — Post-réservation (hors modale, même parcours de vie)

| ID | Tâche | Étape métier | Statut |
|---|---|---|---|
| P.1 | Rappels SMS 24h / 2h | Après confirm | Existant |
| P.2 | Rappels + checklist | Après confirm | **À ajouter** |
| P.3 | Salon : Valider la résa | Inbox salon | Partiel |
| P.4 | Salon : **1 question précise** à la cliente | Inbox salon | Partiel / **à brancher SMS-lien** |
| P.5 | Cliente : répondre à la question | Lien / SMS | **À ajouter** |
| P.6 | Salon : Refuser (motif court) | Inbox salon | **À ajouter** |
| P.7 | Jour J : marquer **retard** | Check-in | **À ajouter** |
| P.8 | Jour J : ajuster **durée réelle** | Pendant / fin presta | **À ajouter** |
| P.9 | Jour J : ajuster **solde / prix** | Fin presta | **À ajouter** |
| P.10 | Messages custom dans rappels | Après confirm | **Custom salon** |

---

## Capacité transversale (toutes les étapes E0–E6)

Le salon peut ajouter sur **n’importe quelle étape** :

| Type | Exemple |
|---|---|
| Texte info | « Prévoir 4–6 h » |
| Question | Longueur, qui apporte les mèches |
| Photo | Inspiration |
| Case obligatoire | Acceptation conditions acompte |
| Lien | IG, FAQ parking |

Ciblage : tous services **ou** liste de services · ordre · activé/désactivé.

---

Doc lié : `CATALOGUE_TACHES_FLOW_RESERVATION_SKEDISY.md` · `DECISION_RESERVATION_SANS_FRICTION.md`
