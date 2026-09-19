/**
 * Canonical Skedisy SaaS feature keys.
 * Inspired by StyleSeat Premium (one seat + opt-in growth tools),
 * but Skedisy exposes Basic / Premium / Enterprise for admin control.
 *
 * Admin toggles which keys each SubscriptionPlan includes.
 * Salon may opt-out individual features via subscription.featureOverrides.
 */

const SUBSCRIPTION_FEATURES = [
  {
    key: "booking_calendar",
    label: "Agenda & réservations",
    group: "core",
    description: "Créneaux, confirmations, planning équipe",
  },
  {
    key: "public_web_page",
    label: "Page salon publique",
    group: "core",
    description: "Fiche web bookable Skedisy",
  },
  {
    key: "team_schedule",
    label: "Planning multi-pros",
    group: "core",
    description: "Vue équipe, busy slots, résa panel",
  },
  {
    key: "stripe_payments",
    label: "Paiements carte (Stripe)",
    group: "payments",
    description: "Encaissement + Connect",
  },
  {
    key: "deposits",
    label: "Acomptes / no-show",
    group: "payments",
    description: "Deposit policy + politiques d’annulation",
  },
  {
    key: "sms_reminders",
    label: "Rappels SMS / email",
    group: "retention",
    description: "Prep J-1, rappels RDV",
  },
  {
    key: "messaging",
    label: "Messagerie métier",
    group: "retention",
    description: "Inbox salon, routage expert, auto-réponses",
  },
  {
    key: "beauty_profile",
    label: "Profil beauté / historique",
    group: "retention",
    description: "Config sauvée, photos résultat",
  },
  {
    key: "rebooking",
    label: "Rebooking 2 taps",
    group: "retention",
    description: "Reprendre dernière config",
  },
  {
    key: "loyalty_program",
    label: "Fidélité salon",
    group: "retention",
    description: "Réduction à partir de la Nᵉ visite",
  },
  {
    key: "afro_configurator",
    label: "Configurateur Afro / devis",
    group: "growth",
    description: "ServiceDemand, quote, add-ons",
  },
  {
    key: "marketplace_discovery",
    label: "Visibilité marketplace Skedisy",
    group: "growth",
    description: "Apparition dans la recherche / home (StyleSeat discovery)",
  },
  {
    key: "acquisition_leads",
    label: "Leads acquisition Skedisy",
    group: "growth",
    description: "Eligible New Client Connection-style (commission 1ʳᵉ) — fee séparée du SaaS",
  },
  {
    key: "marketing_auto",
    label: "Marketing auto (promos / SMS)",
    group: "growth",
    description: "Campagnes, suggestions remplissage agenda",
  },
  {
    key: "analytics_advanced",
    label: "Analytics avancées",
    group: "growth",
    description: "Rapports CA, durée réelle vs prévue",
  },
  {
    key: "custom_branding",
    label: "Branding custom",
    group: "enterprise",
    description: "Personnalisation page / domaine",
  },
  {
    key: "multi_location",
    label: "Multi-adresses",
    group: "enterprise",
    description: "Plusieurs lieux sous un compte",
  },
  {
    key: "priority_support",
    label: "Support prioritaire",
    group: "enterprise",
    description: "SLA support dédié",
  },
];

const FEATURE_KEYS = SUBSCRIPTION_FEATURES.map((f) => f.key);

/** Default matrices — admin can edit after seed */
const DEFAULT_PLAN_FEATURES = {
  free: [
    "booking_calendar",
    "public_web_page",
    "team_schedule",
  ],
  basic: [
    "booking_calendar",
    "public_web_page",
    "team_schedule",
    "stripe_payments",
    "deposits",
    "sms_reminders",
    "messaging",
    "beauty_profile",
    "rebooking",
  ],
  premium: [
    "booking_calendar",
    "public_web_page",
    "team_schedule",
    "stripe_payments",
    "deposits",
    "sms_reminders",
    "messaging",
    "beauty_profile",
    "rebooking",
    "loyalty_program",
    "afro_configurator",
    "marketplace_discovery",
    "acquisition_leads",
    "marketing_auto",
    "analytics_advanced",
  ],
  enterprise: [...FEATURE_KEYS],
};

module.exports = {
  SUBSCRIPTION_FEATURES,
  FEATURE_KEYS,
  DEFAULT_PLAN_FEATURES,
};
