import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, BadgeCheck, X } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api";

export default function Testimonials({ reviews = [] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", text: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post("/reviews", form);
      toast.success("Thank you! Your review has been submitted for approval.");
      setIsFormOpen(false);
      setForm({ name: "", location: "", text: "", rating: 5 });
    } catch (err) {
      toast.error("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section data-testid="testimonials-section" className="py-12 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="divider-ornament mb-4">Loved By Families</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#0a331e] tracking-tight mb-6 md:mb-8">
            What our <span className="italic text-[#d4a017]">customers</span> say
          </h2>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 bg-white border-2 border-[#0f4d2e] text-[#0f4d2e] hover:bg-[#0f4d2e] hover:text-white transition-colors rounded-full px-6 py-2.5 font-semibold shadow-sm"
          >
            Write a Review
          </button>
        </motion.div>

        {reviews.length === 0 ? (
          <p className="text-center text-[#6b3e1f]">No reviews yet.</p>
        ) : (
          <div className="flex overflow-x-auto pb-12 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 md:gap-8 snap-x snap-mandatory hide-scrollbar">
            {reviews.map((r, i) => (
              <motion.div
                key={r.id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: Math.min(i * 0.12, 0.6) }}
                className="relative shrink-0 w-[85vw] sm:w-[400px] snap-center rounded-2xl md:rounded-3xl bg-[#fdfbf7] p-6 md:p-10 border border-[#6b3e1f]/10 hover:border-[#d4a017]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(15,77,46,0.12)] flex flex-col"
              >
                <Quote size={36} className="text-[#d4a017]/35 mb-5" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} size={16} className={k < r.rating ? "fill-[#d4a017] text-[#d4a017]" : "text-gray-300"} />
                  ))}
                </div>
                <p className="text-[#4a453f] leading-relaxed mb-7 italic flex-grow">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-[#6b3e1f]/10">
                  {r.image ? (
                    <img src={r.image} alt={r.name} className="h-12 w-12 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-[#0f4d2e] text-white font-display font-semibold flex items-center justify-center">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-[#0a331e] flex items-center gap-1.5">
                      {r.name} 
                      {r.is_verified_purchase && <BadgeCheck size={14} className="text-blue-500" title="Verified Purchase" />}
                    </p>
                    <p className="text-xs text-[#6b3e1f] uppercase tracking-wider">{r.location || "Customer"}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 relative shadow-2xl"
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-2"
              >
                <X size={20} />
              </button>
              
              <h3 className="font-display text-2xl font-semibold text-[#0a331e] mb-2">Leave a Review</h3>
              <p className="text-sm text-[#6b3e1f] mb-6">We'd love to hear about your experience.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star size={28} className={star <= form.rating ? "fill-[#d4a017] text-[#d4a017]" : "text-gray-200"} />
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block text-sm font-semibold text-[#0a331e]">
                    Name *
                    <input 
                      required 
                      type="text" 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-[#6b3e1f]/20 px-3 py-2 text-sm focus:border-[#0f4d2e] focus:ring-1 focus:ring-[#0f4d2e] outline-none" 
                    />
                  </label>
                  <label className="block text-sm font-semibold text-[#0a331e]">
                    Location
                    <input 
                      type="text" 
                      placeholder="e.g. Bangalore"
                      value={form.location} 
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-[#6b3e1f]/20 px-3 py-2 text-sm focus:border-[#0f4d2e] focus:ring-1 focus:ring-[#0f4d2e] outline-none" 
                    />
                  </label>
                </div>

                <label className="block text-sm font-semibold text-[#0a331e]">
                  Your Review *
                  <textarea 
                    required 
                    rows={4}
                    value={form.text} 
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-[#6b3e1f]/20 px-3 py-2 text-sm focus:border-[#0f4d2e] focus:ring-1 focus:ring-[#0f4d2e] outline-none" 
                  />
                </label>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full mt-4 bg-[#0f4d2e] text-white rounded-xl py-3 font-semibold hover:bg-[#0a331e] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
