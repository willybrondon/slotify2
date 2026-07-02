import Swal from "sweetalert2";
import { SKEDISY_SALON_UI as ui } from "../constants/skedisyUiCopy";

export const warning = (confirm) => {
  return Swal.fire({
    title: ui.alert.title,
    text: ui.alert.text,
    iconHtml: '<i className="ri-alert-line"></i>',
    showCancelButton: true,
    confirmButtonText: confirm,
    customClass: {
      confirmButton: "btn bg-second text-light m15-right",
      cancelButton: "btn bg-darkGray text-light",
    },
    buttonsStyling: false,
  });
};

/** Confirmation avec message personnalisé (planning, etc.) */
export const confirmAction = (message, confirmLabel = "Confirmer") => {
  return Swal.fire({
    title: ui.alert.title,
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmLabel,
    cancelButtonText: "Annuler",
    customClass: {
      confirmButton: "btn bg-second text-light m15-right",
      cancelButton: "btn bg-darkGray text-light",
    },
    buttonsStyling: false,
  });
};

export const AcceptWarning = (confirm) => {
  return Swal.fire({
    text: ui.alert.approveWithdraw,
    iconHtml: '<i className="ri-alert-line"></i>',
    showCancelButton: true,
    confirmButtonText: confirm,
    customClass: {
      confirmButton: "btn bg-green text-light",
      cancelButton: "btn bg-darkGray text-light ms-2",
    },
    buttonsStyling: false,
  });
};

