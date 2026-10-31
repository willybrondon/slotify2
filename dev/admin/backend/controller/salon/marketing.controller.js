const Coupon = require("../../models/coupon.model");
const {
  getOccupancyInsight,
  getRebookDueInsight,
  createTargetedPromo,
} = require("../../services/marketingAutomation.service");
const { launchSalonRebookCampaign, salonPublicSlug } = require("../../services/rebooking.service");
const { getLoyaltyProgram } = require("../../services/loyalty.service");
const {
  resolveSalonSubscription,
  salonHasFeature,
} = require("../../services/subscription.service");

async function resolveMarketingAccess(salon) {
  const resolved = await resolveSalonSubscription(salon);
  const canSendRebook =
    salonHasFeature(resolved, "rebooking") ||
    salonHasFeature(resolved, "marketing_auto") ||
    salonHasFeature(resolved, "sms_reminders");
  const canCreatePromo = salonHasFeature(resolved, "marketing_auto");
  return {
    resolved,
    canSendRebook,
    canCreatePromo,
    planId: resolved.planId || "free",
    planName: resolved.plan?.name || "Free",
    upgradeHint: !canSendRebook
      ? "Les campagnes SMS / rebooking sont disponibles à partir de l’abonnement Basic."
      : !canCreatePromo
        ? "Les promos marketing auto sont disponibles avec l’abonnement Premium."
        : null,
  };
}

/**
 * GET /salon/marketing/insights
 */
