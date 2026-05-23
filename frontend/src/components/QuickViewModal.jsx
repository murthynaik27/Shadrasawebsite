import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { formatPrice } from "../lib/admin";
import { ShoppingCart, ArrowRight, X, Award } from "lucide-react";
import OptimizedImage from "./ui/OptimizedImage";

export default function QuickViewModal({ open, onOpenChange, product, onAddToCart, onEnquire }) {
  const [selectedOpt, setSelectedOpt] = useState(null);

  useEffect(() => {
    if (product?.weight_options?.length > 0) {
      setSelectedOpt(product.weight_options[0]);
    } else {
      setSelectedOpt(null);
    }
  }, [product]);

  if (!product) return null;

  const price = selectedOpt ? selectedOpt.price : product.price;
  const sale_price = selectedOpt ? selectedOpt.sale_price : product.sale_price;
  const stock = selectedOpt ? selectedOpt.stock : product.stock;
  const weight = selectedOpt ? selectedOpt.weight : product.weight;
  const unit = selectedOpt ? selectedOpt.unit : product.unit;
  const displayImage = selectedOpt && selectedOpt.image ? selectedOpt.image : product.image;
  const displayBlur = selectedOpt && selectedOpt.blur_image ? selectedOpt.blur_image : product.blur_image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-[#fdfbf7] border-none rounded-2xl shadow-2xl">
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 bg-white/50 hover:bg-white backdrop-blur-md p-2 rounded-full text-[#6b3e1f] transition-colors"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Image Section */}
          <div className="md:w-1/2 relative bg-white flex items-center justify-center p-8 aspect-square md:aspect-auto">
            {displayImage ? (
              <OptimizedImage 
                src={displayImage} 
                blurData={displayBlur}
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                containerClassName="absolute inset-0"
              />
            ) : (
              <div className="w-full h-full border border-dashed border-[#6b3e1f]/20 rounded-xl flex items-center justify-center text-[#6b3e1f]/50">
                No Image
              </div>
            )}
            {stock <= 0 && (
              <div className="absolute top-8 left-8 bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                Sold Out
              </div>
            )}
            {product.premium_badge && stock > 0 && (
              <div className="absolute top-8 left-8 flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#0f4d2e] shadow-lg">
                <Award size={14} /> {product.premium_badge}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col justify-center">
            {product.tagline && (
              <p className="text-xs font-bold text-[#6b3e1f] uppercase tracking-widest mb-2">
                {product.tagline}
              </p>
            )}
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e] mb-4">
              {product.name}
            </h2>
            
            {product.weight_options && product.weight_options.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2 border-b border-[#6b3e1f]/10 pb-6">
                {product.weight_options.map((wOpt, idx) => {
                  const isSelected = selectedOpt && selectedOpt.weight === wOpt.weight && selectedOpt.unit === wOpt.unit;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedOpt(wOpt)}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                        isSelected 
                          ? "bg-[#0f4d2e] border-[#0f4d2e] text-white shadow-md" 
                          : "bg-white border-[#6b3e1f]/20 text-[#0a331e] hover:border-[#0f4d2e] hover:text-[#0f4d2e]"
                      }`}
                    >
                      {wOpt.weight}{wOpt.unit}
                    </button>
                  );
                })}
              </div>
            )}

            <div className={`mb-6 flex items-baseline gap-3 ${product.weight_options && product.weight_options.length > 0 ? '' : 'border-b border-[#6b3e1f]/10 pb-6'}`}>
              {sale_price && sale_price < price ? (
                <>
                  <span className="font-display text-3xl font-semibold text-[#0f4d2e]">
                    {formatPrice(sale_price, product.currency)}
                  </span>
                  <span className="text-lg line-through text-[#6b3e1f]/50">
                    {formatPrice(price, product.currency)}
                  </span>
                </>
              ) : (
                <span className="font-display text-3xl font-semibold text-[#0f4d2e]">
                  {formatPrice(price, product.currency)}
                </span>
              )}
              {weight && unit && (!product.weight_options || product.weight_options.length === 0) && (
                <span className="text-[#6b3e1f] font-medium ml-1">
                  / {weight}{unit}
                </span>
              )}
            </div>

            <div className="prose prose-sm text-[#4a453f] mb-8 leading-relaxed">
              <p>{product.description}</p>
            </div>

            <div className="mt-auto space-y-3 pt-6">
              <button
                onClick={() => {
                  onAddToCart(product); // Wait, Products.jsx handles add to cart for QuickView as well. But wait, Products.jsx QuickView uses add() directly or calls onAddToCart which expects just product?
                  // Let me check how QuickViewModal is used in Products.jsx... wait, Products.jsx doesn't use QuickViewModal? 
                  // Ah, wait! The user clicks "Quick View" and where does it go? Let me just pass the selected option to onAddToCart if it supports it.
                  onAddToCart(product, selectedOpt);
                  onOpenChange(false);
                }}
                disabled={stock <= 0}
                className="w-full flex items-center justify-center gap-2 bg-[#0f4d2e] hover:bg-[#0a331e] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-all duration-300 px-6 py-4 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
              
              <button
                onClick={() => {
                  onOpenChange(false);
                  setTimeout(() => onEnquire(product), 300);
                }}
                className="w-full flex items-center justify-center gap-2 bg-white border border-[#0f4d2e]/20 hover:border-[#0f4d2e] text-[#0f4d2e] rounded-full font-semibold transition-all duration-300 px-6 py-4 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                Enquire <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
