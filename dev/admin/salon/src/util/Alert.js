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


