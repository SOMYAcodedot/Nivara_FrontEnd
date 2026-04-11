import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

/**
 * Refreshes access token using refresh_token from localStorage.
 * @returns {Promise<string|null>} New access token or null.
 */
export async function tryRefreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
      refresh,
    });
    if (data?.access) {
      localStorage.setItem("access_token", data.access);
      return data.access;
    }
  } catch {
    // Caller surfaces auth UX
  }
  return null;
}

export function friendlyApiError(err, fallbackMessage) {
  const status = err.response?.status;
  if (status === 401) {
    return "Please log in again to continue.";
  }
  if (status >= 500) {
    return "Our servers are having trouble. Please try again in a few minutes.";
  }
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  return fallbackMessage;
}
