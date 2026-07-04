import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../../shared/utils/api";

const API_URL = import.meta.env.VITE_API_URL;

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const carouselRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.result);
        setTimeout(checkScrollability, 150);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const checkScrollability = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setCanScrollLeft(scrollLeft > 2);
        setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
      }
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const { clientWidth } = carouselRef.current;
      const scrollAmount =
        direction === "left" ? -(clientWidth * 0.8) : clientWidth * 0.8;
      carouselRef.current.scrollBy({ left: scrollAmount });
    }
  };

  const buildImageUrl = (category) => {
    if (!category.imageUrl) return null;
    const fileName = category.imageUrl.startsWith("/")
      ? category.imageUrl.substring(1)
      : category.imageUrl;
    return `${API_URL}/images/categories/${fileName}`;
  };

  if (loading) {
    return (
      <div className="bg-base-100 rounded-xl border border-base-200 shadow-sm p-4">
        <div className="skeleton h-5 w-32 mb-4"></div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 w-[110px] shrink-0"
            >
              <div className="skeleton w-[72px] h-[72px] rounded-2xl"></div>
              <div className="skeleton h-3 w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-sm border border-base-200 shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-base font-medium text-neutral/70 uppercase tracking-wide">
          Danh Mục
        </h3>
      </div>

      {/* Wrapper với group để trigger hover */}
      <div className="relative group">
        <div
          ref={carouselRef}
          onScroll={checkScrollability}
          className="overflow-x-auto no-scrollbar scroll-smooth"
          style={{
            display: "grid",
            gridTemplateRows: "repeat(2, 1fr)",
            gridAutoFlow: "column",
            gridAutoColumns: "110px",
          }}
        >
          {categories.map((category) => (
            <Link
              to={`/category/${category.id}`}
              key={category.id}
              className="flex flex-col items-center justify-start py-4 px-1 rounded-lg border border-transparent hover:border-base-300 hover:bg-base-200/40 transition-colors cursor-pointer"
            >
              <div className="w-[72px] h-[72px] mb-3 overflow-hidden rounded-2xl bg-base-100 flex items-center justify-center">
                {category.imageUrl ? (
                  <img
                    src={buildImageUrl(category)}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl opacity-30">📦</span>
                )}
              </div>
              <span className="text-sm text-neutral/80 text-center line-clamp-2 px-2 leading-tight">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Nút Prev chỉ hiện khi có thể cuộn trái */}
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Cuộn sang trái"
            onClick={() => scroll("left")}
            className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 flex items-center justify-center rounded-full bg-base-100 shadow transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Nút Next chỉ hiện khi có thể cuộn phải */}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Cuộn sang phải"
            onClick={() => scroll("right")}
            className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 flex items-center justify-center rounded-full bg-base-100 shadow transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
