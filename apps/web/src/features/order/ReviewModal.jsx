import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';

export default function ReviewModal({ isOpen, onClose, order, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Đối với bản MVP, chúng ta cho phép review sản phẩm đầu tiên trong đơn
  // (Nếu đơn có nhiều SP thì cần làm 1 dropdown hoặc list chọn)
  const product = order?.items?.[0]?.product || order?.items?.[0]; 
  const productId = product?.productId || product?.id;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      toast.error("Không tìm thấy thông tin sản phẩm để đánh giá");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/reviews", {
        orderId: order.id,
        productId: productId,
        rating: rating,
        comment: comment.trim()
      });
      toast.success("Đánh giá sản phẩm thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-[500px] max-w-full mx-4 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Đánh Giá Sản Phẩm</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-5">
            {/* Chọn sao */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-gray-500">Chất lượng sản phẩm</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`${
                        star <= rating ? "fill-[#ee4d2d] text-[#ee4d2d]" : "text-gray-300"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[#ee4d2d] font-medium text-sm">
                {rating === 5 && "Tuyệt vời"}
                {rating === 4 && "Rất tốt"}
                {rating === 3 && "Bình thường"}
                {rating === 2 && "Kém"}
                {rating === 1 && "Tệ"}
              </span>
            </div>

            {/* Viết nhận xét */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét chi tiết
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này nhé..."
                rows="4"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-[#ee4d2d] focus:border-[#ee4d2d] outline-none transition-shadow"
                required
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50"
            >
              Trở lại
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-white bg-[#ee4d2d] rounded-sm hover:bg-[#d73211] disabled:opacity-50"
            >
              {isSubmitting ? "Đang gửi..." : "Hoàn thành"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
