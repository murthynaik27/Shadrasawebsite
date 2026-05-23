import { motion } from "framer-motion";
import { Sparkles, Leaf } from "lucide-react";

const DEFAULT_IMG = "https://static.prod-images.emergentagent.com/jobs/cc798c37-0d6b-4dd4-bae2-7f1634f5fc87/images/31a9bf84392f042b3f2a3f227f2e1dc646946f3e87f197b0643d501b21dfef8f.png";

export default function About({ content = {} }) {
  const heading = content.about_heading || "About Shadrasa";
  const parts = heading.split(" ");
  return (
    <section id="about" data-testid="about-section" className="pt-12 md:pt-16 pb-16 md:pb-24 bg-[#fdfbf7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-[#d4a017] rounded-3xl -z-10" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#0f4d2e]/10 rounded-3xl -z-10" />
            <img
              src={content.about_image || DEFAULT_IMG}
              alt="About Shadrasa"
              className="rounded-3xl w-full h-[520px] object-cover shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <p className="divider-ornament justify-start mb-6"><span style={{display:'none'}}/>{content.about_eyebrow || "Our Story"}</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[#0a331e] tracking-tight mb-6">
              {parts.slice(0, -1).join(" ")}{" "}
              <span className="italic text-[#0f4d2e]">{parts.slice(-1)[0]}</span>
            </h2>
            <p className="text-[#4a453f] text-lg leading-relaxed mb-8 whitespace-pre-line">
              {content.about_body}
            </p>

            <div className="grid grid-cols-2 gap-3 md:gap-6">
              <div data-testid="about-mission" className="rounded-xl md:rounded-2xl bg-white p-4 md:p-6 border border-[#6b3e1f]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center h-full">
                <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-[#0f4d2e] flex items-center justify-center mb-3 md:mb-4">
                  <Sparkles className="text-[#d4a017] w-5 h-5" />
                </div>
                <h3 className="font-display text-base md:text-xl font-semibold text-[#0a331e] mb-1.5 md:mb-2">
                  {content.mission_title || "Our Mission"}
                </h3>
                <p className="text-[11px] md:text-sm text-[#4a453f] leading-relaxed flex-1">{content.mission_body}</p>
              </div>
              <div data-testid="about-vision" className="rounded-xl md:rounded-2xl bg-white p-4 md:p-6 border border-[#6b3e1f]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center h-full">
                <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-[#d4a017] flex items-center justify-center mb-3 md:mb-4">
                  <Leaf className="text-white w-5 h-5" />
                </div>
                <h3 className="font-display text-base md:text-xl font-semibold text-[#0a331e] mb-1.5 md:mb-2">
                  {content.vision_title || "Our Vision"}
                </h3>
                <p className="text-[11px] md:text-sm text-[#4a453f] leading-relaxed flex-1">{content.vision_body}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
