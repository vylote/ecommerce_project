import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function useShopFormFields(setShopData) {
  const preview = useRef(null);
  useEffect(() => () => {
    if (preview.current) URL.revokeObjectURL(preview.current);
  }, []);

  const toggleCategory = (categoryId) => {
    setShopData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 2MB');
        return;
      }
      if (preview.current) URL.revokeObjectURL(preview.current);
      const previewUrl = URL.createObjectURL(file);
      preview.current = previewUrl;
      setShopData(prev => ({
        ...prev,
        file,
        previewUrl
      }));
    }
  };

  return { toggleCategory, handleFileChange };
}
