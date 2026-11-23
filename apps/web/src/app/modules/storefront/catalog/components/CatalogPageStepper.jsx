export default function CatalogPageStepper({ page, currentPage, totalPages, onPageChange }) {
  return (
    <nav aria-label="Trang kết quả" className="flex items-center gap-4 text-sm">
      <span><span className="text-primary">{currentPage}</span> / {totalPages}</span>
      <div className="join">
        <button type="button" className="join-item btn btn-sm btn-outline border-base-300 bg-base-100" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Trước
        </button>
        <button type="button" className="join-item btn btn-sm btn-outline border-base-300 bg-base-100" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Sau
        </button>
      </div>
    </nav>
  );
}
