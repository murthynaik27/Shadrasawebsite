import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { LOGO_URL } from "../lib/api";
import { Link } from "react-router-dom";

export default function Footer({ content = {} }) {
  const year = new Date().getFullYear();
  const PHONE = content.contact_phone || "+91 7338542117";
  const EMAIL = content.contact_email || "shadrasa.india@gmail.com";
  const ADDR = content.contact_address || "Karnataka, India";
  const links = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Products", href: "#products" },
    { label: "Gallery", href: "#gallery" },
    { label: "Why Us", href: "#why-us" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <footer data-testid="footer" className="bg-[#0a331e] text-white py-6 md:py-10 relative overflow-hidden">
      <div className="grain" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 pb-6 md:pb-12 border-b border-white/10">
          <div className="col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-4 md:mb-5">
              <img src={LOGO_URL} alt="Shadrasa" className="h-10 w-10 md:h-14 md:w-14 bg-white rounded-lg md:rounded-xl p-1.5" />
              <div>
                <p className="font-display text-xl md:text-2xl font-bold">Shadrasa</p>
                <p className="text-[9px] md:text-xs uppercase tracking-widest md:tracking-[0.25em] text-[#d4a017] font-semibold mt-0.5 md:mt-0">Authentic Traditional Taste</p>
              </div>
            </div>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed max-w-md">
              {content.footer_tagline || "Bringing authentic Malenadu taste to every home — premium homemade pickles and pure natural honey, crafted with tradition from the heart of Karnataka."}
            </p>
            <div className="flex gap-3 mt-5 md:mt-6 justify-center md:justify-start">
              {[Facebook, Instagram, Youtube, Twitter].map((Ic, i) => (
                <a key={i} href="#" data-testid={`footer-social-${i}`} aria-label="Social" className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/10 hover:bg-[#d4a017] flex items-center justify-center transition-colors">
                  <Ic size={14} className="md:w-4 md:h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="font-display text-sm md:text-lg font-semibold mb-3 md:mb-5">Quick Links</h4>
            <ul className="space-y-2 md:space-y-3">
              {links.map((l) => (
                <li key={l.href}><a href={l.href} className="text-white/70 hover:text-[#d4a017] text-xs md:text-sm transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-display text-sm md:text-lg font-semibold mb-3 md:mb-5">Contact</h4>
            <ul className="space-y-2 md:space-y-3 text-[11px] md:text-sm text-white/70">
              <li><a href={`tel:${PHONE.replace(/\s/g, "")}`} className="hover:text-[#d4a017] break-all">{PHONE}</a></li>
              <li><a href={`mailto:${EMAIL}`} className="hover:text-[#d4a017] break-all">{EMAIL}</a></li>
              <li>{ADDR}</li>
              <li className="pt-2 md:pt-3">
                <Link to="/admin/login" data-testid="footer-admin-link" className="text-white/40 hover:text-[#d4a017] text-[9px] md:text-xs uppercase tracking-widest md:tracking-[0.2em]">Admin Portal</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 md:pt-7 flex flex-col sm:flex-row items-center justify-between gap-1.5 md:gap-3 text-[10px] md:text-xs text-center text-white/50">
          <p>© {year} Shadrasa. Crafted with Tradition.</p>
          <p>Made with love in Karnataka, India</p>
        </div>
      </div>
    </footer>
  );
}
