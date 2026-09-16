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
 * body: { bookingId, userId }
 */
exports.publicConfirmPrep = async (req, res) => {
  try {
    const { bookingId, userId } = req.body || {};
    if (!bookingId || !userId) {
      return res.status(400).json({ status: false, message: "bookingId and userId required" });
    }
    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      status: { $in: ["pending", "confirm"] },
    });
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
 * POST /salon/booking/result-photos
 * body: { bookingId, resultPhotoUrls[], resultPhotoNote?, actualDurationMinutes?, actualPrice?, actualVarianceNote? }
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
    if (Array.isArray(req.body.resultPhotoUrls)) {
      booking.resultPhotoUrls = req.body.resultPhotoUrls.slice(0, 6);
    }
    if (req.body.resultPhotoNote) {
      booking.resultPhotoNote = String(req.body.resultPhotoNote).slice(0, 400);
    }
    if (Number(req.body.actualDurationMinutes) > 0) {
      booking.actualDurationMinutes = Number(req.body.actualDurationMinutes);
    }
    if (req.body.actualPrice != null) {
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
