# Sprint A — Fondations wedge Afro (ServiceDemand)

**Statut :** livré (dev) · 2026-09-12  
**Décisions figées :** D1 Demand séparée · D2 commission au convert booking · D3 slot après devis

## Modèles

| Fichier | Changement |
|---|---|
| `models/serviceDemand.model.js` | **Nouveau** — demande / devis / acompte status |
| `models/salon.model.js` | `afroProjectFlowEnabled` + `serviceIds[].afroConfig` |
| `models/booking.model.js` | `demandId`, `configSnapshot`, `quotedPrice`, `estimatedDuration`, `deposit*`, `balanceDue`, `actualDurationMinutes` |
| `services/afroQuote.service.js` | Moteur règles prix/durée + seed Knotless S2 |

## API publique

| Méthode | Path | Rôle |
|---|---|---|
| GET | `/api/public/demand/services?salonId=` | Services + schema si flow ON |
| POST | `/api/public/demand/quote` | Dry-run devis (pas de persist) |
| POST | `/api/public/demand/create` | Crée demand `quoted` / `needs_salon_review` |
| GET | `/api/public/demand/:id` | Détail demand |

### Body quote / create

```json
{
  "salonId": "...",
  "serviceId": "...",
  "answers": { "longueur": "taille", "taille": "M", "meches_qui": "cliente" },
  "photoUrls": [],
  "channelHint": "whatsapp",
  "source": "web"
}
```

## API salon (auth salon + secretKey)

| Méthode | Path | Rôle |
|---|---|---|
| GET | `/salon/demand/getAll?status=` | Inbox demandes |
| PUT | `/salon/demand/adjust/:id` | Ajuster devis / valider review / waive |
| PUT | `/salon/demand/afro-config` | Flag + config service / seed démo |

### Activer + seed Knotless

```json
PUT /salon/demand/afro-config
{
  "enabled": true,
  "serviceId": "<serviceObjectId>",
  "seedKnotlessDemo": true
}
```

## Hors Sprint A (suivant)

- Acompte Stripe (PaymentIntent partial)
- Conversion demand → Booking + créneau
- UI salonportal + panel kanban
- Flutter

## Test manuel rapide

1. Activer flow + seed sur un salon de test  
2. `POST /api/public/demand/quote` avec answers Knotless  
3. `POST /api/public/demand/create`  
4. `GET /salon/demand/getAll` côté panel  
