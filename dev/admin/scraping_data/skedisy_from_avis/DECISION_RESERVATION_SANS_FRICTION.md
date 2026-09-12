# Décision produit — Réservation fluide (sans « devis » bloquant)

**Statut :** décision produit + ajustements UX  
**Problème posé :** retard cliente, prix/durée qui dérivent, devis qui freine, salon qui veut clarifier sans casser le flow.

---

## 1. Principe unique

| Avant (risque) | Maintenant |
|---|---|
| Tunnel « devis » séparé / wording devis | **Une seule réservation** |
| Case « j’accepte le devis » | **Estimation affichée**, Continuer |
| Review salon = cul-de-sac | Review = **résa en attente** + salon peut **poser 1 question** |
| Confirm ≠ récap prix/durée | **Une seule confirmation** : créneau + estimation + prep |
| Rien le jour J | **Ajustement salon** (retard / durée / solde) |

Formule cliente : *« Je réserve »*  
Formule salon : *estimation + infos + validation légère si besoin*  
**Jamais** : produit nommé « Devis » comme frein.

---

## 2. Infos à afficher sur la prestation (E1)

Sur chaque carte / détail service (surtout projets longs) :

| Info | Rôle | Exemple |
|---|---|---|
| Prix d’entrée | Ancrage | « à partir de 120 € » |
| Fourchette durée | Anti-surprise | « 3–6 h selon longueur / densité » |
| Ce qui fait varier | Transparence | longueur, mèches, densité |
| Préparation | Moins de retard | « cheveux propres / secs » |
| Acompte éventuel | Trust | « acompte si presta longue » (soft) |

Les **questions config** (0–N) restent *dans* Prestations — ce ne sont pas un devis, c’est « préciser la presta ».

---

## 3. Estimation ≠ fonctionnalité bloquante

1. Calcul prix/durée = **aide à la résa** (snapshot sur le booking).  
2. Affiché comme **« Prix & durée estimés »**, pas « Votre devis ».  
3. **Pas de case obligatoire** « j’accepte le devis ».  
4. Un seul bouton **Continuer** → pro → créneau → contact → paiement → **confirm unique**.  
5. La réception de l’estimation **est** la confirmation de réservation (même écran / même email).

Si outlier / doute salon :
- la cliente **termine quand même** la résa ;
- statut booking = `pending` (salon confirme) ;
- le salon peut **Accepter** · **Poser une question** · **Refuser** (avec motif court).

→ Ça évite les problèmes **sans** ajouter d’étape cliente.

---

## 4. Validation salon par question (anti-friction)

```
Cliente réserve (estimation visible)
        ↓
Booking pending (+ snapshot config)
        ↓
Salon inbox :
  ✓ Confirmer
  ? Poser 1 question précise (« Qui apporte les mèches ? »)
  ✗ Refuser (motif)
        ↓
Cliente répond (SMS / lien) → salon confirme
```

Règles :
- **1 question à la fois** (pas un interrogatoire).  
- Timeout soft (ex. 24–48 h) puis relance.  
- Tant que pending : créneau soft-hold ou confirmé selon politique salon (défaut V1 : créneau réservé, salon peut décaler si refus).

---

## 5. Jour J — retard, durée trop longue, prix

| Situation | Action salon (panel / app) | Effet cliente |
|---|---|---|
| **Retard cliente** | Marquer retard + option : raccourcir presta / reporter / no-show soft | Notif claire |
| **Durée >> prévue** | Ajuster durée réelle + solde | Transparence avant départ |
| **Prix qui ne colle pas** | Ajuster solde (avec motif) | Reçu mis à jour |
| Check-in / check-out | Timestamps déjà prévus côté booking | Preuve durée |

Pas de nouveau tunnel cliente le jour J : **le salon pilote**, la cliente voit le résultat.

---

## 6. Ce qu’on ne fait pas

- Pas de second CTA « Obtenir un devis ».  
- Pas de wording « devis » dans le tunnel.  
- Pas de blocage hard avant créneau pour review salon.  
- Pas de 13 étapes.  
- Pas d’hygiène / qualité mèches « magique » en software (#20 hors scope).

---

## 7. Implémentation immédiate vs suite

| Maintenant | Suite |
|---|---|
| Copy sans « devis » | Panel : Poser une question (1 champ) |
| Plus de checkbox accept devis | SMS/lien réponse cliente |
| Review → continuer en pending | Ajustement jour J durée/solde UI |
| Infos durée/prix sur carte | Email unique confirm = estimation + RDV |

---

Canvas / catalogue : aligné sur `CATALOGUE_TACHES_FLOW_RESERVATION_SKEDISY.md` (E1 infos, E6 confirm unifiée, post : adjust).
