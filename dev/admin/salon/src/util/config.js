/** API root — always site origin (never under /salonpanel/). */
export function getBaseURL() {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://skedisy.com";

  const runtime =
    typeof window !== "undefined" ? window.__SKEDISY_SALON__ : null;
  if (runtime?.apiBase) {
    let base = String(runtime.apiBase).trim();
    // Strip any /salonpanel path accidentally baked into apiBase
    if (base.includes("/salonpanel") || base.includes("/salonPanel")) {
      return `${origin}/`;
    }
    try {
      const u = new URL(base, origin);
      // Force same-origin API root (path ignored → always "/")
      if (u.origin === origin || !base) {
        return `${origin}/`;
      }
      return u.origin.endsWith("/") ? u.origin : `${u.origin}/`;
    } catch (e) {
      return `${origin}/`;
    }
  }
  return `${origin}/`;
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
