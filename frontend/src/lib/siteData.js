import { useEffect, useState } from "react";
import { apiClient } from "./api";

export function useSiteData() {
  const [content, setContent] = useState({});
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.get("/site/content"),
      apiClient.get("/site/products"),
      apiClient.get("/site/banners"),
      apiClient.get("/site/categories"),
      apiClient.get("/site/gallery"),
      apiClient.get("/site/reviews"),
    ])
      .then(([c, p, b, cat, g, r]) => {
        if (!mounted) return;
        setContent(c.data || {});
        setProducts(p.data || []);
        setBanners(b.data || []);
        setCategories(cat.data || []);
        setGallery(g.data || []);
        setReviews(r.data || []);
      })
      .catch((err) => console.error("site data load failed", err))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { content, products, banners, categories, gallery, reviews, loading };
}

export function buildWhatsappFromNumber(num, msg) {
  const raw = String(num || "917338542117").replace(/\D/g, "");
  return `https://wa.me/${raw}?text=${encodeURIComponent(msg)}`;
}
