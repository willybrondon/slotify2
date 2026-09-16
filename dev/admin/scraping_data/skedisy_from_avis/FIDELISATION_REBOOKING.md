# Fidélisation Skedisy = rebooking + historique (pas de points génériques)

## Principe

Aligné `PROMPT6` / StyleSeat : **pas** un programme de points vanity.  
Fidélité = **récompense le retour sur la même presta chez le même salon**, branchée sur l’**historique completed**.

```
Historique cliente (Beauty Profile lite)
        ↓
Rebooking (même config / coiffeuse)
        ↓
Réduction % si N visites completed de cette presta
```

## Règle L1

| Champ salon `loyaltyProgram` | Défaut | Sens |
|---|---|---|
| `enabled` | false | Opt-in salon |
| `sameServiceRebookPercent` | 10 | % off HT |
| `minCompletedCount` | 1 | 1 = dès le **2ᵉ** passage |
| `maxDiscountAmount` | 0 | Plafond € (0 = illimité) |

Comptage : `Booking` avec `status=completed`, même `userId` + `salonId` + `serviceId`.

## UX

- SMS / bannière rebook : « Fidélité : −10% (2 visites) »
- Tunnel : ligne réduction + tag fidélité
- API historique : `GET /api/public/client/salon-history?salonId=&userId=`

## Panel

**Profil salon** → toggle Fidélité rebooking + % / min visites / plafond.

## Fichiers

- `models/salon.model.js` · `booking.model.js`
- `services/loyalty.service.js`
- `services/rebooking.service.js` (loyalty + history dans le contexte)
- `controller/user/booking.cotroller.js` (`applyLoyalty`)
- `controller/user/publicClientHistory.controller.js`
- `AdminProfile.js`
- `salon-booking.js`

## L2

Beauty Profile app · push · « Reprendre » depuis historique sans SMS · paliers 5e / 10e visite.
