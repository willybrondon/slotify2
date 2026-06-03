import { SKEDISY_SALON_UI as ui } from "./skedisyUiCopy";

const EXACT = {
  "Something went Wrong!": () => ui.apiMessages.genericError,
  "Something went wrong!": () => ui.apiMessages.genericError,
  "Unexpected error occurred.": () => ui.apiMessages.unexpectedError,
  "Invalid credentials": () => ui.apiMessages.invalidCredentials,
  "Invalid email or password": () => ui.apiMessages.invalidCredentials,
  "Unauthorized": () => ui.apiMessages.unauthorized,
  "User not found": () => ui.apiMessages.userNotFound,
  "Salon not found": () => ui.apiMessages.salonNotFound,
  "Expert not found": () => ui.apiMessages.expertNotFound,
  "Booking not found": () => ui.apiMessages.bookingNotFound,
  "Insufficient balance": () => ui.apiMessages.insufficientBalance,
  "Withdrawal request submitted successfully": () => ui.apiMessages.withdrawSubmitted,
  "Withdrawal request submitted": () => ui.apiMessages.withdrawSubmitted,
  "Successfully": () => ui.apiMessages.successGeneric,
  "Success": () => ui.apiMessages.successGeneric,
  "Login Successfully": () => ui.toast.loginOk,
  "Admin Create Successfully": () => ui.toast.adminCreated,
  "Code Update Successfully": () => ui.toast.codeUpdated,
  "Admin Updated Successfully": () => ui.toast.adminUpdated,
};

function normalizeKey(s) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function translateApiMessage(msg) {
  if (msg == null || msg === "") return ui.apiMessages.genericError;
  if (typeof msg !== "string") return msg;
  const trimmed = msg.trim();
  if (EXACT[trimmed]) return EXACT[trimmed]();
  const lower = trimmed.toLowerCase();
  for (const [key, fn] of Object.entries(EXACT)) {
    if (key.toLowerCase() === lower) return fn();
  }
  if (/not found/i.test(trimmed)) return ui.apiMessages.notFoundGeneric;
  if (/unauthorized|not authorized/i.test(trimmed)) return ui.apiMessages.unauthorized;
  if (/required/i.test(trimmed)) return ui.apiMessages.requiredGeneric;
  if (/invalid/i.test(trimmed)) return ui.apiMessages.invalidGeneric;
  if (/success/i.test(trimmed) && trimmed.length < 80) return ui.apiMessages.successGeneric;
  return trimmed;
}

export function translatePaymentDetail(detail) {
  if (!detail || typeof detail !== "string") return detail;
  const key = normalizeKey(detail);
  return ui.paymentFields[key] || detail;
}

export function translatePaymentMethod(name) {
  if (!name || typeof name !== "string") return name;
  const key = normalizeKey(name);
  return ui.paymentMethods[key] || name;
}
