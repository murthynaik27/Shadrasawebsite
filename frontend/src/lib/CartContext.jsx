import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const CartCtx = createContext(null);
const STORAGE_KEY = "shadrasa_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const add = useCallback((product, qty = 1) => {
    setItems((cur) => {
      const idx = cur.findIndex((i) => i.product_id === product.id);
      if (idx >= 0) {
        const next = [...cur];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      const price = product.sale_price && product.sale_price < product.price ? product.sale_price : product.price;
      return [
        ...cur,
        {
          product_id: product.id,
          name: product.name,
          image: product.image,
          price: Number(price) || 0,
          quantity: qty,
          stock: product.stock,
          weight: product.weight,
          unit: product.unit,
        },
      ];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((product_id, qty) => {
    setItems((cur) => {
      if (qty <= 0) return cur.filter((i) => i.product_id !== product_id);
      return cur.map((i) => (i.product_id === product_id ? { ...i, quantity: qty } : i));
    });
  }, []);

  const remove = useCallback((product_id) => {
    setItems((cur) => cur.filter((i) => i.product_id !== product_id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, count, subtotal, open, setOpen, add, setQty, remove, clear }),
    [items, count, subtotal, open, add, setQty, remove, clear]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
