import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "Anjali Rao",
    role: "Bengaluru, Karnataka",
    text: "The Jeerige Midi pickle reminds me of my grandmother's kitchen. Authentic, fresh and packed with love. I order every month.",
  },
  {
    name: "Rohit Shenoy",
    role: "Mangalore",
    text: "Shadrasa honey is the purest I've tasted in years. You can tell it's straight from the forest. My kids are obsessed.",
  },
  {
    name: "Lakshmi Iyer",
    role: "Chennai",
    text: "Premium packaging, premium taste. Feels like a luxury brand but with the warmth of homemade. Highly recommended for gifting.",
  },
];

export default function Testimonials() {
  return (
    <section data-testid="testimonials-section" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="divider-ornament mb-4">Loved By Families</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[#0a331e] tracking-tight">
            What our <span className="italic text-[#d4a017]">customers</span> say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              data-testid={`testimonial-${i}`}
              className="relative rounded-3xl bg-[#fdfbf7] p-8 md:p-10 border border-[#6b3e1f]/10 hover:border-[#d4a017]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(15,77,46,0.12)]"
            >
              <Quote size={36} className="text-[#d4a017]/35 mb-5" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} size={16} className="fill-[#d4a017] text-[#d4a017]" />
                ))}
              </div>
              <p className="text-[#4a453f] leading-relaxed mb-7 italic">"{r.text}"</p>
              <div className="flex items-center gap-3 pt-5 border-t border-[#6b3e1f]/10">
                <div className="h-11 w-11 rounded-full bg-[#0f4d2e] text-white font-display font-semibold flex items-center justify-center">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-[#0a331e]">{r.name}</p>
                  <p className="text-xs text-[#6b3e1f] uppercase tracking-wider">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
