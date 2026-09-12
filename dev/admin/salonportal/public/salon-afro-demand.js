/**
 * Legacy shim — le tunnel « devis » est fusionné dans salon-booking.js.
 * ?flow=devis ouvre la réservation classique (qualif inline si service projet).
 */
(function () {
  if (/[?&]flow=devis(?:&|$)/.test(location.search)) {
    setTimeout(() => {
      if (window.SalonBooking && typeof window.SalonBooking.open === "function") {
        window.SalonBooking.open();
      }
    }, 450);
  }
})();
