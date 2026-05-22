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
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        data-testid="cart-drawer"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#fdfbf7] z-[61] shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#6b3e1f]/10 bg-white">
          <h3 className="font-display text-2xl font-semibold text-[#0a331e] flex items-center gap-2">
            <ShoppingBag size={20} /> Your Cart
          </h3>
          <button onClick={() => setOpen(false)} data-testid="cart-close" className="text-[#6b3e1f] hover:text-[#0a331e]">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={40} className="mx-auto text-[#6b3e1f]/40 mb-4" />
              <p className="text-[#6b3e1f] mb-6">Your cart is empty</p>
              <button
                onClick={() => { setOpen(false); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}
                className="bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full px-6 py-2.5 text-sm font-semibold"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i.product_id} data-testid={`cart-item-${i.product_id}`} className="flex gap-3 bg-white rounded-2xl p-3 border border-[#6b3e1f]/10">
                  <img src={getImageUrl(i.image)} alt={i.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0a331e] text-sm line-clamp-2">{i.name}</p>
                    <p className="text-[#0f4d2e] font-semibold text-sm mt-1">
                      {formatPrice(i.price)}
                      {i.weight && i.unit && <span className="text-xs text-[#6b3e1f] ml-1">/ {i.weight}{i.unit}</span>}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-[#fdfbf7] rounded-full border border-[#6b3e1f]/15">
                        <button onClick={() => setQty(i.product_id, i.quantity - 1)} data-testid={`qty-dec-${i.product_id}`} className="h-7 w-7 flex items-center justify-center text-[#0a331e] hover:bg-[#0f4d2e] hover:text-white rounded-l-full">
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm font-semibold text-[#0a331e]">{i.quantity}</span>
                        <button onClick={() => setQty(i.product_id, i.quantity + 1)} data-testid={`qty-inc-${i.product_id}`} className="h-7 w-7 flex items-center justify-center text-[#0a331e] hover:bg-[#0f4d2e] hover:text-white rounded-r-full">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button onClick={() => remove(i.product_id)} data-testid={`cart-remove-${i.product_id}`} className="text-red-600 hover:bg-red-50 h-7 w-7 rounded-full flex items-center justify-center">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#6b3e1f]/10 px-6 py-5 bg-white space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6b3e1f]">Subtotal</span>
              <span className="font-display text-2xl font-semibold text-[#0a331e]">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-[#6b3e1f]">Shipping & taxes calculated at checkout.</p>
            <button
              onClick={() => { setOpen(false); navigate("/checkout"); }}
              data-testid="cart-checkout-btn"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full px-6 py-3.5 text-sm font-semibold btn-glow"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
