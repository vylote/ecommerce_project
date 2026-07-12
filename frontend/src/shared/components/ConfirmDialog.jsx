import React from 'react';

/**
 * Dialog xác nhận dùng chung, thay cho window.confirm.
 *
 * Cách dùng:
 *   const [confirmState, setConfirmState] = useState(null);
 *   setConfirmState({
 *     title: 'Hủy đơn hàng',
 *     message: 'Bạn chắc chắn muốn hủy đơn hàng này?',
 *     confirmText: 'Hủy đơn',
 *     variant: 'danger',
 *     onConfirm: () => doSomething(),
 *   });
 *   ...
 *   <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
 */
export default function ConfirmDialog({ state, onClose }) {
  if (!state) return null;

  const {
    title = 'Xác nhận',
    message,
    confirmText = 'Đồng ý',
    cancelText = 'Hủy',
    variant = 'primary', // 'primary' | 'danger'
    onConfirm,
  } = state;

  const handleConfirm = async () => {
    await onConfirm?.();
    onClose();
  };

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-500 hover:bg-red-600'
      : 'bg-[#ee4d2d] hover:bg-[#d73211]';

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm shadow-lg w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
        {message && <p className="text-sm text-gray-600 mb-6">{message}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm text-white rounded-sm ${confirmBtnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}