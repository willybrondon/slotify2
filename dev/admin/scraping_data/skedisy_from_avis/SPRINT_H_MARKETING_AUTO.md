# Sprint H — Marketing automatisé (StyleSeat-inspired)

**Statut :** livré (dev) · V1 insights + actions  
**Suite de :** acquisition / messagerie / rebooking L2

## StyleSeat → Skedisy V1

| StyleSeat | Skedisy V1 |
|-----------|------------|
| Posts sociaux IA | Brouillons prêts (templates) selon remplissage / promo |
| Site personnalisé | Fiche publique Skedisy (lien dans le panel) |
| Promotions | Promo ciblée salon (code `Coupon` + `salonId`) |
| Fidélité | Déjà en Profil (même presta) — rappel dans Marketing |
| Rebooking | Campagne SMS semaine (clients à échéance) |

## Exemples livrés

- « Mardi prochain, ton planning est rempli à 40 %. » → CTA **Créer promo −15/20 %**
- « 8 clientes arrivent à leur échéance cette semaine. » → CTA **Lancer la campagne SMS**

## API salon

- `GET /salon/marketing/insights`
- `POST /salon/marketing/promo`
- `POST /salon/marketing/rebook-campaign`

## Panel

Menu **Marketing** → `/salonpanel/marketing`

## Hors V1 (L4)

- Génération IA Gemini des posts (templates suffisent pour l’instant)
- Smart pricing dynamique
- Packages / forfaits
