import { useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1").replace(/\/+$/, "");
const PRODUCT_FALLBACK_IMAGE = `${API_BASE_URL}/images/products/no-thumbnail.png`;

export default function ProductImage({ src, alt, className = "w-full h-full object-cover", style, onLoad, ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const imageSrc = src && src !== failedSrc ? src : PRODUCT_FALLBACK_IMAGE;
  const isFallback = imageSrc === PRODUCT_FALLBACK_IMAGE;

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        ...(isFallback ? { objectFit: "contain" } : {}),
        ...(fallbackFailed && isFallback ? { visibility: "hidden" } : {}),
      }}
      onLoad={(event) => {
        setFallbackFailed(false);
        onLoad?.(event);
      }}
      onError={() => {
        if (imageSrc === PRODUCT_FALLBACK_IMAGE) {
          setFallbackFailed(true);
        } else {
          setFailedSrc(src);
        }
      }}
    />
  );
}
