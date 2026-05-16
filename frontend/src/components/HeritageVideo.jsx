import { motion } from "framer-motion";
import { Play } from "lucide-react";

const DEFAULT = "https://images.pexels.com/photos/16300779/pexels-photo-16300779.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900";

export default function HeritageVideo({ content = {} }) {
  const heading = content.heritage_heading || "From the lush green lands of Malenadu";
  const parts = heading.split(" ");
  return (
    <section
      data-testid="heritage-section"
      className="relative h-[80vh] min-h-[520px] flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-fixed"
        style={{
          backgroundImage: `url(${content.heritage_image || DEFAULT})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a331e]/70 via-[#0a331e]/50 to-[#0a331e]/80" />
      <div className="grain" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9 }}
        className="relative z-10 text-center max-w-3xl px-6"
      >
        <p className="divider-ornament mb-6 text-[#f5e7c2]">{content.heritage_eyebrow || "Experience Shadrasa"}</p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-7 leading-tight">
          {parts.slice(0, -1).join(" ")}{" "}
          <span className="italic text-[#d4a017]">{parts.slice(-1)[0]}</span>
        </h2>
        <p className="text-white/85 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-2xl mx-auto whitespace-pre-line">
          {content.heritage_body}
        </p>
        <button
          data-testid="heritage-play-btn"
          className="group inline-flex items-center gap-4 bg-white/10 backdrop-blur-md hover:bg-[#d4a017] border-2 border-white/40 hover:border-[#d4a017] text-white rounded-full pl-2 pr-7 py-2 transition-all duration-500"
        >
          <span className="h-12 w-12 rounded-full bg-[#d4a017] group-hover:bg-white flex items-center justify-center transition-colors">
            <Play size={20} className="text-white group-hover:text-[#0f4d2e] ml-1" fill="currentColor" />
          </span>
          <span className="font-semibold tracking-wide">{content.heritage_button_label || "Watch Brand Story"}</span>
        </button>
      </motion.div>
    </section>
  );
}
