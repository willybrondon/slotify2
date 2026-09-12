# Sprint C (panel config + polish inbox)

**Statut :** livré (dev) · 2026-09-12  
**Note :** dans le plan original, « Sprint B = config panel » et « C/D = tunnel + acompte » étaient séparés. Le tunnel/acompte est déjà dans `SPRINT_B_TUNNEL_DEPOSIT.md` ; ce doc couvre la **config salon + inbox pro**.

## Livré

### API salon

| Méthode | Path | Rôle |
|---|---|---|
| GET | `/salon/demand/afro-config` | Flag + services + `publicDemandPath` |
| PUT | `/salon/demand/afro-config` | `enabled`, `seedKnotlessDemo`, `depositPercent`, `clearAfroConfig` |
| PUT | `/salon/demand/adjust/:id` | Prix / durée / acompte (+ garde-fou converted) |

### Panel `/salonpanel/demandTable`

- Onglet **Inbox** : cliente, reste dû, Ajuster (modal), Valider, Exonérer
- Onglet **Config** : switch flow, seed Knotless S2, acompte %, retirer config
- **Copier lien** `…/salon/{slug}?flow=devis` pour WA/IG

## Suite

→ `SPRINT_E_ONBOARDING_NOTIFS.md` (checklist + emails + reste dû)

Reste manuel : test Stripe Connect staging · Kanban optionnel.
