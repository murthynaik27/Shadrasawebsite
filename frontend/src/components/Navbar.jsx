import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { LOGO_URL } from "../lib/api";
import { useCart } from "../lib/CartContext";

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Gallery", href: "#gallery" },
  { label: "Why Us", href: "#why-us" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count, setOpen: openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-[#0f4d2e]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <a href="#home" data-testid="navbar-logo" className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Shadrasa" className="h-12 w-12 object-contain" />
          <div className="hidden sm:flex flex-col leading-tight">
            <span
              className={`font-display text-2xl font-bold ${
                scrolled ? "text-[#0a331e]" : "text-white"
              }`}
            >
              Shadrasa
            </span>
            <span
              className={`text-[10px] tracking-[0.25em] uppercase font-semibold ${
                scrolled ? "text-[#6b3e1f]" : "text-[#f5e7c2]"
              }`}
            >
              Authentic Taste
            </span>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-link-${l.label.toLowerCase().replace(" ", "-")}`}
              className={`text-sm font-medium transition-colors hover:text-[#d4a017] ${
                scrolled ? "text-[#0a331e]" : "text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            data-testid="nav-cta-contact"
            className="bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full font-semibold transition-all duration-300 px-6 py-2.5 text-sm btn-glow"
          >
            Get In Touch
          </a>
          <button
            onClick={() => openCart(true)}
            data-testid="nav-cart-btn"
            aria-label="Open cart"
            className={`relative h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
              scrolled ? "bg-[#fdfbf7] text-[#0a331e] hover:bg-[#0f4d2e] hover:text-white" : "bg-white/15 text-white hover:bg-white hover:text-[#0a331e]"
            }`}
          >
            <ShoppingBag size={17} />
            {count > 0 && (
              <span data-testid="nav-cart-count" className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#d4a017] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {count}
              </span>
            )}
          </button>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => openCart(true)}
            data-testid="nav-cart-btn-mobile"
            aria-label="Open cart"
            className={`relative h-10 w-10 rounded-full flex items-center justify-center ${scrolled ? "text-[#0a331e]" : "text-white"}`}
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#d4a017] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {count}
              </span>
            )}
          </button>
          <button
            data-testid="navbar-mobile-toggle"
            onClick={() => setOpen(!open)}
            className={`p-2 rounded-md ${scrolled ? "text-[#0a331e]" : "text-white"}`}
            aria-label="Toggle menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-[#0f4d2e]/10 px-4 py-6 space-y-3 shadow-xl">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              data-testid={`mobile-nav-link-${l.label.toLowerCase().replace(" ", "-")}`}
              className="block py-2 text-[#0a331e] font-medium hover:text-[#d4a017]"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="block bg-[#0f4d2e] text-white text-center rounded-full font-semibold px-6 py-3"
          >
            Get In Touch
          </a>
        </div>
      )}
    </header>
  );
}
