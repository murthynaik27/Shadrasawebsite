import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useCart } from "../lib/CartContext";
import { formatPrice } from "../lib/admin";
import { getImageUrl } from "../lib/api";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, auth, setShowLoginModal } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/20 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        data-testid="cart-drawer"
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#f9f9f9] z-[61] flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 bg-white border-b border-[#eee]">
          <h2 className="text-lg font-semibold m-0">Your Cart</h2>
          <button onClick={() => setOpen(false)} className="bg-transparent border-none cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="cart-container">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-10">Your cart is empty.</p>
            ) : (
              items.map((i) => (
                <div key={i.product_id} className="cart-item">
                  <img src={getImageUrl(i.image)} alt={i.name} />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="m-0 text-sm font-semibold text-gray-800 line-clamp-1">{i.name}</h4>
                    <p className="m-0 text-xs text-gray-500 mt-1">
                      {i.weight}{i.unit}
                    </p>
                    <p className="m-0 text-sm font-bold text-[#1b5e20] mt-1">{formatPrice(i.price)}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 border-none cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        if (i.quantity <= 1) remove(i.product_id, i.weight, i.unit);
                        else setQty(i.product_id, i.quantity - 1, i.weight, i.unit);
                      }}
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{i.quantity}</span>
                    <button 
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 border-none cursor-pointer hover:bg-gray-200"
                      onClick={() => setQty(i.product_id, i.quantity + 1, i.weight, i.unit)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-[#eee]">
            <div className="cart-total">
              <h3 className="m-0 text-lg">Total: {formatPrice(subtotal)}</h3>
              <button 
                className="checkout-btn cursor-pointer"
                onClick={() => {
                  if (!auth) {
                    setOpen(false);
                    setShowLoginModal(true);
                  } else {
                    setOpen(false);
                    navigate("/checkout");
                  }
                }}
              >
                Checkout
              </button>
            </div>
          </div>
        )}

        <style>{`
          .cart-container {
            background: #ffffff;
            padding: 12px;
            border-radius: 10px;
          }
          .cart-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .cart-item:last-child {
            border-bottom: none;
          }
          .cart-item img {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 6px;
          }
          .cart-total {
            margin-top: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .checkout-btn {
            background: #1b5e20;
            color: white;
            padding: 10px 14px;
            border-radius: 6px;
            border: none;
            font-weight: 500;
          }
          @media (max-width: 600px) {
            .cart-item {
              gap: 8px;
            }
            .cart-item img {
              width: 45px;
              height: 45px;
            }
            .cart-total {
              flex-direction: column;
              gap: 12px;
              align-items: flex-start;
            }
            .checkout-btn {
              width: 100%;
              text-align: center;
            }
          }
        `}</style>
      </aside>
    </>
  );
}
