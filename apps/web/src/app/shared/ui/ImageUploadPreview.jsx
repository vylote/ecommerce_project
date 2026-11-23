export default function ImageUploadPreview({ src, alt, label, accept, onChange, children }) {
  return (
    <>
      {src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : children}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-white text-xs font-medium">{label}</span>
      </div>
      <input
        type="file"
        className="absolute inset-0 opacity-0 cursor-pointer"
        aria-label={label}
        accept={accept}
        onChange={onChange}
      />
    </>
  );
}
