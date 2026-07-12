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

function buildExpertBookingNotification(booking, clientBookingCount) {
  const date = booking?.date || "";
  const time = booking?.startTime || "";
  const countSuffix =
    clientBookingCount != null && Number(clientBookingCount) > 0
      ? ` — ${clientBookingCount} réservation${Number(clientBookingCount) > 1 ? "s" : ""} au total pour ce client`
      : "";

  if (booking?.status === "confirm") {
    return {
      title: "Nouveau RDV confirmé",
      body: `RDV confirmé le ${date} à ${time}${countSuffix}.`,
    };
  }

  return {
    title: "RDV en attente (salon)",
    body: `À valider depuis le panel salon — ${date} à ${time}${countSuffix}.`,
  };
}

function buildUserBookingConfirmedNotification(booking) {
  return {
    title: "Réservation confirmée",
    body: `Votre RDV #${booking?.bookingId} est confirmé pour le ${booking?.date} à ${booking?.startTime || ""}.`,
  };
}

function buildUserBookingPendingNotification(booking) {
  return {
    title: "Demande de réservation enregistrée",
    body: `Votre demande #${booking?.bookingId} pour le ${booking?.date} à ${booking?.startTime || ""} est en attente de validation.`,
  };
}

function buildUserBookingCancelledNotification(booking, cancelledBy = "le salon") {
  return {
    title: "Réservation annulée",
    body: `Votre RDV #${booking?.bookingId} du ${booking?.date} a été annulé par ${cancelledBy}.`,
  };
}

function buildUserBookingCompletedNotification(booking) {
  return {
    title: "Rendez-vous terminé",
    body: `Votre RDV #${booking?.bookingId} est terminé. Merci pour votre visite !`,
  };
}

function buildExpertBookingCancelledByUserNotification(booking, user) {
  const clientName = [user?.fname, user?.lname].filter(Boolean).join(" ").trim() || "le client";
  return {
    title: "Réservation annulée",
    body: `RDV #${booking?.bookingId} annulé par ${clientName}.`,
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
  buildUserBookingPendingNotification,
  buildUserBookingCancelledNotification,
  buildUserBookingCompletedNotification,
  buildExpertBookingCancelledByUserNotification,
};
