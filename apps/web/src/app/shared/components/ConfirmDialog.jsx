import { useState } from 'react';
import Dialog, { DialogActions } from '../ui/Dialog';

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
  const [busy, setBusy] = useState(false);
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
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm?.();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-error hover:bg-error/90'
      : 'bg-secondary hover:bg-secondary/90';

  return (
    <Dialog title={title} size="sm" onClose={onClose} busy={busy} closeOnBackdrop>
      {message && <p className="p-6 text-sm text-gray-600">{message}</p>}
      <DialogActions>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="px-4 py-2 text-sm border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleConfirm}
          className={`px-4 py-2 text-sm text-white rounded-sm ${confirmBtnClass}`}
        >
          {confirmText}
        </button>
      </DialogActions>
    </Dialog>
  );
}