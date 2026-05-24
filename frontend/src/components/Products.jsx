import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Award, ArrowRight, ShoppingBag, ShoppingCart, Eye, MessageSquare } from "lucide-react";
import EnquiryDialog from "./EnquiryDialog";
import ProductRating from "./ProductRating";
import ProductReviewsModal from "./ProductReviewsModal";
import { formatPrice } from "../lib/admin";
import { useCart } from "../lib/CartContext";
import OptimizedImage from "./ui/OptimizedImage";

export default function Products({ products = [] }) {
  const [open, setOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const { add } = useCart();

  const getSelectedOption = (p) => selectedOptions[p.id] || (p.weight_options && p.weight_options[0]) || null;

  const handleOptionSelect = (e, pId, opt) => {
    e.stopPropagation();
    setSelectedOptions(prev => ({ ...prev, [pId]: opt }));
  };

  const enquire = (p) => {
    setActive(p);
    setOpen(true);
  };

  const openReviews = (p) => {
    setActive(p);
    setReviewsOpen(true);
  };

  const handleProductClick = (p) => {
    if (loadingProduct) return;
    setLoadingProduct(p.id);
    setTimeout(() => {
      setLoadingProduct(null);
      enquire(p);
    }, 800);
  };

  const handleEnquireClick = (e, p) => {
    e.stopPropagation();
    enquire(p);
  };

  const addToCart = (e, p) => {
    e.stopPropagation();
    const opt = getSelectedOption(p);
    const stockToCheck = opt ? opt.stock : p.stock;
    if (stockToCheck <= 0) {
      toast.error("Out of stock");
      return;
    }
    const added = add(p, 1, opt);
    if (added) {
      toast.success(`${p.name} added to cart`);
    }
  };

  return (
    <section id="products" data-testid="products-section" className="pt-24 md:pt-32 pb-12 md:pb-16 bg-[#fdfbf7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="divider-ornament mb-4">Our Signature Range</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[#0a331e] tracking-tight">
            Premium <span className="italic text-[#0f4d2e]">Products</span>
          </h2>
        </motion.div>

        {products.length === 0 ? (
          <p className="text-center text-[#6b3e1f]">Products coming soon.</p>
        ) : (
          <div className={`grid grid-cols-2 ${products.length === 1 ? "lg:grid-cols-2 max-w-4xl mx-auto" : products.length === 2 ? "lg:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-3 lg:grid-cols-4"} gap-3 md:gap-6 lg:gap-8`}>
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                data-testid={`product-card-${p.id}`}
                className={`group flex flex-col w-full bg-white rounded-xl md:rounded-3xl overflow-hidden border border-[#6b3e1f]/10 shadow-[0_4px_20px_rgb(0,0,0,0.04)] md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(212,160,23,0.15)] hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer ${loadingProduct === p.id ? 'scale-95 opacity-90' : ''}`}
                onClick={() => handleProductClick(p)}
              >
                <div className="relative aspect-square md:aspect-[4/5] overflow-hidden bg-[#fdfbf7] flex items-center justify-center">
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
                          className="w-full h-full object-contain rounded-xl transition-transform duration-700 ease-out group-hover:scale-110"
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
                  {/* Click Loading Animation */}
                  {loadingProduct === p.id && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-[#0f4d2e]/20 border-t-[#d4a017] rounded-full animate-spin"></div>
                    </div>
                  )}
                  {p.premium_badge && (
                    <div className="absolute top-5 left-5 flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#0f4d2e] z-10">
                      <Award size={14} /> {p.premium_badge}
                    </div>
                  )}
                  {(() => {
                    const opt = getSelectedOption(p);
                    const stockToCheck = opt ? opt.stock : p.stock;
                    return stockToCheck <= 0 && (
                      <div className="absolute top-6 left-6 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] z-10">
                        Sold Out
                      </div>
                    );
                  })()}
                </div>
                <div className="p-3 md:p-6 lg:p-8 flex-1 flex flex-col relative z-20">
                  {p.tagline && (
                    <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-[#6b3e1f] mb-1.5 md:mb-3 line-clamp-1">{p.tagline}</p>
                  )}
                  <h3 className="font-display text-sm md:text-2xl lg:text-3xl font-semibold text-[#0a331e] mb-2 md:mb-3 line-clamp-2 leading-snug">{p.name}</h3>
                  {p.category_name && (
                    <span className="inline-block self-start text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-[#0f4d2e] bg-[#0f4d2e]/8 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full mb-2 font-semibold">
                      {p.category_name}
                    </span>
                  )}
                  
                  <div className="mb-2 md:mb-4">
                    <ProductRating productId={p.id} onClick={() => openReviews(p)} />
                  </div>

                  <p className="text-[#4a453f] leading-relaxed mb-3 md:mb-5 flex-1 hidden sm:block">{p.description}</p>
                  
                  {(() => {
                    const opt = getSelectedOption(p);
                    const price = opt ? opt.price : p.price;
                    const sale_price = opt ? opt.sale_price : p.sale_price;
                    const stock = opt ? opt.stock : p.stock;
                    const weight = opt ? opt.weight : p.weight;
                    const unit = opt ? opt.unit : p.unit;

                    return (
                      <>
                        {p.weight_options && p.weight_options.length > 0 && (
                          <div className="mb-2 md:mb-5 flex flex-wrap gap-1 md:gap-2">
                            {p.weight_options.map((wOpt, idx) => {
                              const isSelected = opt && opt.weight === wOpt.weight && opt.unit === wOpt.unit;
                              return (
                                <button
                                  key={idx}
                                  onClick={(e) => handleOptionSelect(e, p.id, wOpt)}
                                  className={`px-2 py-1 md:px-4 md:py-1.5 rounded-md md:rounded-full text-[10px] md:text-xs font-semibold transition-all border ${
                                    isSelected 
                                      ? "bg-[#0f4d2e] border-[#0f4d2e] text-white shadow-sm md:shadow-md" 
                                      : "bg-white border-[#6b3e1f]/20 text-[#0a331e] hover:border-[#0f4d2e] hover:text-[#0f4d2e]"
                                  }`}
                                >
                                  {wOpt.weight}{wOpt.unit}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 sm:gap-4 mb-3 md:mb-6">
                          <div>
                            {sale_price && sale_price < price ? (
                              <>
                                <span className="font-display text-base md:text-2xl font-semibold text-[#0a331e]">{formatPrice(sale_price, p.currency)}</span>
                                <span className="ml-1 md:ml-2 text-[10px] md:text-sm line-through text-[#6b3e1f]/60">{formatPrice(price, p.currency)}</span>
                              </>
                            ) : (
                              <span className="font-display text-base md:text-2xl font-semibold text-[#0a331e]">{formatPrice(price, p.currency)}</span>
                            )}
                            {weight && unit && !p.weight_options && (
                              <span className="text-[10px] md:text-sm font-semibold text-[#6b3e1f] ml-1">/ {weight}{unit}</span>
                            )}
                          </div>
                          {stock > 0 && (
                            <span className="text-[9px] md:text-xs text-[#0f4d2e] font-semibold flex items-center gap-1 hidden sm:flex">
                              <ShoppingBag size={13} /> In Stock
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2 relative z-30">
                          <button
                            onClick={(e) => addToCart(e, p)}
                            disabled={stock <= 0}
                            data-testid={`add-cart-btn-${p.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-1 md:gap-2 bg-[#0f4d2e] hover:bg-[#d4a017] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg md:rounded-full font-semibold transition-all duration-300 px-3 md:px-6 py-2 md:py-3 text-[11px] md:text-sm btn-glow"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 md:w-[15px] md:h-[15px]" /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Add</span>
                          </button>
                          <button
                            onClick={(e) => handleEnquireClick(e, p)}
                            data-testid={`enquire-btn-${p.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-1 md:gap-2 bg-white border-2 border-[#0f4d2e]/15 hover:border-[#0f4d2e] text-[#0f4d2e] rounded-lg md:rounded-full font-semibold transition-all duration-300 px-3 md:px-6 py-2 md:py-3 text-[11px] md:text-sm hidden sm:inline-flex"
                          >
                            Enquire <ArrowRight size={14} />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>

      <EnquiryDialog open={open} onOpenChange={setOpen} product={active ? { id: active.id, title: active.name } : null} />
      <ProductReviewsModal open={reviewsOpen} onOpenChange={setReviewsOpen} product={active ? { id: active.id, name: active.name } : null} />
    </section>
  );
}
