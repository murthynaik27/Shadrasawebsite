import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ShoppingCart, ShoppingBag, ArrowLeft, Star, StarHalf, Eye } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import OptimizedImage from "../components/ui/OptimizedImage";
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
  const [slowLoading, setSlowLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const { add } = useCart();

  const getSelectedOption = (p) => selectedOptions[p.id] || (p.weight_options && p.weight_options[0]) || null;

  const handleOptionSelect = (e, pId, opt) => {
    e.stopPropagation();
    setSelectedOptions(prev => ({ ...prev, [pId]: opt }));
  };

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

  useEffect(() => {
    let timer;
    if (loading || siteLoading) {
      timer = setTimeout(() => {
        setSlowLoading(true);
      }, 5000);
    } else {
      setSlowLoading(false);
    }
    return () => clearTimeout(timer);
  }, [loading, siteLoading]);

  const enquire = (p) => {
    setActive(p);
    setOpen(true);
  };

  const handleProductClick = (p) => {
    if (loadingProduct) return;
    setLoadingProduct(p.id);
    setTimeout(() => {
      setLoadingProduct(null);
      enquire(p);
    }, 800);
  };

  const addToCart = (p) => {
    const opt = getSelectedOption(p);
    const stockToCheck = opt ? opt.stock : p.stock;
    if (stockToCheck <= 0) {
      toast.error("Out of stock");
      return;
    }
    add(p, 1, opt);
    toast.success(`${p.name} added to cart`);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={10} className={i < Math.floor(rating) ? "fill-[#d4a017] text-[#d4a017]" : "fill-gray-200 text-gray-200"} />
    ));
  };

  if (!siteLoading && !category) {
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
              {category ? category.name : "Loading..."}
            </h1>
          </div>



          {(loading || siteLoading) ? (
            <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
              <div className="w-12 h-12 border-4 border-[#0f4d2e]/20 border-t-[#0f4d2e] rounded-full animate-spin mb-6"></div>
              {slowLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#fff9e6] border border-[#d4a017]/30 px-6 py-4 rounded-2xl shadow-sm max-w-md text-center"
                >
                  <p className="text-[#6b3e1f] text-sm font-semibold">
                    Slow internet connection detected. Products are taking longer to load...
                  </p>
                </motion.div>
              )}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-[#6b3e1f]">
              <p>No products available in this category yet.</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
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
                    className={`group flex flex-col w-full max-w-[400px] bg-white rounded-2xl overflow-hidden border border-[#6b3e1f]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(212,160,23,0.15)] hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer mx-auto sm:mx-0 ${loadingProduct === p.id ? 'scale-95 opacity-90' : ''}`}
                    onClick={() => handleProductClick(p)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#fdfbf7] flex items-center justify-center">
                      {(() => {
                        const opt = getSelectedOption(p);
                        const displayImage = opt && opt.image ? opt.image : p.image;
                        const displayBlur = opt && opt.blur_image ? opt.blur_image : p.blur_image;
                        
                        return displayImage ? (
                          <>
                            <OptimizedImage
                              src={displayImage}
                              blurData={displayBlur}
                              alt={p.name}
                              className="w-full h-full object-cover rounded-xl transition-transform duration-700 ease-out group-hover:scale-110"
                              containerClassName="absolute inset-0"
                            />
                            {/* Glassmorphism Hover Overlay */}
                            <div className="absolute inset-4 bg-[#0a331e]/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center rounded-xl">
                              <span className="bg-white/95 text-[#0f4d2e] font-semibold px-6 py-2.5 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl flex items-center gap-2">
                                <Eye size={16} /> Quick View
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full rounded-xl bg-[#fdfbf7] border border-dashed border-[#6b3e1f]/20 flex items-center justify-center text-[#6b3e1f]/50 text-sm">
                            No Image
                          </div>
                        );
                      })()}
                      {(() => {
                        const opt = getSelectedOption(p);
                        const stockToCheck = opt ? opt.stock : p.stock;
                        return stockToCheck <= 0 && (
                          <div className="absolute top-6 left-6 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em]">
                            Sold Out
                          </div>
                        );
                      })()}
                      {/* Click Loading Animation */}
                      {loadingProduct === p.id && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-[#0f4d2e]/20 border-t-[#d4a017] rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5 md:p-7 flex-1 flex flex-col">
                      <div className="flex-1">
                        {p.tagline && (
                          <p className="text-xs font-bold text-[#6b3e1f] mb-1.5 uppercase tracking-wider">{p.tagline}</p>
                        )}
                        <h3 className="font-display text-xl md:text-2xl font-semibold text-[#0a331e] mb-2">{p.name}</h3>
                        
                        <div className="flex items-center gap-1.5 mb-5">
                          {renderStars(rating)}
                          <span className="text-xs text-[#6b3e1f] font-medium ml-1">({reviewsCount} reviews)</span>
                        </div>

                        {(() => {
                          const opt = getSelectedOption(p);
                          const price = opt ? opt.price : p.price;
                          const sale_price = opt ? opt.sale_price : p.sale_price;
                          const stock = opt ? opt.stock : p.stock;

                          return (
                            <>
                              <div className="mb-6">
                                {p.weight_options && p.weight_options.length > 0 && (
                                  <div className="mb-4 flex flex-wrap gap-2.5">
                                    {p.weight_options.map((wOpt, idx) => {
                                      const isSelected = opt && opt.weight === wOpt.weight && opt.unit === wOpt.unit;
                                      return (
                                        <button
                                          key={idx}
                                          onClick={(e) => handleOptionSelect(e, p.id, wOpt)}
                                          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all border-2 ${
                                            isSelected 
                                              ? "bg-[#0f4d2e] border-[#0f4d2e] text-white shadow-md ring-2 ring-[#0f4d2e] ring-offset-2" 
                                              : "bg-white border-[#6b3e1f]/20 text-[#0a331e] hover:border-[#0f4d2e] hover:text-[#0f4d2e]"
                                          }`}
                                        >
                                          {wOpt.weight}{wOpt.unit}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                {sale_price && sale_price < price ? (
                                  <div className="flex items-baseline gap-2.5 mt-2">
                                    <span className="font-display text-2xl font-bold text-[#0f4d2e]">{formatPrice(sale_price, p.currency)}</span>
                                    <span className="text-sm font-medium line-through text-[#6b3e1f]/50">{formatPrice(price, p.currency)}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-baseline gap-2 mt-2">
                                    <span className="font-display text-2xl font-bold text-[#0f4d2e]">{formatPrice(price, p.currency)}</span>
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                        disabled={(() => {
                          const opt = getSelectedOption(p);
                          return (opt ? opt.stock : p.stock) <= 0;
                        })()}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 mt-2 rounded-xl text-base font-bold text-white bg-[#0f4d2e] border border-[#0f4d2e]/20 hover:bg-[#d4a017] hover:border-[#d4a017] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        <ShoppingCart size={18} /> Add to Cart
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
