/** API root — toujours absolu (évite /salonpanel/salon/... en relatif). */
function resolveBaseURL() {
  const runtime = typeof window !== "undefined" ? window.__SKEDISY_SALON__ : null;
  if (runtime?.apiBase) {
    const base = String(runtime.apiBase);
    return base.endsWith("/") ? base : `${base}/`;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/`;
  }
  return "/";
}

function resolveSecretKey() {
  const runtime = typeof window !== "undefined" ? window.__SKEDISY_SALON__ : null;
  if (runtime?.apiKey) return String(runtime.apiKey);
  if (typeof process !== "undefined" && process.env?.REACT_APP_SECRET_KEY) {
    return process.env.REACT_APP_SECRET_KEY;
  }
  return "";
}

export const baseURL = resolveBaseURL();
export const secretKey = resolveSecretKey();
export const projectName =
  typeof process !== "undefined" && process.env?.REACT_APP_NAME
    ? process.env.REACT_APP_NAME
    : "Skedisy";
