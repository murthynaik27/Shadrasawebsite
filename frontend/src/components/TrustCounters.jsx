import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function useCounter(target, active, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return val;
}

function Counter({ s, active }) {
  const v = useCounter(s.value, active);
  return (
    <div className="text-center" data-testid={`counter-${s.label.toLowerCase().replace(/ /g, "-")}`}>
      <div className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-[#d4a017] tracking-tight">
        {v.toLocaleString()}
        <span className="text-[#d4a017]/80">{s.suffix}</span>
      </div>
      <p className="mt-3 text-xs md:text-sm uppercase tracking-[0.25em] font-semibold text-white/85">{s.label}</p>
    </div>
  );
}

export default function TrustCounters({ content = {} }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => e.isIntersecting && setActive(true), { threshold: 0.3 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);

  const stats = [
    { value: content.stat_customers ?? 5000, suffix: "+", label: "Happy Customers" },
    { value: content.stat_quality ?? 100, suffix: "%", label: "Homemade Quality" },
    { value: content.stat_natural ?? 100, suffix: "%", label: "Natural Ingredients" },
    { value: content.stat_recipes ?? 25, suffix: "+", label: "Traditional Recipes" },
  ];

  return (
    <section ref={ref} data-testid="trust-section" className="py-24 md:py-28 bg-[#0a331e] relative overflow-hidden">
      <div className="grain" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14 md:mb-16"
        >
          <p className="divider-ornament mb-4">Trusted by Thousands</p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-white">
            Numbers that speak <span className="italic text-[#d4a017]">tradition</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          {stats.map((s) => (
            <Counter key={s.label} s={s} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
