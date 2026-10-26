import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = null,
  pageSize = 10,
  onPageChange,
  onPageSizeChange = null,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}) {
  if (totalPages <= 0 && (!totalItems || totalItems === 0)) return null;

  // Tính toán khoảng hiển thị (Start - End)
  const startItem = totalItems !== null ? Math.min((currentPage - 1) * pageSize + 1, totalItems) : null;
  const endItem = totalItems !== null ? Math.min(currentPage * pageSize, totalItems) : null;

  // Thuật toán hiển thị dải số trang thông minh
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-xs text-gray-600 ${className}`}>
      {/* Thông tin hiển thị */}
      <div className="flex items-center gap-3">
        {totalItems !== null && (
          <span className="font-medium text-gray-500">
            Hiển thị <span className="font-bold text-gray-800">{startItem}</span> -{' '}
            <span className="font-bold text-gray-800">{endItem}</span> trên tổng số{' '}
            <span className="font-bold text-gray-800">{totalItems}</span> bản ghi
          </span>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-gray-400">Số lượng:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="select select-xs select-bordered focus:border-blue-500 bg-white"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Điều hướng số trang */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Đầu tiên */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="btn btn-xs btn-outline border-gray-200 text-gray-500 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-300 p-1 rounded"
            title="Trang đầu"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Trang trước */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-xs btn-outline border-gray-200 text-gray-500 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-300 p-1 rounded"
            title="Trang trước"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Dải số trang */}
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 font-bold select-none">
                  ...
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`btn btn-xs min-w-[28px] h-7 rounded font-medium transition-colors ${
                  isActive
                    ? 'bg-[#3b82f6] text-white border-none shadow-xs hover:bg-blue-600'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Trang tiếp */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-xs btn-outline border-gray-200 text-gray-500 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-300 p-1 rounded"
            title="Trang sau"
          >
            <ChevronRight size={14} />
          </button>

          {/* Cuối cùng */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="btn btn-xs btn-outline border-gray-200 text-gray-500 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-300 p-1 rounded"
            title="Trang cuối"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
