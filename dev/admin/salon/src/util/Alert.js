import Swal from "sweetalert2";
import { SKEDISY_SALON_UI as ui } from "../constants/skedisyUiCopy";

const SQ_SWAL_BASE = {
  buttonsStyling: false,
  customClass: {
    popup: "sq-swal-popup",
    title: "sq-swal-title",
    htmlContainer: "sq-swal-body",
    actions: "sq-swal-actions",
    confirmButton: "btn sq-swal-btn sq-swal-btn--primary",
    cancelButton: "btn sq-swal-btn sq-swal-btn--ghost",
  },
};

export const warning = (confirm) => {
  return Swal.fire({
    ...SQ_SWAL_BASE,
    title: ui.alert.title,
    text: ui.alert.text,
    iconHtml: '<i class="ri-error-warning-line sq-swal-icon"></i>',
    showCancelButton: true,
    cancelButtonText: "Annuler",
    confirmButtonText: confirm,
  });
};

/** Confirmation déconnexion — salon panel */
export const confirmLogout = () => {
  return Swal.fire({
    ...SQ_SWAL_BASE,
    title: ui.alert.logoutTitle,
    text: ui.alert.logoutText,
    iconHtml: '<i class="ri-logout-box-r-line sq-swal-icon sq-swal-icon--logout"></i>',
    showCancelButton: true,
    reverseButtons: true,
    focusCancel: true,
    confirmButtonText: ui.alert.logoutConfirm,
    cancelButtonText: ui.alert.logoutCancel,
    customClass: {
      ...SQ_SWAL_BASE.customClass,
      popup: "sq-swal-popup sq-swal-popup--logout",
      confirmButton: "btn sq-swal-btn sq-swal-btn--danger",
    },
  });
};

/** Confirmation avec message personnalisé (planning, etc.) */
export const confirmAction = (message, confirmLabel = "Confirmer") => {
  return Swal.fire({
    ...SQ_SWAL_BASE,
    title: ui.alert.title,
    text: message,
    icon: "question",
    showCancelButton: true,
    cancelButtonText: "Annuler",
    confirmButtonText: confirmLabel,
  });
};

export const AcceptWarning = (confirm) => {
  return Swal.fire({
    ...SQ_SWAL_BASE,
    text: ui.alert.approveWithdraw,
    iconHtml: '<i class="ri-checkbox-circle-line sq-swal-icon sq-swal-icon--success"></i>',
    showCancelButton: true,
    cancelButtonText: "Annuler",
    confirmButtonText: confirm,
    customClass: {
      ...SQ_SWAL_BASE.customClass,
      confirmButton: "btn sq-swal-btn sq-swal-btn--success",
    },
  });
};
