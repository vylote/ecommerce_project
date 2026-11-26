import FilterTabs from "../../shared/ui/FilterTabs";
import ProductImage from "../../shared/components/ProductImage";
import useReloadableRequest from "../../shared/hooks/useReloadableRequest";
import Pagination from "../../shared/components/Pagination";
import SearchField from "../../shared/ui/SearchField";
import getDisplayImage from "../../entities/product/getDisplayImage";
import { useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';

export default function SellerProductPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1 });
  
  const [searchInput, setSearchInput] = useState(searchParams.get('keyword') || '');

  // --- LẤY URL PARAMS (Có thêm status) ---
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const keyword = searchParams.get('keyword') || '';
  const currentStatus = searchParams.get('status') || 'ALL'; // Mặc định là ALL

  const loadProducts = useCallback(async (signal) => {
    const params = { page, size: 10, sortBy, order };
    if (keyword) params.keyword = keyword;
    if (currentStatus !== 'ALL') params.status = currentStatus;

    const response = await api.get('/products/seller', { params, signal });
    if (signal.aborted) return;

    const result = response.data.result;
    setProducts(result.data);
    setPageInfo({ currentPage: result.currentPage, totalPages: result.totalPages });
  }, [page, sortBy, order, keyword, currentStatus]);
  const { loading, reload: fetchData } = useReloadableRequest(
    loadProducts,
    () => toast.error('Không thể tải danh sách sản phẩm'),
  );

  const updateParams = (newParams) => {
    const current = Object.fromEntries([...searchParams]);
    const updated = { ...current, ...newParams };
    Object.keys(updated).forEach(key => {
      // Xóa các tham số trống hoặc giá trị mặc định 'ALL' để URL sạch đẹp
      if (updated[key] === null || updated[key] === undefined || updated[key] === '' || updated[key] === 'ALL') {
        delete updated[key];
      }
    });
    setSearchParams(updated);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageInfo.totalPages) updateParams({ page: newPage });
  };

  const handleSort = (type) => {
    const newOrder = (sortBy === type && order === 'desc') ? 'asc' : 'desc';
    updateParams({ sortBy: type, order: newOrder, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ keyword: searchInput, page: 1 });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;
    
    try {
      await api.delete(`/products/${id}`);
      toast.success('Xóa sản phẩm thành công');
      fetchData(); 
    } catch {
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  // --- MẢNG CẤU HÌNH TABS ---
  const STATUS_TABS = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'INACTIVE', label: 'Chưa hoạt động (Ẩn)' },
    { value: 'OUT_OF_STOCK', label: 'Hết hàng' }
  ];

  return (
    <div className="pb-20 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-base-content">Quản lý Sản phẩm</h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 md:w-[300px]">
            <SearchField value={searchInput} onChange={setSearchInput} placeholder="Tìm tên sản phẩm..." />
          </form>
          <Link to="/seller/product/add" className="btn btn-sm bg-primary hover:bg-secondary text-white border-none flex items-center gap-1">
            <Plus size={16} /> Thêm mới
          </Link>
        </div>
      </div>

      <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm overflow-hidden w-full">
        
        <div className="border-b border-base-300">
          <FilterTabs
            label="Lọc trạng thái sản phẩm"
            options={STATUS_TABS}
            value={currentStatus}
            onChange={(status) => updateParams({ status, page: 1 })}
          />
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-base-content/80">
            <thead className="bg-base-200 text-base-content/85 font-medium">
              <tr>
                <th className="px-5 py-4">Tên sản phẩm</th>
                <th className="px-5 py-4 cursor-pointer hover:text-secondary" onClick={() => handleSort('price')}>
                  Giá {sortBy === 'price' && (order === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-5 py-4 cursor-pointer hover:text-secondary" onClick={() => handleSort('stockQuantity')}>
                  Kho hàng {sortBy === 'stockQuantity' && (order === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-5 py-4 cursor-pointer hover:text-secondary" onClick={() => handleSort('soldCount')}>
                  Đã bán {sortBy === 'soldCount' && (order === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-5 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-base-300">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-5 py-4"><div className="skeleton h-12 w-full rounded-sm"></div></td>
                    <td className="px-5 py-4"><div className="skeleton h-5 w-20"></div></td>
                    <td className="px-5 py-4"><div className="skeleton h-5 w-16"></div></td>
                    <td className="px-5 py-4"><div className="skeleton h-5 w-16"></div></td>
                    <td className="px-5 py-4"><div className="skeleton h-8 w-20 mx-auto"></div></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center text-base-content/70">
                    <div className="text-4xl mb-3 opacity-50">📋</div>
                    <p>Không tìm thấy sản phẩm nào.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-base-200 transition-colors">
                    <td className="px-5 py-4 min-w-[300px]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-sm border border-base-300 overflow-hidden shrink-0 bg-base-200">
                          <ProductImage src={getDisplayImage(product)} alt={product.name} />
                        </div>
                        <div className="flex flex-col">
                          <Link to={`/product/${product.id}`} className="font-medium text-base-content hover:text-secondary line-clamp-2">
                            {product.name}
                          </Link>
                          {/* --- BỔ SUNG: HUY HIỆU HIỂN THỊ CỜ TRẠNG THÁI (UX) --- */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-base-content/60">ID: {product.id}</span>
                            {product.status === 'INACTIVE' && (
                              <span className="px-1.5 py-0.5 bg-base-300 text-base-content/80 text-[10px] rounded-sm font-semibold">ĐÃ ẨN</span>
                            )}
                            {product.stockQuantity === 0 && product.status === 'ACTIVE' && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-sm font-semibold">HẾT HÀNG</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-base-content font-medium">
                      ₫{product.price?.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-5 py-4">
                      {product.stockQuantity === 0 ? (
                        <span className="text-red-500 font-medium">0</span>
                      ) : (
                        <span>{product.stockQuantity}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">{product.soldCount}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-secondary hover:bg-primary/10 rounded transition-colors" title="Sửa">
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && pageInfo.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pageInfo.totalPages}
            onPageChange={handlePageChange}
            className="border-t border-base-300 !justify-center"
          />
        )}
      </div>
    </div>
  );
}