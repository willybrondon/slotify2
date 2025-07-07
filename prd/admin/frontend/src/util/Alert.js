import Swal from "sweetalert2";
import { DangerRight } from "../component/api/toastServices";

export const warning = (confirm) => {
  return Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    iconHtml: '<i class="ri-alert-line"></i>',
    showCancelButton: true,
    confirmButtonText: confirm,
    customClass: {
      confirmButton: "btn bg-second text-light m15-right",
      cancelButton: "btn bg-darkGray text-light",
    },
    buttonsStyling: false,
  });
};

