import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { getImageUrl } from "../../lib/api";

export default function OptimizedImage({ 
  src, 
  blurData, 
  alt, 
  className = "", 
  priority = false,
  containerClassName = ""
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Reset state if src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (imgRef.current?.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
      } else if (imgRef.current.naturalWidth === 0 && imgRef.current.src) {
        // Only set error if it actually tried to load something
        // setHasError(true);
      }
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${containerClassName} bg-[#f5e7c2]/30`}>
      {/* 1. Base Layer: CSS Shimmer Skeleton (shown until image loads or errors) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 animate-pulse bg-gradient-to-r from-[#fdfbf7] via-[#f5e7c2]/40 to-[#fdfbf7] background-size-200" />
      )}

      {/* 2. Base Layer: Fallback Icon on Error */}
      {hasError && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#fdfbf7]">
          <ImageIcon className="w-1/4 h-1/4 text-[#6b3e1f]/20" />
        </div>
      )}

      {/* 3. Middle Layer: Tiny Base64 Blur Preview (shown immediately if available, hidden once loaded) */}
      <AnimatePresence>
        {!isLoaded && !hasError && blurData && (
          <motion.img
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            src={blurData}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-cover z-10 blur-xl scale-110 ${className}`}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* 4. Top Layer: The Actual Image */}
      {src && !hasError && (
        <img
          ref={imgRef}
          src={getImageUrl(src)}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            console.error("Image failed to load:", e.target.src);
            setHasError(true);
          }}
          className={`relative z-20 w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"} ${className}`}
        />
      )}
    </div>
  );
}
