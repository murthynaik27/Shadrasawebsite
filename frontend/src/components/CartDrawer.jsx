import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../lib/CartContext";
import { formatPrice } from "../lib/admin";
import { getImageUrl } from "../lib/api";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, auth, setShowLoginModal } = useCart();
  const navigate = useNavigate();
  
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const confirmRemove = () => {
    if (!itemToRemove) return;
    
    setIsRemoving(true);
    
    // Remove the product instantly from cart
    remove(itemToRemove.product_id, itemToRemove.weight, itemToRemove.unit);
    toast.success("Item removed from cart");
    
    setItemToRemove(null);
    setIsRemoving(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-all duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        data-testid="cart-drawer"
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#FDFBF7] z-[61] flex flex-col shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-gray-100 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#1b5e20]" />
            <h2 className="text-xl font-bold text-gray-900 m-0 font-serif">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-[#1b5e20] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button 
            onClick={() => setOpen(false)} 
            className="p-2 -mr-2 bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors border-none cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-white shadow-sm rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-[250px] mx-auto">
                Looks like you haven't added anything to your cart yet.
              </p>
              <button 
                onClick={() => setOpen(false)} 
                className="px-8 py-3.5 bg-[#1b5e20] text-white text-sm font-semibold rounded-xl hover:bg-[#144517] shadow-md hover:shadow-lg transition-all active:scale-95 border-none cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((i) => (
                <div 
                  key={`${i.product_id}-${i.weight}-${i.unit}`} 
                  className="group relative flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  {/* Delete Icon (Absolute Top Right) */}
                  <button 
                    onClick={() => setItemToRemove(i)}
                    className="absolute top-3 right-3 p-2 text-gray-300 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 z-10 bg-white shadow-sm border border-gray-100 group-hover:border-transparent cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <img 
                      src={getImageUrl(i.image)} 
                      alt={i.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className="m-0 text-base font-semibold text-gray-900 pr-8 line-clamp-1">{i.name}</h4>
                    <p className="m-0 text-xs font-medium text-gray-500 mt-1">
                      {i.weight}{i.unit}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <p className="m-0 text-base font-bold text-[#1b5e20]">{formatPrice(i.price)}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button 
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                          onClick={() => {
                            if (i.quantity <= 1) setItemToRemove(i);
                            else setQty(i.product_id, i.quantity - 1, i.weight, i.unit);
                          }}
                        >
                          -
                        </button>
                        <span className="text-sm font-semibold w-6 text-center text-gray-900">{i.quantity}</span>
                        <button 
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => setQty(i.product_id, i.quantity + 1, i.weight, i.unit)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Confirmation Popup Overlay inside the scroll area */}
          {itemToRemove && (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Item?</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Are you sure you want to remove <span className="font-semibold text-gray-800">{itemToRemove.name}</span> from your cart?
                </p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setItemToRemove(null)}
                    disabled={isRemoving}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer border-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmRemove}
                    disabled={isRemoving}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer border-none shadow-sm shadow-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Checkout Section (Sticky) */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)] z-10">
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm font-medium text-gray-500">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <button 
              className="w-full bg-[#1b5e20] text-white py-4 rounded-xl font-semibold text-base shadow-lg shadow-green-900/20 hover:bg-[#144517] hover:shadow-xl transition-all active:scale-95 border-none cursor-pointer flex items-center justify-center gap-2"
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
              <ShoppingBag size={18} />
              Proceed to Checkout
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 m-0 flex items-center justify-center gap-1">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
