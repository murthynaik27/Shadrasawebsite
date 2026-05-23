import { motion } from "framer-motion";
import { Handshake, Phone } from "lucide-react";
import { buildWhatsappFromNumber } from "../lib/siteData";

export default function BusinessCTA({ content = {} }) {
  const heading = content.business_heading || "Dealers, Retailers & Distributors Welcome";
  const parts = heading.split(" ");
  const phone = content.contact_phone || "+91 7338542117";
  const wa = content.whatsapp_number || "917338542117";
  return (
    <section data-testid="business-section" className="py-12 md:py-24 bg-[#fdfbf7] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-[#0f4d2e] p-8 md:p-16 lg:p-20 text-center shadow-[0_30px_80px_-20px_rgba(15,77,46,0.4)]"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#d4a017]/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#d4a017]/10 blur-3xl" />
          <div className="grain" />

          <div className="relative">
            <p className="divider-ornament mb-5 text-[#d4a017]">Business Opportunity</p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight max-w-3xl mx-auto leading-tight">
              {parts.slice(0, -1).join(" ")}{" "}
              <span className="italic text-[#d4a017]">{parts.slice(-1)[0]}</span>
            </h2>
            <p className="mt-6 text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {content.business_body}
            </p>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center w-full">
              <a
                href={buildWhatsappFromNumber(wa, "Hi Shadrasa, I'd like to become a business partner.")}
                target="_blank"
                rel="noreferrer"
                data-testid="business-become-partner"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#d4a017] hover:bg-[#b88a14] text-white rounded-full font-semibold transition-all duration-300 px-6 md:px-8 py-3.5 md:py-4 btn-glow text-sm md:text-base"
              >
                <Handshake size={18} /> Become Partner
              </a>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                data-testid="business-contact-sales"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white border-2 border-white/40 hover:border-white text-white hover:text-[#0a331e] rounded-full font-semibold transition-all duration-300 px-6 md:px-8 py-3.5 md:py-4 text-sm md:text-base"
              >
                <Phone size={18} /> Contact Sales
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
