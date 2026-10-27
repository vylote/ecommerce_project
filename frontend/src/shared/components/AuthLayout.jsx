import { Link } from "react-router-dom";
import { ShoppingBag, ShieldCheck } from "lucide-react";
import { useI18n } from "../i18n";

export default function AuthLayout({ children, bgImage }) {
  const defaultBg = "/auth-bg.jpg"; 
  const finalBg = bgImage || defaultBg;
  const { lang, changeLanguage } = useI18n();

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center p-4 sm:p-6 overflow-hidden bg-slate-950 font-sans selection:bg-[#22B14C] selection:text-white">
      {/* Background Image with Dark Depth Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 filter blur-[2px] transition-transform duration-1000"
        style={{ backgroundImage: `url('${finalBg}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/90 backdrop-blur-sm" />

      {/* Dynamic Ambient Glows */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-[#22B14C]/25 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-[#22B14C]/15 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[#0E7C3F]/25 blur-[120px]" />

      {/* Top Header bar: Brand & Language Switcher */}
      <header className="relative w-full max-w-5xl mx-auto flex items-center justify-between z-20 py-2">
        <Link 
          to="/" 
          className="group flex items-center gap-2.5 text-white transition-transform hover:scale-105 active:scale-100"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0E7C3F] to-[#22B14C] flex items-center justify-center text-white shadow-lg shadow-[#22B14C]/30 group-hover:shadow-[#22B14C]/50 transition-shadow">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-wider text-white flex items-center gap-1">
              ECOMMERCE
            </span>
            <span className="text-[10px] tracking-widest text-[#7ED957] font-medium uppercase -mt-1">
              Premium Marketplace
            </span>
          </div>
        </Link>

        {/* Language selector badge */}
        <div className="flex items-center gap-1 bg-white/10 hover:bg-white/15 backdrop-blur-md p-1 rounded-full border border-white/20 text-white text-xs shadow-lg transition-all">
          <button
            type="button"
            onClick={() => changeLanguage("vi")}
            className={`px-3 py-1 rounded-full cursor-pointer text-xs font-semibold transition-all ${
              lang === "vi" 
                ? "bg-[#22B14C] text-white shadow-md shadow-[#22B14C]/40" 
                : "text-white/80 hover:text-white"
            }`}
          >
            🇻🇳 Tiếng Việt
          </button>
          <button
            type="button"
            onClick={() => changeLanguage("en")}
            className={`px-3 py-1 rounded-full cursor-pointer text-xs font-semibold transition-all ${
              lang === "en" 
                ? "bg-[#22B14C] text-white shadow-md shadow-[#22B14C]/40" 
                : "text-white/80 hover:text-white"
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </header>

      {/* Main Card Container (Đã bỏ viền xanh trên top) */}
      <main className="relative z-10 w-full max-w-[440px] my-6">
        <div className="relative rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden transition-all">
          {children}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-20 w-full text-center text-xs text-white/50 py-2 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#22B14C]" />
        <span>End-to-End SSL 256-bit Encrypted Protection</span>
      </footer>
    </div>
  );
}