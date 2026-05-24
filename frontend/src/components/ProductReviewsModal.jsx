import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { apiClient, formatApiError } from "../lib/api";

export default function ProductReviewsModal({ open, onOpenChange, product }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    if (open && product?.id) {
      loadReviews();
    } else {
      setIsWriting(false);
    }
  }, [open, product]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/product-reviews/${product.id}`);
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.name || !form.comment) {
      toast.error("Please fill in your name and review");
      return;
    }
    
    setSubmitLoading(true);
    try {
      await apiClient.post("/product-reviews", {
        product_id: product.id,
        name: form.name,
        rating: form.rating,
        comment: form.comment,
      });
      toast.success("Review submitted successfully!");
      setForm({ name: "", rating: 5, comment: "" });
      setIsWriting(false);
      loadReviews();
      // force reload the page or state for the summary to update if we want,
      // but it will update next time they visit.
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderStars = (ratingValue, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const num = i + 1;
          const active = num <= ratingValue;
          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && setForm({ ...form, rating: num })}
              className={`focus:outline-none ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
            >
              <Star 
                size={interactive ? 24 : 14} 
                className={active ? "text-[#d4a017] fill-[#d4a017]" : "text-gray-200 fill-gray-200"} 
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-white !w-[92vw] sm:!w-full !max-w-[500px] !p-0 !overflow-hidden border border-[#0f4d2e]/15 !rounded-2xl [&>button]:hidden">
        <div className="relative bg-[#0f5132] text-white px-4 py-4 text-center">
          <button 
            className="absolute top-[12px] right-[12px] bg-white text-black border-none rounded-full w-[28px] h-[28px] text-[16px] cursor-pointer flex items-center justify-center leading-none shadow-sm hover:bg-gray-100" 
            onClick={(e) => { e.preventDefault(); onOpenChange(false); }}
          >
            ✕
          </button>
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-white mt-1">
              {isWriting ? "Write a Review" : "Customer Reviews"}
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-4 sm:p-6 bg-[#fdfbf7] max-h-[60vh] overflow-y-auto">
          {!isWriting ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-[#0a331e]">{product?.name}</h3>
                <button 
                  onClick={() => setIsWriting(true)}
                  className="bg-[#0f4d2e] text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-[#d4a017] transition-colors"
                >
                  Write Review
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-[#6b3e1f]">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-[#6b3e1f]/10">
                  <Star size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-[#6b3e1f] font-medium">No reviews yet.</p>
                  <p className="text-xs text-[#6b3e1f]/60 mt-1">Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-white p-4 rounded-xl border border-[#6b3e1f]/10 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm text-[#0a331e]">{r.name}</p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {renderStars(r.rating)}
                      </div>
                      <p className="text-sm text-[#4a453f] whitespace-pre-wrap leading-relaxed mt-2">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={submitReview} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#6b3e1f] mb-1.5">
                  Your Rating
                </label>
                <div className="bg-white p-3 rounded-xl border border-[#6b3e1f]/20 inline-block">
                  {renderStars(form.rating, true)}
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#6b3e1f] mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full rounded-xl border border-[#ccc] px-3 py-2.5 text-sm focus:outline-none focus:border-[#0f5132]"
                  placeholder="e.g. Murthy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#6b3e1f] mb-1.5">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.comment}
                  onChange={(e) => setForm({...form, comment: e.target.value})}
                  className="w-full rounded-xl border border-[#ccc] px-3 py-2.5 text-sm focus:outline-none focus:border-[#0f5132]"
                  placeholder="Tell us what you think about this product..."
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[#0f4d2e]/20 text-[#0f4d2e] hover:bg-[#0f4d2e]/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[#0f4d2e] text-white hover:bg-[#0a331e] disabled:opacity-60 transition-colors shadow-md"
                >
                  {submitLoading ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
