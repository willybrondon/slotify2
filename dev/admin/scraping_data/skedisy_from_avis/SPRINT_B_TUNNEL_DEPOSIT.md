# Sprint B — Tunnel web + acompte + convert + panel

**Statut :** livré (dev) · 2026-09-12  
**Suite de :** `SPRINT_A_DEMAND_FOUNDATIONS.md`

## Livré

### Public API (deposit → booking)

| Méthode | Path | Rôle |
|---|---|---|
| POST | `/api/public/demand/stripe-intent` | PaymentIntent acompte (Connect) |
| POST | `/api/public/demand/confirm-deposit` | Marque `deposit_paid` après PI succeeded |
| POST | `/api/public/demand/convert` | Crée booking via `newBooking` + expand slots durée devis |

### Booking

- `newBooking` accepte `demandId` : override prix/durée, lien demand → booking, statut `converted`.

### Tunnel web

- `salonportal/public/salon-afro-demand.js` — service → questions → devis → OTP → acompte Stripe → créneau → convert
- Injecté sur page salon si `afroProjectFlowEnabled` (`salon.controller.js`)
- CTA « Obtenir un devis » + deep link `?flow=devis`
- Si `needs_salon_review` : stop après devis (pas de créneau)

### Panel salon

- Route `/salonpanel/demandTable`
- Liste + filtre statut + Valider / Exonérer acompte
- Redux `demandSlice` · nav « Demandes devis »

## Activer un salon démo

```http
PUT /salon/demand/afro-config
{ "enabled": true, "seedKnotlessDemo": true, "serviceId": "<id prestation Knotless>" }
```

## Hors scope (Sprint E+)

Flutter parity · WA Business API · checklist prep riche · CRM mémoire · onboarding checklist salon
