/**
 * Booking lifecycle helpers — Planity-style instant confirm vs optional manual salon approval.
 */

function isAutoConfirmEnabled(setting, salon) {
  const globalAutoConfirm = (setting || global.settingJSON || {}).autoConfirmBookings !== false;
  const salonAutoConfirm = (salon || {}).autoConfirmBookings !== false;
  return globalAutoConfirm && salonAutoConfirm;
}

function resolveInitialBookingStatus(setting, salon) {
  return isAutoConfirmEnabled(setting, salon) ? "confirm" : "pending";
}

/**
 * List filters for client/expert/salon booking tabs.
 * - upcoming / pending (legacy tab): future active bookings (confirm + awaiting approval)
 * - awaiting_approval: only status pending (salon must validate)
 */
function getBookingListStatusFilter(status) {
  const key = String(status || "")
    .trim()
    .toLowerCase();

  switch (key) {
    case "pending":
    case "upcoming":
      return { status: { $in: ["pending", "confirm"] } };
    case "awaiting_approval":
    case "awaitingapproval":
      return { status: "pending" };
    case "all":
    case "ALL":
      return {};
    default:
      return { status: key };
  }
}

function isSalonListTypeValid(type) {
  if (!type || type === "ALL") return true;
  return ["pending", "upcoming", "confirm", "completed", "cancel", "awaiting_approval"].includes(type);
}

function getSalonListStatusFilter(type) {
  const key = String(type || "ALL").trim();
  if (key === "ALL") return {};
  return getBookingListStatusFilter(key);
}

function buildExpertBookingNotification(booking) {
  const date = booking?.date || "";
  const time = booking?.startTime || "";

  if (booking?.status === "confirm") {
    return {
      title: "Nouveau RDV confirmé",
      body: `RDV confirmé le ${date} à ${time}.`,
    };
  }

  return {
    title: "RDV en attente (salon)",
    body: `À valider depuis le panel salon — ${date} à ${time}.`,
  };
}

function buildUserBookingConfirmedNotification(booking) {
  return {
    title: "Réservation confirmée",
    body: `Votre RDV #${booking?.bookingId} est confirmé pour le ${booking?.date} à ${booking?.startTime || ""}.`,
  };
}

module.exports = {
  isAutoConfirmEnabled,
  resolveInitialBookingStatus,
  getBookingListStatusFilter,
  isSalonListTypeValid,
  getSalonListStatusFilter,
  buildExpertBookingNotification,
  buildUserBookingConfirmedNotification,
};
