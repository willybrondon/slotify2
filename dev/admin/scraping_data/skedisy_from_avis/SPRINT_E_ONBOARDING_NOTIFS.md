# Sprint E — Onboarding + notifs + polish bookings

**Statut :** livré (dev) · 2026-09-12  
**Suite de :** `SPRINT_C_PANEL_CONFIG.md`

## Livré

### Onboarding checklist (panel Config)
3 étapes affichées depuis `GET /salon/demand/afro-config` → `onboarding` :
1. Au moins une prestation projet (S1+)
2. Flow devis activé
3. Stripe Connect `chargesEnabled` (lien vers Paiements si non)

### Emails salon (SendGrid)
`services/afroDemandEmail.service.js`
- À la **création** de demand → « Nouvelle demande » ou « Devis à valider »
- À **confirm-deposit** → « Acompte reçu »
- CTA vers `/salonpanel/demandTable`

### Bookings
Liste salon expose `demandId` / `depositAmount` / `balanceDue` ; colonne Prix montre le **reste dû** si devis lié.

## Reste hors code / manuel
- Test E2E Stripe Connect sur 1 salon démo (staging)
- Kanban colonnes (optionnel)
- SMS cliente (réutiliser crons booking existants suffit pour V1 post-convert)

## Go design partners
Checklist ON + lien WA + Stripe prêt → coller le lien dans une vraie conversation cliente.
