import axios from "axios";

import { DangerRight } from "./toastServices";
import { baseURL, secretKey } from "../../util/config";

const getTokenData = () => sessionStorage.getItem("token");

function resolveApiKey() {
  const stored = sessionStorage.getItem("key");
  if (stored && stored !== "undefined") return stored;
  return secretKey || "";
}

function resolveApiBase() {
  if (baseURL && baseURL !== "/") return baseURL;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/`;
  }
  return "/";
}

export const apiInstance = axios.create({
  baseURL: resolveApiBase(),
});

const cancelTokenSource = axios.CancelToken.source();
const token = sessionStorage.getItem("token");

apiInstance.defaults.headers.common["Authorization"] = token;
apiInstance.defaults.headers.common["key"] = secretKey;

apiInstance.interceptors.request.use(
  function (config) {
    config.cancelToken = cancelTokenSource.token;
    config.headers.Authorization = getTokenData();
    config.headers.key = resolveApiKey();
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

const handleErrors = async (response) => {
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
    if (!data) {
      const isHtml = trimmed.startsWith("<!") || trimmed.includes("<html");
      if (!response.ok) {
        DangerRight(
          isHtml
            ? "API unreachable (got HTML instead of JSON). Reload the page."
            : "Server error. Please try again."
        );
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
  baseURL: resolveApiBase(),
  get: (url) =>
    fetch(`${resolveApiBase()}${url}`, { method: "GET", headers: getHeaders() }).then(
      handleErrors
    ),

  post: (url, data) =>
    fetch(`${resolveApiBase()}${url}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleErrors),

  patch: (url, data) =>
    fetch(`${resolveApiBase()}${url}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleErrors),

  put: (url, data) =>
    fetch(`${resolveApiBase()}${url}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleErrors),

  delete: (url) =>
    fetch(`${resolveApiBase()}${url}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleErrors),
};