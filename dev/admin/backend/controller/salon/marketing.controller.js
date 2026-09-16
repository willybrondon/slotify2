const Coupon = require("../../models/coupon.model");
const {
  getOccupancyInsight,
  getRebookDueInsight,
  createTargetedPromo,
} = require("../../services/marketingAutomation.service");
const { launchSalonRebookCampaign, salonPublicSlug } = require("../../services/rebooking.service");
const { getLoyaltyProgram } = require("../../services/loyalty.service");

/**
 * GET /salon/marketing/insights
 */
exports.getInsights = async (req, res) => {
  try {
    const salon = req.salon;
    if (!salon) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const [occupancy, rebook] = await Promise.all([
      getOccupancyInsight(salon),
      getRebookDueInsight(salon._id),
    ]);

    const base = (process.env.baseURL || "https://skedisy.com").replace(/\/+$/, "");
    const slug = salonPublicSlug(salon);
    const publicUrl = `${base}/salon/${slug}`;
    const loyalty = getLoyaltyProgram(salon);

    const recentPromos = await Coupon.find({ salonId: salon._id })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("code title discountPercent expiryDate isActive createdAt")
      .lean();

    const packages = Array.isArray(salon.servicePackages)
      ? salon.servicePackages.filter((p) => p && p.active !== false)
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
        { id: "ai_posts", label: "Posts sociaux assistés (IA)", status: "partial" },
        { id: "site", label: "Site / fiche personnalisée", status: "ready" },
        { id: "promos", label: "Promotions ciblées", status: "ready" },
        { id: "loyalty", label: "Fidélité", status: loyalty.enabled ? "ready" : "config" },
        { id: "rebooking", label: "Campagnes rebooking", status: "ready" },
        { id: "packages", label: "Packages multi-visites", status: packages.length ? "ready" : "config" },
      ],
      recentPromos,
    });
  } catch (error) {
    console.error("[marketing.getInsights]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /salon/marketing/promo
 * body: { discountPercent?, title?, dateHint?, daysValid? }
 */
exports.createPromo = async (req, res) => {
  try {
    const salon = req.salon;
    const discountPercent =
      req.body?.discountPercent ?? req.body?.suggestedDiscount ?? 15;
    const result = await createTargetedPromo(salon, {
      discountPercent,
      title: req.body?.title,
      dateHint: req.body?.dateHint,
      daysValid: req.body?.daysValid,
    });
    return res.status(200).json({ status: true, ...result });
  } catch (error) {
    console.error("[marketing.createPromo]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /salon/marketing/rebook-campaign
 */
exports.launchRebookCampaign = async (req, res) => {
  try {
    const salon = req.salon;
    const result = await launchSalonRebookCampaign(salon._id);
    return res.status(200).json({
      status: true,
      message:
        result.sent > 0
          ? `Campagne envoyée : ${result.sent} SMS`
          : result.scanned === 0
            ? "Aucune cliente à relancer cette semaine"
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
    salon.servicePackages = packages.slice(0, 20).map((p, i) => ({
      id: String(p.id || `pkg_${Date.now()}_${i}`),
      name: String(p.name || "Pack").slice(0, 80),
      description: String(p.description || "").slice(0, 300),
      visitCount: Math.max(1, Number(p.visitCount) || 1),
      priceHint: String(p.priceHint || "").slice(0, 40),
      active: p.active !== false,
    }));
    await salon.save();
    return res.status(200).json({ status: true, packages: salon.servicePackages });
  } catch (error) {
    console.error("[marketing.updatePackages]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
