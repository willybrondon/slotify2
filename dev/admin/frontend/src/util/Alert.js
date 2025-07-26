import Swal from "sweetalert2";
import { DangerRight } from "../component/api/toastServices";

export const warning = (confirm) => {
  return Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
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
export const AcceptWarning = (confirm) => {
  return Swal.fire({
    // title: "Are you sure?",
    text: "Would you like to approve the withdrawal request?",
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
export const AcceptProductWarning = (confirm) => {
  return Swal.fire({
    // title: "Are you sure?",
    text: "Would you like to approve the product request?",
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
export const RejectWarning = (confirm) => {
  return Swal.fire({
    // title: "Are you sure?",
    text: "Would you like to reject the withdrawal request?",
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
export const RejectProductWarning = (confirm) => {
  return Swal.fire({
    // title: "Are you sure?",
    text: "Would you like to reject the withdrawal request?",
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

