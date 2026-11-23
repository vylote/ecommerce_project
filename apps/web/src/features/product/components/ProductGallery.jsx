import { useEffect, useRef, useState } from "react";
import ProductImage from "../../../shared/components/ProductImage";

export default function ProductGallery({ images = [], name }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const thumbnailStrip = useRef(null);
  const sortedImages = [...(images ?? [])].sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)));
  const total = sortedImages.length;
  const activeIndex = Math.min(index, Math.max(0, total - 1));

  useEffect(() => {
    if (paused || total < 2) return;
    const timer = window.setTimeout(() => setIndex((activeIndex + 1) % total), 3500);
    return () => window.clearTimeout(timer);
  }, [activeIndex, paused, total]);

  useEffect(() => {
    const strip = thumbnailStrip.current;
    const active = strip?.children[activeIndex];
    if (!active) return;
    const offset = active.offsetLeft - strip.scrollLeft;
    if (offset < 0) strip.scrollLeft += offset;
    if (offset + active.offsetWidth > strip.clientWidth) {
      strip.scrollLeft += offset + active.offsetWidth - strip.clientWidth;
    }
  }, [activeIndex]);

  return (
    <section
      aria-label="Hình ảnh sản phẩm"
      className="w-full max-w-[400px] shrink-0"
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <figure className="relative mb-3 aspect-square overflow-hidden bg-base-200">
        <ProductImage src={sortedImages[activeIndex]?.url} alt={name} />
        {total > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden="true">
            {sortedImages.map((image, i) => (
              <span key={image.id ?? i} className={`h-1.5 w-1.5 rounded-full ${i === activeIndex ? "bg-primary" : "bg-white/70"}`} />
            ))}
          </div>
        )}
      </figure>
      {total > 0 && (
        <div ref={thumbnailStrip} className="relative flex gap-2 overflow-x-auto py-1">
          {sortedImages.map((image, i) => (
            <button
              key={image.id ?? i}
              type="button"
              aria-label={`Xem ảnh ${i + 1} / ${total}`}
              aria-pressed={i === activeIndex}
              onMouseEnter={() => setIndex(i)}
              onClick={() => setIndex(i)}
              className={`h-[74px] w-[74px] shrink-0 border-2 transition-colors focus-visible:outline-primary ${i === activeIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <ProductImage src={image.url} alt="" />
            </button>
          ))}
        </div>
      )}
      {total > 1 && (
        <div className="flex justify-between">
          <button type="button" className="btn btn-ghost btn-xs" onClick={() => setIndex((activeIndex + total - 1) % total)}>Ảnh trước</button>
          <button type="button" className="btn btn-ghost btn-xs" onClick={() => setIndex((activeIndex + 1) % total)}>Ảnh sau</button>
        </div>
      )}
    </section>
  );
}