exports.getInsights = async (req, res) => {
  try {
    const salon = req.salon;
    if (!salon) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const access = await resolveMarketingAccess(salon);

    // Ensure services are populated for promo / pack pickers
    if (salon.serviceIds?.length && !salon.populated("serviceIds.id")) {
      try {
        await salon.populate({
          path: "serviceIds.id",
          select: "name duration price",
        });
      } catch (_) {
        /* ignore */
      }
    }

    let occupancy = null;
    let rebook = null;
    try {
      const rebookFrom = String(req.query.rebookFrom || req.query.from || "").trim();
      const rebookTo = String(req.query.rebookTo || req.query.to || "").trim();
      [occupancy, rebook] = await Promise.all([
        getOccupancyInsight(salon),
        getRebookDueInsight(salon._id, {
          from: rebookFrom || undefined,
          to: rebookTo || undefined,
        }),
      ]);
    } catch (e) {
      console.warn("[marketing] insights soft-fail", e.message);
      occupancy = {
        dayLabel: "",
        suggestedDiscount: 15,
        suggestedPromoTitle: "Offre spéciale",
        message: "Insights temporairement indisponibles",
      };
      rebook = { dueCount: 0, clients: [], suggestCampaign: false, headline: "—" };
    }

    if (rebook && typeof rebook === "object") {
      if (!access.canSendRebook) {
        rebook.suggestCampaign = false;
        rebook.sendLocked = true;
        rebook.lockReason = access.upgradeHint;
      } else if (!(rebook.pendingReminders > 0 || rebook.suggestCampaign)) {
        rebook.suggestCampaign = false;
        rebook.emptyDueMessage =
          rebook.headline ||
          "Aucune cliente à échéance cette semaine. Les clientes apparaissent après des RDV terminés avec une échéance de rebooking.";
      }
    }

    const base = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
    const slug = salonPublicSlug(salon);
    const publicUrl = `${base}/salon/${slug}`;
    let loyalty;
    try {
      loyalty = getLoyaltyProgram(salon);
    } catch (e) {
      loyalty = {
        enabled: false,
        sameServiceRebookPercent: 10,
        minCompletedCount: 1,
      };
    }

    let recentPromos = [];
    try {
      recentPromos = await Coupon.find({ salonId: salon._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .select(
          "code title discountPercent maxDiscount discountType expiryDate validOnDate serviceId isActive createdAt description"
        )
        .lean();
    } catch (e) {
      console.warn("[marketing] promos soft-fail", e.message);
    }

    const packages = Array.isArray(salon.servicePackages)
      ? salon.servicePackages.filter((p) => p)
      : [];

    // Duration learning hint (P3)
    let durationInsight = null;
    try {
      const Booking = require("../../models/booking.model");
      const sampled = await Booking.find({
        salonId: salon._id,
        status: "completed",
        plannedDurationMinutes: { $gt: 0 },
        actualDurationMinutes: { $gt: 0 },
      })
        .sort({ updatedAt: -1 })
        .limit(50)
        .select("plannedDurationMinutes actualDurationMinutes")
        .lean();
      if (sampled.length >= 5) {
        const avgDelta =
          sampled.reduce(
            (s, b) => s + (Number(b.actualDurationMinutes) - Number(b.plannedDurationMinutes)),
            0
          ) / sampled.length;
        if (Math.abs(avgDelta) >= 10) {
          durationInsight = {
            sampleSize: sampled.length,
            avgDeltaMinutes: Math.round(avgDelta),
            headline:
              avgDelta > 0
                ? `Sur ${sampled.length} RDV, la durée réelle dépasse le prévu d’environ ${Math.round(avgDelta)} min.`
                : `Sur ${sampled.length} RDV, la durée réelle est ~${Math.abs(Math.round(avgDelta))} min plus courte que prévu.`,
          };
        }
      }
    } catch (e) {
      console.warn("[marketing] duration insight", e.message);
    }

    return res.status(200).json({
      status: true,
      occupancy,
      rebook,
      durationInsight,
      packages,
      subscription: {
        planId: access.planId,
        planName: access.planName,
        canSendRebook: access.canSendRebook,
        canCreatePromo: access.canCreatePromo,
        upgradeHint: access.upgradeHint,
      },
      loyalty: {
        enabled: loyalty.enabled,
        sameServiceRebookPercent: loyalty.sameServiceRebookPercent,
        minCompletedCount: loyalty.minCompletedCount,
        hint: loyalty.enabled
          ? `Fidélité active : −${loyalty.sameServiceRebookPercent}% dès ${loyalty.minCompletedCount} visite(s) même presta`
          : "Activez la fidélité dans Profil salon (réduction même prestation).",
        profilePath: "/salonpanel/profile",
      },
      site: {
        title: "Votre fiche Skedisy = mini-site",
        publicUrl,
        hint: "Photos, avis, prix, Message, Instagram — le profil public remplace un site basique.",
      },
      roadmap: [
        {
          id: "promos",
          label: "Création de promotion",
          status: access.canCreatePromo ? "ready" : "config",
        },
        {
          id: "rebooking",
          label: "Campagnes rebooking",
          status: access.canSendRebook ? "ready" : "config",
        },
        { id: "packages", label: "Pack beauté", status: packages.length ? "ready" : "config" },
        { id: "loyalty", label: "Fidélité", status: loyalty.enabled ? "ready" : "config" },
        { id: "site", label: "Fiche publique", status: "ready" },
      ],
      recentPromos,
      salonServices: (salon.serviceIds || [])
        .map((entry) => {
          const svc = entry?.id;
          if (!svc) return null;
          const id = svc._id || svc;
          const name = typeof svc === "object" ? svc.name : "";
          return id
            ? {
                id: String(id),
                name: name || "Prestation",
                price: entry.price != null ? Number(entry.price) : null,
              }
            : null;
        })
        .filter(Boolean),
    });
  } catch (error) {
    console.error("[marketing.getInsights]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /salon/marketing/promo
 * body: { discountType: percent|flat, discountPercent?, discountAmount?, title?,
 *         expiryDate?, validOnDate?, serviceId?, serviceName?, daysValid? }
 */
exports.createPromo = async (req, res) => {
  try {
    const salon = req.salon;
    const access = await resolveMarketingAccess(salon);
    if (!access.canCreatePromo) {
      return res.status(200).json({
        status: false,
        message:
          access.upgradeHint ||
          "Passez à Premium pour créer des promotions.",
        upgradeRequired: true,
        planId: access.planId,
      });
    }
    const result = await createTargetedPromo(salon, {
      discountType: req.body?.discountType || req.body?.type || "percent",
      discountPercent: req.body?.discountPercent ?? req.body?.suggestedDiscount,
      discountAmount: req.body?.discountAmount ?? req.body?.amount,
      maxDiscount: req.body?.maxDiscount,
      title: req.body?.title,
      dateHint: req.body?.dateHint,
      daysValid: req.body?.daysValid,
      expiryDate: req.body?.expiryDate || req.body?.date,
      validOnDate: req.body?.validOnDate || req.body?.appointmentDate || "",
      serviceId: req.body?.serviceId || null,
      serviceName: req.body?.serviceName || "",
      minAmountToApply: req.body?.minAmountToApply,
    });
    return res.status(200).json({ status: true, ...result });
  } catch (error) {
    console.error("[marketing.createPromo]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /salon/marketing/rebook-campaign
 * body: { from?, to? } YYYY-MM-DD
 */
exports.launchRebookCampaign = async (req, res) => {
  try {
    const salon = req.salon;
    const access = await resolveMarketingAccess(salon);
    if (!access.canSendRebook) {
      return res.status(200).json({
        status: false,
        message:
          access.upgradeHint ||
          "Passez à Basic pour envoyer des SMS de rebooking.",
        upgradeRequired: true,
        planId: access.planId,
        scanned: 0,
        sent: 0,
      });
    }
    const from = String(req.body?.from || req.body?.startDate || "").trim();
    const to = String(req.body?.to || req.body?.endDate || "").trim();
    const result = await launchSalonRebookCampaign(salon._id, { from, to });
    return res.status(200).json({
      status: true,
      message:
        result.sent > 0
          ? `Campagne envoyée : ${result.sent} SMS`
          : result.scanned === 0
            ? "Aucune cliente à relancer sur cette période (0 RDV completed à échéance)."
            : `Aucun SMS envoyé (${result.skipped} ignorées — déjà réservé ou sans mobile)`,
      ...result,
    });
  } catch (error) {
    console.error("[marketing.launchRebookCampaign]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * PUT /salon/marketing/packages
 */
exports.updatePackages = async (req, res) => {
  try {
    const salon = req.salon;
    let packages = req.body?.packages;
    if (typeof packages === "string") {
      try {
        packages = JSON.parse(packages);
      } catch (e) {
        return res.status(400).json({ status: false, message: "Invalid packages JSON" });
      }
    }
    if (!Array.isArray(packages)) {
      return res.status(400).json({ status: false, message: "packages array required" });
    }
    salon.servicePackages = packages.slice(0, 20).map((p, i) => {
      const serviceIds = Array.isArray(p.serviceIds)
        ? p.serviceIds.map((id) => String(id)).filter(Boolean).slice(0, 30)
        : [];
      const extras = Array.isArray(p.extras)
        ? p.extras.map((x) => String(x || "").trim()).filter(Boolean).slice(0, 20)
        : String(p.extrasText || "")
            .split(/\n|;/)
            .map((x) => x.trim())
            .filter(Boolean)
            .slice(0, 20);
      return {
        id: String(p.id || `pkg_${Date.now()}_${i}`),
        name: String(p.name || "Pack beauté").slice(0, 80),
        description: String(p.description || "").slice(0, 500),
        visitCount: Math.max(1, Number(p.visitCount) || 1),
        priceHint: String(p.priceHint || p.price || "").slice(0, 40),
        serviceIds,
        extras,
        active: p.active !== false,
      };
    });
    salon.markModified("servicePackages");
    await salon.save();
    return res.status(200).json({ status: true, packages: salon.servicePackages });
  } catch (error) {
    console.error("[marketing.updatePackages]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
