import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { apiClient } from "./api";

const SiteDataContext = createContext();

export function SiteDataProvider({ children }) {
  const [content, setContent] = useState({});
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeArray = (value) => (Array.isArray(value) ? value : []);
  const normalizeObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});

  const fetchAll = useCallback(async () => {
    try {
      const [c, p, b, cat, g, r] = await Promise.all([
        apiClient.get("/site/content"),
        apiClient.get("/site/products"),
        apiClient.get("/site/banners"),
        apiClient.get("/site/categories"),
        apiClient.get("/site/gallery"),
        apiClient.get("/site/reviews"),
      ]);
      setContent(normalizeObject(c.data));
      setProducts(normalizeArray(p.data));
      setBanners(normalizeArray(b.data));
      setCategories(normalizeArray(cat.data));
      setGallery(normalizeArray(g.data));
      setReviews(normalizeArray(r.data));
    } catch (err) {
      console.error("site data load failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <SiteDataContext.Provider value={{ content, products, banners, categories, gallery, reviews, loading, refreshSiteData: fetchAll }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error("useSiteData must be used within a SiteDataProvider");
  }
  return context;
}

export function buildWhatsappFromNumber(num, msg) {
  const raw = String(num || "917338542117").replace(/\D/g, "");
  return `https://wa.me/${raw}?text=${encodeURIComponent(msg)}`;
}
