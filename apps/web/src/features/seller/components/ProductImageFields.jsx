export default function ProductImageFields({ imageFiles, fileInputRef, error, onImageChange, onRemoveImage }) {
  return (
    <div>
      <label className="block font-semibold text-sm text-gray-700 mb-2">
        Hình ảnh sản phẩm ({imageFiles.length}/9) <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-3 items-center">
        {imageFiles.map((img, idx) => (
          <div
            key={idx}
            className="relative w-24 h-24 border rounded-md overflow-hidden group shadow-sm"
          >
            <img
              src={img.previewUrl}
              alt={`preview-${idx}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(idx)}
              className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 hover:bg-red-500"
            >
              Xóa
            </button>
            {idx === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[10px] font-semibold text-center py-0.5">
                Ảnh bìa
              </span>
            )}
          </div>
        ))}

        {imageFiles.length < 9 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors ${
              error
                ? "border-red-400 bg-red-50 text-red-500"
                : "border-green-600 text-green-600 hover:bg-green-50"
            }`}
          >
            <span className="text-xs mt-1 font-medium">Thêm ảnh</span>
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      )}
      <input
        type="file"
        multiple
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={onImageChange}
      />
    </div>
  );
}
