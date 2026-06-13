/** API root — toujours absolu (évite /salonpanel/salon/... en relatif). */
function resolveBaseURL() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/`;
  }
  return "/";
}

export const baseURL = resolveBaseURL();
export const secretKey =
  typeof process !== "undefined" && process.env?.REACT_APP_SECRET_KEY
    ? process.env.REACT_APP_SECRET_KEY
    : "";
export const projectName =
  typeof process !== "undefined" && process.env?.REACT_APP_NAME
    ? process.env.REACT_APP_NAME
    : "Skedisy";
