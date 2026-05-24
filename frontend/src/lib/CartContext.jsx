import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { apiClient } from "./api";

const CartCtx = createContext(null);
const GUEST_KEY = "guestCart";
const AUTH_KEY = "auth";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState(null);

  // Load auth state and initial cart
  useEffect(() => {
    let currentAuth = null;
    try {
      const authRaw = localStorage.getItem(AUTH_KEY);
      if (authRaw) {
        currentAuth = JSON.parse(authRaw);
        setAuth(currentAuth);
      }
    } catch {}

    const loadCart = async () => {
      if (currentAuth && currentAuth.userId) {
        try {
          const res = await apiClient.get(`/cart/${currentAuth.userId}`);
          setItems(res.data || []);
        } catch (err) {
          console.error("Failed to load DB cart", err);
        }
      } else {
        try {
          const guestRaw = localStorage.getItem(GUEST_KEY);
          if (guestRaw) setItems(JSON.parse(guestRaw) || []);
        } catch {}
      }
    };
    loadCart();
  }, []);

  // Sync to DB or LocalStorage when items or auth changes
  // We use a debounce-like approach or just direct sync
  const syncCart = useCallback(async (newItems, currentAuth) => {
    if (currentAuth && currentAuth.userId) {
      try {
        await apiClient.post(`/cart/${currentAuth.userId}/sync`, newItems);
      } catch (err) {
        console.error("Failed to sync cart", err);
      }
    } else {
      localStorage.setItem(GUEST_KEY, JSON.stringify(newItems));
    }
  }, []);

  const add = useCallback((product, qty = 1, opt = null) => {
    setItems((cur) => {
      const idx = cur.findIndex((i) => 
        i.product_id === product.id && 
        (opt ? (i.weight === opt.weight && i.unit === opt.unit) : true)
      );
      
      let next;
      if (idx >= 0) {
        next = [...cur];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
      } else {
        const price = opt ? (opt.sale_price && opt.sale_price < opt.price ? opt.sale_price : opt.price) 
                          : (product.sale_price && product.sale_price < product.price ? product.sale_price : product.price);
        
        next = [
          ...cur,
          {
            product_id: product.id,
            name: product.name,
            image: opt && opt.image ? opt.image : product.image,
            price: Number(price) || 0,
            quantity: qty,
            stock: opt ? opt.stock : product.stock,
            weight: opt ? opt.weight : product.weight,
            unit: opt ? opt.unit : product.unit,
          },
        ];
      }
      
      syncCart(next, auth);
      return next;
    });
    setOpen(true);
  }, [auth, syncCart]);

  const setQty = useCallback((product_id, qty, weight = null, unit = null) => {
    setItems((cur) => {
      let next;
      if (qty <= 0) {
        next = cur.filter((i) => !(i.product_id === product_id && i.weight === weight && i.unit === unit));
      } else {
        next = cur.map((i) => (i.product_id === product_id && i.weight === weight && i.unit === unit ? { ...i, quantity: qty } : i));
      }
      syncCart(next, auth);
      return next;
    });
  }, [auth, syncCart]);

  const remove = useCallback((product_id, weight = null, unit = null) => {
    setItems((cur) => {
      const next = cur.filter((i) => !(i.product_id === product_id && i.weight === weight && i.unit === unit));
      syncCart(next, auth);
      return next;
    });
  }, [auth, syncCart]);

  const clear = useCallback(() => {
    setItems([]);
    syncCart([], auth);
  }, [auth, syncCart]);

  const loginUser = useCallback(async (authObj) => {
    try {
      const guestRaw = localStorage.getItem(GUEST_KEY);
      const guestCart = guestRaw ? JSON.parse(guestRaw) : [];
      
      if (guestCart.length > 0) {
        await apiClient.post(`/cart/${authObj.userId}/sync`, guestCart);
      }
      
      localStorage.removeItem(GUEST_KEY);
      localStorage.setItem(AUTH_KEY, JSON.stringify(authObj));
      setAuth(authObj);
      
      const res = await apiClient.get(`/cart/${authObj.userId}`);
      setItems(res.data || []);
    } catch (err) {
      console.error("Login sync failed", err);
    }
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setAuth(null);
    setItems([]);
  }, []);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, count, subtotal, open, setOpen, add, setQty, remove, clear, auth, loginUser, logoutUser }),
    [items, count, subtotal, open, add, setQty, remove, clear, auth, loginUser, logoutUser]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
