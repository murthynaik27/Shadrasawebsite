import axios from "axios";

const BACKEND_URL = "https://shadrasawebsite.onrender.com";
export const API = `${BACKEND_URL}/api`;

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
