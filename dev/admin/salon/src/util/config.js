/** API root — always absolute (never /salonpanel/salon/...). */
export function getBaseURL() {
  const runtime =
    typeof window !== "undefined" ? window.__SKEDISY_SALON__ : null;
  if (runtime?.apiBase) {
    let base = String(runtime.apiBase);
    if (base.includes("/salonpanel")) {
      const origin =
        typeof window !== "undefined" && window.location?.origin
          ? window.location.origin
          : "https://skedisy.com";
      base = `${origin}/`;
    }
    return base.endsWith("/") ? base : `${base}/`;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/`;
  }
  return "/";
}

export function getSecretKey() {
  const runtime =
    typeof window !== "undefined" ? window.__SKEDISY_SALON__ : null;
  if (runtime?.apiKey) return String(runtime.apiKey);
  if (typeof process !== "undefined" && process.env?.REACT_APP_SECRET_KEY) {
    return process.env.REACT_APP_SECRET_KEY;
  }
  return "";
}

/** @deprecated Use getBaseURL() — evaluated once at import, may be stale */
export const baseURL = getBaseURL();
/** @deprecated Use getSecretKey() */
export const secretKey = getSecretKey();

export const projectName =
  typeof process !== "undefined" && process.env?.REACT_APP_NAME
    ? process.env.REACT_APP_NAME
    : "Skedisy";
