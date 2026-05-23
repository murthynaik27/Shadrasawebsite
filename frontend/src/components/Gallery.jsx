import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";

export default function Gallery({ gallery = [] }) {
  const [selected, setSelected] = useState(null);

  if (!gallery || gallery.length === 0) return null;
  return (
    <section id="gallery" data-testid="gallery-section" className="py-12 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="divider-ornament mb-4">Glimpses of Shadrasa</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#0a331e] tracking-tight">
            Our <span className="italic text-[#d4a017]">Gallery</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] sm:auto-rows-[180px] md:auto-rows-[220px] gap-2 md:gap-4">
          {gallery.map((item, i) => {
            // make the first one span larger dynamically, or just use grid automatically
            const span = i === 0 ? "md:col-span-2 md:row-span-2" : (i === 5 ? "md:col-span-2" : "");
            return (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => setSelected(item)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer ${span}`}
              >
                {item.type === "video" ? (
                  <video src={item.url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" muted loop playsInline />
                ) : (
                  <img src={item.url} alt={item.title || ""} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a331e]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                  {item.type === "video" && <Play className="text-white mb-2" size={24} />}
                  {item.title && <p className="text-white font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.title}</p>}
                  {item.category && <p className="text-[#d4a017] text-xs font-bold uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{item.category}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-8"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-black/50 p-2 rounded-full"
              >
                <X size={24} />
              </button>
              
              <div 
                className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                {selected.type === "video" ? (
                  <video src={selected.url} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
                ) : (
                  <img src={selected.url} alt={selected.title || "Gallery image"} className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain" />
                )}
                
                {(selected.title || selected.category) && (
                  <div className="mt-4 text-center">
                    {selected.title && <h3 className="text-white font-display text-xl md:text-2xl">{selected.title}</h3>}
                    {selected.category && <p className="text-[#d4a017] text-sm font-bold uppercase tracking-widest mt-1">{selected.category}</p>}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
