import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { apiClient } from "../lib/api";

export default function ProductRating({ productId, onClick }) {
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!productId) return;
    apiClient.get(`/product-reviews/summary/${productId}`)
      .then(res => {
        setRating(res.data.average_rating || 0);
        setCount(res.data.total_reviews || 0);
      })
      .catch(err => console.error("Error fetching rating", err));
  }, [productId]);

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => {
      // Logic for half stars if needed, but for simplicity we fill based on floor
      // Or we can just use standard math round
      const fillThreshold = Math.floor(rating);
      const isHalf = rating - i >= 0.5 && rating - i < 1;
      
      return (
        <div key={i} className="relative inline-block">
          <Star size={12} className="text-gray-200 fill-gray-200" />
          {i < fillThreshold && (
            <Star size={12} className="absolute inset-0 text-[#d4a017] fill-[#d4a017]" />
          )}
          {isHalf && (
            <div className="absolute inset-0 overflow-hidden w-[50%]">
              <Star size={12} className="text-[#d4a017] fill-[#d4a017]" />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div 
      className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
    >
      <div className="flex items-center gap-0.5">
        {renderStars()}
      </div>
      <span className="text-[10px] md:text-xs text-[#6b3e1f] font-medium">
        {rating > 0 ? rating.toFixed(1) : ""} ({count} {count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}
