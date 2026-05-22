import axios from "axios";

const isBrowser = typeof window !== "undefined";
const inferredBackendUrl = isBrowser
  ? (() => {
      const { protocol, hostname } = window.location;
      const localHostMatch = /^(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1]))/.test(hostname);
      if (localHostMatch) {
        return `${protocol}//${hostname}:8000`;
      }
      return null;
    })()
  : null;

export const BACKEND_URL = process.env.REACT_APP_API_URL || inferredBackendUrl || "";

// Also strip trailing slash if present
const cleanBackendUrl = BACKEND_URL.replace(/\/$/, "");

export const API = `${cleanBackendUrl}/api`;

export const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${cleanBackendUrl}${url}`;
  return url;
};

export const apiClient = axios.create({
  baseURL: API,
  withCredentials: true,
});

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_shadrasa-preview/artifacts/8sr0eib8_LogoFinal.png";

export const WHATSAPP_NUMBER = "917338542117";
export const PHONE = "+91 7338542117";
export const EMAIL = "shadrasa.india@gmail.com";

export const buildWhatsappLink = (msg) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
