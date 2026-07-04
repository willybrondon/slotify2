import axios from "axios";

import { DangerRight } from "./toastServices";
import { getBaseURL, getSecretKey } from "../../util/config";

const getTokenData = () => sessionStorage.getItem("token");

function resolveApiKey() {
  const stored = sessionStorage.getItem("key");
  if (stored && stored !== "undefined" && stored !== "null") return stored;
  return getSecretKey() || "";
}

function resolveApiBase() {
  return getBaseURL();
}

/** Always build an absolute API URL on site root (never under /salonpanel/). */
export function buildApiUrl(path) {
  const raw = String(path || "").trim();
  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/salonpanel\/(salon|admin|user)\//, "/$1/");
  }
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://skedisy.com";
  const base = resolveApiBase().includes("/salonpanel")
    ? `${origin}/`
    : resolveApiBase();
  const normalized = raw.replace(/^\//, "").replace(/^salonpanel\//, "");
  return new URL(normalized, base.endsWith("/") ? base : `${base}/`).href;
}

export const apiInstance = axios.create({
  baseURL: resolveApiBase(),
});

const cancelTokenSource = axios.CancelToken.source();

apiInstance.interceptors.request.use(
  function (config) {
    config.cancelToken = cancelTokenSource.token;
    config.headers.Authorization = getTokenData();
    config.headers.key = resolveApiKey();
    if (config.url) {
      const path = String(config.url)
        .replace(/^\//, "")
        .replace(/^salonpanel\//, "");
      config.url = buildApiUrl(path);
      config.baseURL = "";
    }
    return config;
  },

  function (error) {
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    if (!error?.response?.data?.message) {
      console.log("Error+++++:", error);
      DangerRight("Something went Wrong!");
    }
    if (
      error?.response?.data?.code === "E_USER_NOT_FOUND" ||
      error?.response?.data?.code === "E_UNAUTHORIZED"
    ) {
      sessionStorage.clear();
      window.location.reload(false);
    }

    if (typeof error?.response?.data?.message === "string") {
      DangerRight(error.response.data.message);
    } else {
      for (let i = 0; i < error?.response?.data?.message?.length; i++) {
        DangerRight(error.response.data.message[i]);
      }
      return Promise.reject(error);
    }
  }
);

function isHtmlBody(text) {
  const trimmed = (text || "").trim();
  return trimmed.startsWith("<!") || trimmed.includes("<html");
}

const handleErrors = async (response, requestUrl) => {
  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (e) {
      DangerRight("Invalid server response.");
      return Promise.reject(e);
    }
  } else {
    const text = await response.text();
    const trimmed = text.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        data = JSON.parse(trimmed);
      } catch (e) {
        /* not JSON */
      }
    }
    if (!data && isHtmlBody(trimmed)) {
      console.error("[Salon API] HTML response for:", requestUrl);
      DangerRight(
        "API unreachable (got HTML instead of JSON). Reload the page."
      );
      return Promise.reject({ message: text, wrongPath: true });
    }
    if (!data) {
      if (!response.ok) {
        DangerRight("Server error. Please try again.");
        return Promise.reject({ message: text });
      }
      DangerRight("Unexpected server response.");
      return Promise.reject({ message: text });
    }
  }

  if (!response.ok) {
    if (data?.message instanceof Array) {
      data.message.forEach((msg) => DangerRight(msg));
    } else if (data?.message) {
      DangerRight(data.message);
    } else if (data?.error) {
      DangerRight(data.error);
    } else {
      DangerRight("Unexpected error occurred.");
    }
    return Promise.reject(data);
  }

  if (data?.status === false) {
    DangerRight(data?.message || data?.error || "Request failed.");
    return Promise.reject(data);
  }

  return data;
};

const getHeaders = () => ({
  key: resolveApiKey(),
  Authorization: getTokenData(),
  "Content-Type": "application/json",
});

export const apiInstanceFetch = {
  get baseURL() {
    return resolveApiBase();
  },
  get: (url) => {
    const fullUrl = buildApiUrl(url);
    return fetch(fullUrl, { method: "GET", headers: getHeaders() }).then((res) =>
      handleErrors(res, fullUrl)
    );
  },

  post: (url, data) => {
    const fullUrl = buildApiUrl(url);
    return fetch(fullUrl, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleErrors(res, fullUrl));
  },

  patch: (url, data) => {
    const fullUrl = buildApiUrl(url);
    return fetch(fullUrl, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleErrors(res, fullUrl));
  },

  put: (url, data) => {
    const fullUrl = buildApiUrl(url);
    return fetch(fullUrl, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => handleErrors(res, fullUrl));
  },

  delete: (url) => {
    const fullUrl = buildApiUrl(url);
    return fetch(fullUrl, {
      method: "DELETE",
      headers: getHeaders(),
    }).then((res) => handleErrors(res, fullUrl));
  },
};
