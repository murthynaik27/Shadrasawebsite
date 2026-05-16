import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LOGO_URL } from "../lib/api";

const FALLBACK = [
  "https://static.prod-images.emergentagent.com/jobs/cc798c37-0d6b-4dd4-bae2-7f1634f5fc87/images/a49a777a9a98d03c379337a2f3d0ad8160e11fca05440ecf0b80cb2adc13c857.png",
];

export default function Hero({ content = {}, banners = [] }) {
  const slides = (banners.length ? banners.map((b) => b.image) : FALLBACK).filter(Boolean);
  const safeSlides = slides.length ? slides : FALLBACK;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (safeSlides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % safeSlides.length), 5500);
    return () => clearInterval(t);
  }, [safeSlides.length]);

  return (
    <section id="home" data-testid="hero-section" className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="sync">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.2 }, scale: { duration: 6, ease: "linear" } }}
          className="absolute inset-0"
          style={{ backgroundImage: `url(${safeSlides[idx]})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 hero-overlay" />
      <div className="grain" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative z-10 text-center px-6 max-w-4xl"
      >
        <motion.img
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
          src={LOGO_URL}
          alt="Shadrasa"
          className="mx-auto h-32 md:h-40 w-auto mb-6 drop-shadow-2xl bg-white/95 rounded-2xl p-3"
          data-testid="hero-logo"
        />
        <p className="divider-ornament text-[#f5e7c2] mb-6">{content.hero_eyebrow || "Est. Karnataka · India"}</p>
        <h1
          className="font-display font-bold tracking-tight text-white text-5xl sm:text-6xl md:text-7xl lg:text-[88px] leading-[1.05] mb-6"
          data-testid="hero-heading"
        >
          {(content.hero_heading || "Welcome to Shadrasa").split(" ").slice(0, -1).join(" ")}{" "}
          <span className="text-[#d4a017] italic">
            {(content.hero_heading || "Welcome to Shadrasa").split(" ").slice(-1)[0]}
          </span>
        </h1>
        <p className="text-white/90 text-lg md:text-2xl font-light max-w-2xl mx-auto mb-10">
          {content.hero_subheading || "Bringing Authentic Malenadu Taste to Every Home"}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#products"
            data-testid="hero-cta-products"
            className="bg-[#d4a017] hover:bg-[#b88a14] text-white rounded-full font-semibold transition-all duration-300 px-8 py-4 text-base btn-glow"
          >
            {content.hero_cta_primary_label || "Explore Products"}
          </a>
          <a
            href="#contact"
            data-testid="hero-cta-contact"
            className="bg-transparent border-2 border-white/80 text-white hover:bg-white hover:text-[#0a331e] rounded-full font-semibold transition-all duration-300 px-8 py-4 text-base"
          >
            {content.hero_cta_secondary_label || "Contact Us"}
          </a>
        </div>

        <div className="flex justify-center gap-2 mt-14">
          {safeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              data-testid={`hero-slide-${i}`}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === idx ? "w-10 bg-[#d4a017]" : "w-4 bg-white/40"
              }`}
            />
          ))}
        </div>
      </motion.div>

      <a
        href="#about"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 scroll-indicator text-white/80 flex flex-col items-center gap-2 text-xs tracking-[0.3em] uppercase"
        data-testid="hero-scroll-indicator"
      >
        Scroll
        <ChevronDown size={20} />
      </a>
    </section>
  );
}
