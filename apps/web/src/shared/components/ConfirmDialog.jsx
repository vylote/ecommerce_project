import Dialog from '../ui/Dialog';

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
    <Dialog title={title} size="sm" onClose={onClose} closeOnBackdrop>
      <div className="p-6">
        {message && <p className="text-sm text-gray-600 mb-6">{message}</p>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm text-white rounded-sm ${confirmBtnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
}