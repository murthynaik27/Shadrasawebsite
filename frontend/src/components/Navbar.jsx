import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [activeSection, setActiveSection] = useState("");
  const { count, setOpen: openCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      
      if (location.pathname === "/") {
        const sections = links.map(l => l.href.substring(1));
        let current = "";
        
        for (const id of sections) {
          if (id === "home") continue;
          const element = document.getElementById(id);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 3 && rect.bottom >= window.innerHeight / 3) {
              current = id;
              break;
            }
          }
        }
        
        if (window.scrollY < window.innerHeight / 3) {
          current = "home";
        }
        
        setActiveSection(current);
      } else {
        setActiveSection("");
      }
    };
    
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setOpen(false);

    if (href.startsWith("#")) {
      const targetId = href.substring(1);
      
      if (location.pathname !== "/") {
        navigate("/" + href);
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", href);
        } else if (targetId === "home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          window.history.pushState(null, "", href);
        }
      }
    } else {
      navigate(href);
    }
  };

  const isSolid = scrolled || location.pathname !== "/";

  return (
    <header
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isSolid
          ? "bg-white/90 backdrop-blur-xl border-b border-[#0f4d2e]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <a href="#home" data-testid="navbar-logo" className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Shadrasa" className="h-12 w-12 object-contain" />
          <div className="hidden sm:flex flex-col leading-tight">
            <span
              className={`font-display text-2xl font-bold ${
                isSolid ? "text-[#0a331e]" : "text-white"
              }`}
            >
              Shadrasa
            </span>
            <span
              className={`text-[10px] tracking-[0.25em] uppercase font-semibold ${
                isSolid ? "text-[#6b3e1f]" : "text-[#f5e7c2]"
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
              onClick={(e) => handleNavClick(e, l.href)}
              data-testid={`nav-link-${l.label.toLowerCase().replace(" ", "-")}`}
              className={`text-sm font-medium transition-colors hover:text-[#d4a017] ${
                activeSection === l.href.substring(1)
                  ? "text-[#d4a017]"
                  : isSolid
                  ? "text-[#0a331e]"
                  : "text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            data-testid="nav-cta-contact"
            className="bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full font-semibold transition-all duration-300 px-6 py-2.5 text-sm btn-glow"
          >
            Get In Touch
          </a>
          <button
            onClick={() => openCart(true)}
            data-testid="nav-cart-btn"
            aria-label="Open cart"
            className="relative h-10 w-10 rounded-full flex items-center justify-center bg-white text-[#0a331e] shadow-md border border-[#0f4d2e]/10 hover:bg-gray-100 transition-all"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span data-testid="nav-cart-count" className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
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
            className="relative h-10 w-10 rounded-full flex items-center justify-center bg-white text-[#0a331e] shadow-md border border-[#0f4d2e]/10 hover:bg-gray-100 transition-all"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
                {count}
              </span>
            )}
          </button>
          <button
            data-testid="navbar-mobile-toggle"
            onClick={() => setOpen(!open)}
            className={`p-2 rounded-md ${isSolid ? "text-[#0a331e]" : "text-white"}`}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-x-0 top-full z-40 bg-white/95 backdrop-blur-md border-t border-[#0f4d2e]/10 px-4 py-6 space-y-3 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              data-testid={`mobile-nav-link-${l.label.toLowerCase().replace(" ", "-")}`}
              className={`block py-2 font-medium transition-colors hover:text-[#d4a017] ${
                activeSection === l.href.substring(1) ? "text-[#d4a017]" : "text-[#0a331e]"
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="block bg-[#0f4d2e] text-white text-center rounded-full font-semibold px-6 py-3"
          >
            Get In Touch
          </a>
        </div>
      )}
    </header>
  );
}
