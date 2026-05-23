import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";

const DEFAULT = "https://images.pexels.com/photos/16300779/pexels-photo-16300779.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900";

export default function HeritageVideo({ content = {} }) {
  const [playing, setPlaying] = useState(false);

  if (content.heritage_is_active === false) return null;

  const heading = content.heritage_heading || "From the lush green lands of Malenadu";
  const parts = heading.split(" ");
  const videoUrl = content.heritage_video_url;

  return (
    <>
      <section
      data-testid="heritage-section"
      className="relative h-[60vh] md:h-[80vh] min-h-[400px] md:min-h-[520px] flex items-center justify-center overflow-hidden"
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
        <p className="divider-ornament mb-4 md:mb-6 text-[10px] md:text-xs text-[#f5e7c2]">{content.heritage_eyebrow || "Experience Shadrasa"}</p>
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 md:mb-7 leading-tight">
          {parts.slice(0, -1).join(" ")}{" "}
          <span className="italic text-[#d4a017]">{parts.slice(-1)[0]}</span>
        </h2>
        <p className="text-white/85 text-sm md:text-xl font-light leading-relaxed mb-8 md:mb-10 max-w-2xl mx-auto whitespace-pre-line">
          {content.heritage_body}
        </p>
        <div className="flex justify-center">
          <button
            data-testid="heritage-play-btn"
            onClick={() => setPlaying(true)}
            className="w-full sm:w-auto group inline-flex items-center gap-3 md:gap-4 bg-white/10 backdrop-blur-md hover:bg-[#d4a017] border-2 border-white/40 hover:border-[#d4a017] text-white rounded-full pl-2 pr-6 md:pr-7 py-2 transition-all duration-500"
          >
            <span className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#d4a017] group-hover:bg-white flex items-center justify-center transition-colors flex-shrink-0">
              <Play className="text-white group-hover:text-[#0f4d2e] ml-1 w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
            </span>
            <span className="font-semibold tracking-wide text-sm md:text-base">{content.heritage_button_label || "Watch Brand Story"}</span>
          </button>
        </div>
      </motion.div>
    </section>

    <AnimatePresence>
      {playing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPlaying(false)}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-8"
        >
          <button
            onClick={() => setPlaying(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-black/50 p-2 rounded-full z-50"
          >
            <X size={24} />
          </button>
          <div 
            className="relative w-full max-w-5xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {videoUrl ? (
              videoUrl.includes("youtube") || videoUrl.includes("youtu.be") ? (
                <iframe 
                  src={videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} 
                  className="w-full aspect-video rounded-lg shadow-2xl"
                  allow="autoplay; fullscreen"
                />
              ) : (
                <video src={videoUrl} controls autoPlay className="w-full max-h-[80vh] rounded-lg shadow-2xl bg-black" />
              )
            ) : (
              <div className="bg-[#fdfbf7] p-10 rounded-2xl text-center max-w-lg">
                <h3 className="font-display text-2xl text-[#0a331e] mb-2">Video Coming Soon</h3>
                <p className="text-[#6b3e1f]">The brand story video is currently being updated. Please check back later.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
