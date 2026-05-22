import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ShoppingCart, ShoppingBag, ArrowLeft, Star, StarHalf } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { apiClient } from "../lib/api";
import { useCart } from "../lib/CartContext";
import { formatPrice } from "../lib/admin";
import { useSiteData } from "../lib/siteData";
import EnquiryDialog from "../components/EnquiryDialog";

export default function CategoryPage() {
  const { slug } = useParams();
  const { content, categories, loading: siteLoading } = useSiteData();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const { add } = useCart();

  const category = categories.find(c => c.slug === slug || c.id === slug);

  useEffect(() => {
    let mounted = true;
    if (!category) {
      if (!siteLoading) setLoading(false);
      return;
    }
    
    setLoading(true);
    apiClient.get(`/site/products?category_id=${category.id}`)
      .then(res => {
        if (mounted) setProducts(res.data || []);
      })
      .catch(err => {
        console.error("Failed to load category products", err);
        toast.error("Failed to load products");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
      
    return () => { mounted = false; };
  }, [category, siteLoading]);

  const enquire = (p) => {
    setActive(p);
    setOpen(true);
  };

  const addToCart = (p) => {
    if (p.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    add(p, 1);
    toast.success(`${p.name} added to cart`);
  };

  // Helper to render static stars based on rating logic or just fixed for design if no rating fields exist
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={10} className={i < Math.floor(rating) ? "fill-[#d4a017] text-[#d4a017]" : "fill-gray-200 text-gray-200"} />
    ));
  };

  if (siteLoading || loading) {
    return (
      <div className="bg-[#fdfbf7] min-h-screen">
        <Loader />
        <Navbar />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="bg-[#fdfbf7] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <h1 className="text-3xl text-[#0a331e] font-display mb-4">Category not found</h1>
          <Link to="/" className="text-[#0f4d2e] underline font-semibold">Return Home</Link>
        </main>
        <Footer content={content} />
      </div>
    );
  }

  return (
    <div className="bg-[#fdfbf7] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12 text-center relative">
            <Link to="/" className="absolute left-0 top-1/2 -translate-y-1/2 text-[#6b3e1f] hover:text-[#0f4d2e] transition-colors flex items-center gap-1 text-sm font-semibold">
              <ArrowLeft size={16} /> Home
            </Link>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#6b3e1f]">
              {category.name}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-[#6b3e1f]/10 text-xs font-semibold text-[#6b3e1f] tracking-wider uppercase">
            <div className="flex items-center gap-4">
              <span>Filter:</span>
              <select className="bg-transparent border-none outline-none cursor-pointer">
                <option>Availability</option>
              </select>
              <select className="bg-transparent border-none outline-none cursor-pointer">
                <option>Price</option>
              </select>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <div className="flex items-center gap-2">
                <span>Sort by:</span>
                <select className="bg-transparent border-none outline-none cursor-pointer">
                  <option>Featured</option>
                  <option>Best selling</option>
                </select>
              </div>
              <span className="opacity-60">{products.length} products</span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-[#6b3e1f]">
              <p>No products available in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p, i) => {
                // Mock rating for design completion as rating is not in Product model
                const rating = 4 + (i % 2 === 0 ? 0.5 : 0);
                const reviewsCount = 15 + (i * 12);
                
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#6b3e1f]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_24px_60px_rgb(15,77,46,0.12)] transition-all duration-500"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#fdfbf7] p-4 flex items-center justify-center">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-[#fdfbf7] border border-dashed border-[#6b3e1f]/20 flex items-center justify-center text-[#6b3e1f]/50 text-sm">
                          No Image
                        </div>
                      )}
                      {p.stock <= 0 && (
                        <div className="absolute top-6 left-6 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em]">
                          Sold Out
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        {p.tagline && (
                          <p className="text-[11px] font-bold text-[#6b3e1f] mb-1">{p.tagline}</p>
                        )}
                        <h3 className="font-display text-lg font-semibold text-[#0a331e] mb-2">{p.name}</h3>
                        
                        <div className="flex items-center gap-1 mb-4">
                          {renderStars(rating)}
                          <span className="text-[10px] text-[#6b3e1f] ml-1">({reviewsCount})</span>
                        </div>
                        
                        <div className="mb-4">
                          {p.sale_price && p.sale_price < p.price ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#6b3e1f]">From</span>
                              <span className="font-semibold text-[#0a331e]">{formatPrice(p.sale_price, p.currency)}</span>
                              <span className="text-xs line-through text-[#6b3e1f]/60">{formatPrice(p.price, p.currency)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#6b3e1f]">From</span>
                              <span className="font-semibold text-[#0a331e]">{formatPrice(p.price, p.currency)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => addToCart(p)}
                        disabled={p.stock <= 0}
                        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-[#0f4d2e] bg-[#fdfbf7] border border-[#0f4d2e]/20 hover:bg-[#0f4d2e] hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fdfbf7] disabled:hover:text-[#0f4d2e]"
                      >
                        Choose options
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer content={content} />
      <EnquiryDialog open={open} onOpenChange={setOpen} product={active ? { id: active.id, title: active.name } : null} />
    </div>
  );
}
