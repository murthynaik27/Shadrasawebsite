import { useNavigate } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../lib/CartContext";
import { formatPrice } from "../lib/admin";
import { getImageUrl } from "../lib/api";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-[#0a331e]/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        data-testid="cart-drawer"
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#fdfbf7] z-[61] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-[#6b3e1f]/10 bg-white/95 backdrop-blur-md sticky top-0 z-20">
          <h3 className="font-display text-2xl font-semibold text-[#0a331e] flex items-center gap-3">
            <ShoppingBag className="text-[#d4a017]" size={24} />
            Your Cart
            <span className="bg-[#0f4d2e] text-white text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">
              {items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </h3>
          <button
            onClick={() => setOpen(false)}
            data-testid="cart-close"
            className="h-10 w-10 flex items-center justify-center rounded-full bg-[#fdfbf7] text-[#6b3e1f] hover:bg-[#0f4d2e] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth z-10">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#6b3e1f]/10">
                <ShoppingBag size={48} className="text-[#6b3e1f]/30" />
              </div>
              <h4 className="font-display text-2xl text-[#0a331e] font-semibold mb-2">Cart is empty</h4>
              <p className="text-[#6b3e1f] mb-8 max-w-[250px]">Looks like you haven't added anything to your cart yet.</p>
              <button
                onClick={() => {
                  setOpen(false);
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full px-8 py-3.5 text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li
                  key={i.product_id}
                  data-testid={`cart-item-${i.product_id}`}
                  className="group flex gap-3 sm:gap-4 bg-white rounded-3xl p-3 sm:p-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-[#6b3e1f]/10 relative transition-all hover:shadow-[0_8px_30px_-10px_rgba(15,77,46,0.1)] hover:border-[#0f4d2e]/20"
                >
                  {/* Image */}
                  <div className="h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 bg-[#fdfbf7] rounded-2xl overflow-hidden border border-[#6b3e1f]/5">
                    <img
                      src={getImageUrl(i.image)}
                      alt={i.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
                    <div className="pr-7 sm:pr-8">
                      <p className="font-display font-semibold text-[#0a331e] text-base sm:text-lg leading-tight line-clamp-2">
                        {i.name}
                      </p>
                      <p className="text-[#0f4d2e] font-bold text-sm sm:text-base mt-1.5">
                        {formatPrice(i.price)}
                        {i.weight && i.unit && (
                          <span className="text-xs font-medium text-[#6b3e1f]/60 ml-1.5">
                            / {i.weight}{i.unit}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3 sm:mt-4">
                      <div className="flex items-center bg-[#fdfbf7] rounded-full border border-[#6b3e1f]/15 p-1">
                        <button
                          onClick={() => setQty(i.product_id, i.quantity - 1, i.weight, i.unit)}
                          data-testid={`qty-dec-${i.product_id}`}
                          className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center text-[#0a331e] hover:bg-[#0f4d2e] hover:text-white rounded-full transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 sm:w-8 text-center text-sm font-semibold text-[#0a331e]">
                          {i.quantity}
                        </span>
                        <button
                          onClick={() => setQty(i.product_id, i.quantity + 1, i.weight, i.unit)}
                          data-testid={`qty-inc-${i.product_id}`}
                          className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center text-[#0a331e] hover:bg-[#0f4d2e] hover:text-white rounded-full transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button - Top Right Absolute */}
                  <button
                    onClick={() => remove(i.product_id, i.weight, i.unit)}
                    data-testid={`cart-remove-${i.product_id}`}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 h-8 w-8 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors opacity-80 hover:opacity-100"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-[#6b3e1f]/10 p-5 sm:p-6 bg-white shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)] sticky bottom-0 z-20 mt-auto">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-[#6b3e1f] font-medium uppercase tracking-wider text-xs">Subtotal</span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-[#0a331e]">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-[#6b3e1f]/70 mb-4 sm:mb-5">Shipping & taxes calculated at checkout.</p>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/checkout");
              }}
              data-testid="cart-checkout-btn"
              className="w-full flex items-center justify-between bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <span>Proceed to Checkout</span>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} />
              </div>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
