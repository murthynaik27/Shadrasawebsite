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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex flex-col rounded-2xl overflow-hidden bg-white border border-[#6b3e1f]/10 shadow-sm">
                <div className="aspect-square bg-gray-100 p-2 md:p-4 pb-0">
                  <div className="w-full h-full bg-gray-200 rounded-t-xl"></div>
                </div>
                <div className="px-6 py-5 bg-white">
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                  className="group block relative rounded-2xl overflow-hidden bg-white border border-[#6b3e1f]/10 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <div className="aspect-square bg-[#fdfbf7] p-2 md:p-4 pb-0">
                    <div className="w-full h-full relative rounded-t-xl overflow-hidden">
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
                  <div className="px-6 py-5 bg-gradient-to-t from-[#fdfbf7] to-white flex items-center gap-2 text-[#6b3e1f] font-semibold transition-colors duration-300 group-hover:text-[#0f4d2e]">
                    {cat.name} <ArrowRight size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
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
