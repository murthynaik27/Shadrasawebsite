import { useEffect, useState } from "react";
import { apiClient } from "./api";

export function useSiteData() {
  const [content, setContent] = useState({});
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.get("/site/content"),
      apiClient.get("/site/products"),
      apiClient.get("/site/banners"),
      apiClient.get("/site/categories"),
    ])
      .then(([c, p, b, cat]) => {
        if (!mounted) return;
        setContent(c.data || {});
        setProducts(p.data || []);
        setBanners(b.data || []);
        setCategories(cat.data || []);
      })
      .catch((err) => console.error("site data load failed", err))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { content, products, banners, categories, loading };
}

export function buildWhatsappFromNumber(num, msg) {
  const raw = String(num || "917338542117").replace(/\D/g, "");
  return `https://wa.me/${raw}?text=${encodeURIComponent(msg)}`;
}
