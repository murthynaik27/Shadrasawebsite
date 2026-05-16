import { motion } from "framer-motion";
import {
  HeartHandshake,
  ScrollText,
  Sprout,
  ShieldCheck,
  Ban,
  BadgeCheck,
  Soup,
  Smile,
} from "lucide-react";

const items = [
  { icon: HeartHandshake, title: "Homemade with Care", desc: "Every batch crafted by skilled hands with love." },
  { icon: ScrollText, title: "Traditional Recipes", desc: "Authentic Malenadu family recipes preserved." },
  { icon: Sprout, title: "Premium Ingredients", desc: "Hand-picked from trusted local farms." },
  { icon: ShieldCheck, title: "Hygienic Preparation", desc: "Spotless processes you can trust." },
  { icon: Ban, title: "No Artificial Preservatives", desc: "Pure, natural and free from chemicals." },
  { icon: BadgeCheck, title: "Trusted Quality", desc: "Tested at every step before reaching you." },
  { icon: Soup, title: "Rich Taste", desc: "Bold, deep flavours of authentic tradition." },
  { icon: Smile, title: "Customer Satisfaction", desc: "Loved across kitchens and generations." },
];

export default function WhyUs() {
  return (
    <section id="why-us" data-testid="why-us-section" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="divider-ornament mb-4">Why Choose Shadrasa</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[#0a331e] tracking-tight">
            Crafted with <span className="italic text-[#d4a017]">Tradition</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-[#4a453f] text-base md:text-lg">
            Eight reasons why families across India trust Shadrasa for authentic flavours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                data-testid={`why-card-${i}`}
                className="group rounded-2xl bg-[#fdfbf7] p-7 border border-[#6b3e1f]/10 hover:border-[#d4a017]/40 hover:bg-white transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(15,77,46,0.08)]"
              >
                <div className="h-14 w-14 rounded-2xl bg-[#0f4d2e] flex items-center justify-center mb-5 group-hover:bg-[#d4a017] transition-colors duration-300">
                  <Icon size={24} className="text-[#d4a017] group-hover:text-white transition-colors" strokeWidth={1.6} />
                </div>
                <h3 className="font-display text-xl font-semibold text-[#0a331e] mb-2">{it.title}</h3>
                <p className="text-sm text-[#4a453f] leading-relaxed">{it.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
