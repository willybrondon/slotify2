# Sprint G — Réservation : nouveaux créneaux · reprogrammation · annulation + acompte

**Statut :** livré (dev) · 2026-09-16  
**Demande :** Réserver = nouveaux créneaux + éditer dans une fenêtre libre + sinon politique de rétention d’acompte (ex. 50 %) si le salon a activé `cancellationPolicy`.

## Règles

| Situation | Comportement |
|-----------|----------------|
| ≥ `freeCancelHours` avant le RDV (défaut **24 h**) | Annulation **et** reprogrammation **gratuites** |
| < `freeCancelHours` **et** policy salon **activée** | Annulation possible avec rétention `lateCancelPercent` % de l’**acompte** (défaut 50 %). Reprogrammation libre **bloquée** → réserver un nouveau créneau après annulation |
| < `freeCancelHours` **sans** policy | Annulation / modification bloquées → contacter le salon |
| Après check-in | Bloqué |

Nouveaux créneaux = parcours `SalonBooking.open()` existant (inchangé).

## Backend

- `services/bookingLifecycle.service.js` — `evaluateBookingActions`, `applyClientCancel`, `applyClientReschedule`
- `booking.cancelSettlement` — mode / % / montants retenus / remboursés
- `cancelBookingByUser` — applique la policy + rembourse `refundAmount` au wallet
- Public :
  - `GET /api/public/booking/lifecycle?bookingId=&token=`
  - `POST /api/public/booking/cancel-json`
  - `POST /api/public/booking/reschedule`
  - `GET /api/public/booking/cancel` (email) — plus de hard-block 24 h fixe
  - `GET /api/public/client/upcoming?salonId=&userId=`
- Email confirmation : heures libres = `salon.cancellationPolicy.freeCancelHours` + hint rétention si activé

## Panel salon

Profil → Politique No-Show / annulation : toggle + heures gratuites + % tardif + % no-show.  
Hint mis à jour : rétention d’acompte hors fenêtre libre.

## UI fiche salon

- Après confirmation : boutons Modifier / Annuler + message policy
- Cliente connectée : bandeau « Vos prochains rendez-vous » + CTA nouveau créneau

## Test manuel

1. Salon : activer policy, freeCancelHours=24, lateCancelPercent=50  
2. Réserver un RDV > 24 h → modifier créneau OK, annuler = remboursement total acompte  
3. RDV < 24 h → modifier refusé ; annuler = message rétention 50 % + `cancelSettlement`  
4. Policy off + RDV < 24 h → annulation refusée  
5. Email « Annuler » : même règles
