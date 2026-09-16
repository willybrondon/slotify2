const User = require("../../models/user.model");
const Booking = require("../../models/booking.model");
const { syncBeautyProfileFromBooking } = require("../../services/beautyProfile.service");

/**
 * GET /api/public/client/beauty-profile?userId=
 */
exports.publicGetBeautyProfile = async (req, res) => {
  try {
    const userId = (req.query.userId || "").trim();
    if (!userId) {
      return res.status(400).json({ status: false, message: "userId required" });
    }
    const user = await User.findById(userId)
      .select("fname lname beautyProfile")
      .lean();
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    return res.status(200).json({
      status: true,
      beautyProfile: user.beautyProfile || {},
      name: [user.fname, user.lname].filter(Boolean).join(" "),
    });
  } catch (error) {
    console.error("[publicGetBeautyProfile]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * PATCH /api/public/client/beauty-profile
 * body: { userId, beautyProfile: { hairType, hairLength, ... } }
 */
exports.publicUpdateBeautyProfile = async (req, res) => {
  try {
    const userId = (req.body?.userId || "").trim();
    const patch = req.body?.beautyProfile || {};
    if (!userId) {
      return res.status(400).json({ status: false, message: "userId required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    const bp = user.beautyProfile || {};
    [
      "hairType",
      "hairLength",
      "density",
      "sensitivity",
      "preferences",
    ].forEach((k) => {
      if (patch[k] !== undefined) bp[k] = String(patch[k] || "").slice(0, 200);
    });
    bp.updatedAt = new Date();
    user.beautyProfile = bp;
    await user.save();
    return res.status(200).json({ status: true, beautyProfile: bp });
  } catch (error) {
    console.error("[publicUpdateBeautyProfile]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * POST /api/public/client/prep-confirm
 * body: { token } OR { bookingId, userId }
 */
exports.publicConfirmPrep = async (req, res) => {
  try {
    const { bookingId, userId, token } = req.body || {};
    let booking = null;
    if (token) {
      booking = await Booking.findOne({
        prepConfirmToken: String(token).trim(),
        status: { $in: ["pending", "confirm"] },
      });
    } else if (bookingId && userId) {
      booking = await Booking.findOne({
        _id: bookingId,
        userId,
        status: { $in: ["pending", "confirm"] },
      });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "token or bookingId+userId required" });
    }
    if (!booking) {
      return res.status(404).json({ status: false, message: "Booking not found" });
    }
    booking.prepConfirmedAt = new Date();
    await booking.save();
    return res.status(200).json({ status: true, prepConfirmedAt: booking.prepConfirmedAt });
  } catch (error) {
    console.error("[publicConfirmPrep]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * GET /p/:token — one-tap prep confirm from SMS (HTML).
 */
exports.servePrepConfirmPage = async (req, res) => {
  try {
    const token = String(req.params.token || "").trim();
    if (!token) {
      return res.status(400).type("html").send("<p>Lien invalide.</p>");
    }
    const booking = await Booking.findOne({
      prepConfirmToken: token,
      status: { $in: ["pending", "confirm"] },
    });
    if (!booking) {
      return res
        .status(404)
        .type("html")
        .send(
          `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prep</title></head><body style="font-family:system-ui;padding:2rem;text-align:center"><h1>Lien expiré</h1><p>Ce lien de confirmation n’est plus valide.</p></body></html>`
        );
    }
    if (!booking.prepConfirmedAt) {
      booking.prepConfirmedAt = new Date();
      await booking.save();
    }
    return res.type("html").send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Préparation confirmée — Skedisy</title>
  <style>
    body{font-family:DM Sans,system-ui,sans-serif;background:#f7f3ef;color:#111;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border-radius:16px;padding:28px 24px;max-width:420px;box-shadow:0 8px 30px rgba(0,0,0,.08);text-align:center}
    h1{font-size:1.35rem;margin:0 0 8px}
    p{color:#555;line-height:1.45;margin:0 0 16px}
    .ok{display:inline-flex;width:56px;height:56px;border-radius:50%;background:#e8f7ee;color:#1b7a3d;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px}
  </style>
</head>
<body>
  <div class="card">
    <div class="ok" aria-hidden="true">✓</div>
    <h1>Préparation confirmée</h1>
    <p>Merci ! Le salon a bien reçu votre confirmation pour le RDV de demain.</p>
    <p style="font-size:13px;color:#888">Vous pouvez fermer cette page.</p>
  </div>
</body>
</html>`);
  } catch (error) {
    console.error("[servePrepConfirmPage]", error);
    return res.status(500).type("html").send("<p>Erreur serveur.</p>");
  }
};

/**
 * POST /salon/booking/result-photos
 * body (JSON or multipart): bookingId, resultPhotoUrls[], resultPhotoNote?,
 * actualDurationMinutes?, actualPrice?, actualVarianceNote?, photos[] files
 */
exports.salonAttachResultPhotos = async (req, res) => {
  try {
    const salon = req.salon;
    const bookingId = req.body?.bookingId;
    if (!bookingId) {
      return res.status(400).json({ status: false, message: "bookingId required" });
    }
    const booking = await Booking.findOne({ _id: bookingId, salonId: salon._id });
    if (!booking) {
      return res.status(404).json({ status: false, message: "Booking not found" });
    }

    const fileList = req.files?.photos || req.files?.resultPhotos || [];
    const uploaded = [];
    if (Array.isArray(fileList) && fileList.length) {
      const base = (process.env.baseURL || "").replace(/\/+$/, "");
      fileList.slice(0, 6).forEach((f) => {
        if (f?.path) {
          uploaded.push(`${base}/${String(f.path).replace(/\\/g, "/")}`);
        }
      });
    }

    let urls = [];
    if (Array.isArray(req.body.resultPhotoUrls)) {
      urls = req.body.resultPhotoUrls;
    } else if (typeof req.body.resultPhotoUrls === "string" && req.body.resultPhotoUrls.trim()) {
      try {
        const parsed = JSON.parse(req.body.resultPhotoUrls);
        urls = Array.isArray(parsed) ? parsed : [req.body.resultPhotoUrls];
      } catch (e) {
        urls = req.body.resultPhotoUrls
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    const merged = [...(booking.resultPhotoUrls || []), ...urls, ...uploaded]
      .map((u) => String(u || "").trim())
      .filter(Boolean)
      .slice(0, 6);
    if (merged.length) booking.resultPhotoUrls = merged;

    if (req.body.resultPhotoNote) {
      booking.resultPhotoNote = String(req.body.resultPhotoNote).slice(0, 400);
    }
    if (Number(req.body.actualDurationMinutes) > 0) {
      booking.actualDurationMinutes = Number(req.body.actualDurationMinutes);
    }
    if (req.body.actualPrice != null && req.body.actualPrice !== "") {
      booking.actualPrice = Number(req.body.actualPrice);
    }
    if (req.body.actualVarianceNote) {
      booking.actualVarianceNote = String(req.body.actualVarianceNote).slice(0, 300);
    }
    await booking.save();
    if (booking.status === "completed") {
      try {
        await syncBeautyProfileFromBooking(booking);
      } catch (e) {
        console.warn("[result photos] beauty sync", e.message);
      }
    }
    return res.status(200).json({ status: true, booking });
  } catch (error) {
    console.error("[salonAttachResultPhotos]", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
