import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Award, ArrowRight, ShoppingBag, ShoppingCart } from "lucide-react";
import EnquiryDialog from "./EnquiryDialog";
import { formatPrice } from "../lib/admin";
import { useCart } from "../lib/CartContext";

export default function Products({ products = [] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const { add } = useCart();

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

  return (
    <section id="products" data-testid="products-section" className="py-24 md:py-32 bg-[#fdfbf7] relative">
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
          <div className={`grid grid-cols-1 ${products.length === 1 ? "lg:grid-cols-1 max-w-2xl mx-auto" : products.length === 2 ? "lg:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"} gap-10`}>
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                data-testid={`product-card-${p.id}`}
                className="group relative rounded-3xl overflow-hidden bg-white border border-[#6b3e1f]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_24px_60px_rgb(15,77,46,0.12)] transition-all duration-500 flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {p.premium_badge && (
                    <div className="absolute top-5 left-5 flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#0f4d2e]">
                      <Award size={14} /> {p.premium_badge}
                    </div>
                  )}
                  {p.stock <= 0 && (
                    <div className="absolute top-5 right-5 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em]">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="p-8 md:p-10 flex-1 flex flex-col">
                  {p.tagline && (
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#6b3e1f] mb-3">{p.tagline}</p>
                  )}
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-[#0a331e] mb-3">{p.name}</h3>
                  {p.category_name && (
                    <span className="inline-block self-start text-[10px] uppercase tracking-[0.2em] text-[#0f4d2e] bg-[#0f4d2e]/8 px-2.5 py-1 rounded-full mb-4 font-semibold">
                      {p.category_name}
                    </span>
                  )}
                  <p className="text-[#4a453f] leading-relaxed mb-5 flex-1">{p.description}</p>
                  <div className="flex items-end justify-between gap-4 mb-6">
                    <div>
                      {p.sale_price && p.sale_price < p.price ? (
                        <>
                          <span className="font-display text-2xl font-semibold text-[#0a331e]">{formatPrice(p.sale_price, p.currency)}</span>
                          <span className="ml-2 text-sm line-through text-[#6b3e1f]/60">{formatPrice(p.price, p.currency)}</span>
                        </>
                      ) : (
                        <span className="font-display text-2xl font-semibold text-[#0a331e]">{formatPrice(p.price, p.currency)}</span>
                      )}
                      {p.weight && p.unit && (
                        <span className="text-sm font-semibold text-[#6b3e1f] ml-1">/ {p.weight}{p.unit}</span>
                      )}
                    </div>
                    {p.stock > 0 && (
                      <span className="text-xs text-[#0f4d2e] font-semibold flex items-center gap-1">
                        <ShoppingBag size={13} /> In Stock
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stock <= 0}
                    data-testid={`add-cart-btn-${p.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0f4d2e] hover:bg-[#d4a017] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-all duration-300 px-6 py-3 text-sm btn-glow"
                  >
                    <ShoppingCart size={15} /> Add to Cart
                  </button>
                  <button
                    onClick={() => enquire(p)}
                    data-testid={`enquire-btn-${p.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-white border-2 border-[#0f4d2e]/15 hover:border-[#0f4d2e] text-[#0f4d2e] rounded-full font-semibold transition-all duration-300 px-6 py-3 text-sm"
                  >
                    Enquire <ArrowRight size={14} />
                  </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>

      <EnquiryDialog open={open} onOpenChange={setOpen} product={active ? { id: active.id, title: active.name } : null} />
    </section>
  );
}
