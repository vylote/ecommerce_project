import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../../i18n";

export default function StorefrontSearchForm({ className }) {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={"join " + className}>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={t("nav.search_placeholder")}
        className="input join-item w-full bg-white text-base-content border-none focus:outline-none"
      />
      <button
        type="submit"
        className="btn join-item bg-green-700 hover:bg-green-800 border-none text-white px-6"
        title={t("nav.search_button")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
          />
        </svg>
      </button>
    </form>
  );
}
