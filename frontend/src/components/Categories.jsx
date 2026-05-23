import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Categories({ categories = [], loading = false }) {
  if (!loading && (!categories || categories.length === 0)) return null;

  return (
    <section id="products" data-testid="categories-section" className="pt-24 md:pt-32 pb-12 md:pb-16 bg-[#fdfbf7] min-h-[500px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 md:mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-[#0a331e] tracking-tight">
            Our Offerings
          </h2>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col rounded-xl md:rounded-2xl overflow-hidden bg-white border border-[#6b3e1f]/10 shadow-sm">
                <div className="aspect-square bg-gray-100 p-1.5 md:p-4 pb-0">
                  <div className="w-full h-full bg-gray-200 rounded-t-lg md:rounded-t-xl"></div>
                </div>
                <div className="px-3 py-3 md:px-6 md:py-5 bg-white">
                  <div className="h-4 md:h-5 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link 
                  to={`/category/${cat.slug || cat.id}`}
                  className="group block relative rounded-xl md:rounded-2xl overflow-hidden bg-white border border-[#6b3e1f]/10 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <div className="aspect-square bg-[#fdfbf7] p-1.5 md:p-4 pb-0">
                    <div className="w-full h-full relative rounded-t-lg md:rounded-t-xl overflow-hidden">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#fdfbf7] flex items-center justify-center border border-dashed border-[#6b3e1f]/20">
                          <span className="text-[#6b3e1f]/50 text-sm font-semibold">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-3 md:px-6 md:py-5 bg-gradient-to-t from-[#fdfbf7] to-white flex items-center gap-1.5 md:gap-2 text-sm md:text-base text-[#6b3e1f] font-semibold transition-colors duration-300 group-hover:text-[#0f4d2e]">
                    <span className="line-clamp-1">{cat.name}</span> <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
