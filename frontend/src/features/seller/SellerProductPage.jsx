import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';

export default function SellerProductPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1 });
  
  const [searchInput, setSearchInput] = useState(searchParams.get('keyword') || '');

  // --- LẤY URL PARAMS (Có thêm status) ---
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const keyword = searchParams.get('keyword') || '';
  const currentStatus = searchParams.get('status') || 'ALL'; // Mặc định là ALL

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: 10,
        sortBy: sortBy,
        order: order
      };
      if (keyword) params.keyword = keyword;
      if (currentStatus !== 'ALL') params.status = currentStatus; // Gắn cờ lọc xuống DB

      const res = await api.get('/products/seller', { params });
      const pageResponse = res.data.result;
      
      setProducts(pageResponse.data);
      setPageInfo({
        currentPage: pageResponse.currentPage,
        totalPages: pageResponse.totalPages,
      });
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, order, keyword, currentStatus]); // Re-fetch khi status đổi

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
    } catch (error) {
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  const getDisplayImage = (prod) => {
    if (!prod.images || prod.images.length === 0) return null;
    const primaryImg = prod.images.find(img => img.isPrimary);
    return primaryImg ? primaryImg.url : prod.images[0].url;
  };

  // --- MẢNG CẤU HÌNH TABS ---
  const STATUS_TABS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'ACTIVE', label: 'Đang hoạt động' },
    { id: 'INACTIVE', label: 'Chưa hoạt động (Ẩn)' },
    { id: 'OUT_OF_STOCK', label: 'Hết hàng' }
  ];

  return (
    <div className="pb-20 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Sản phẩm</h2>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 md:w-[300px]">
            <input 
              type="text" 
              placeholder="Tìm tên sản phẩm..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input input-bordered input-sm w-full pl-9 focus:border-[#ee4d2d]"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>
          <Link to="/seller/product/add" className="btn btn-sm bg-[#ee4d2d] hover:bg-[#d73211] text-white border-none flex items-center gap-1">
            <Plus size={16} /> Thêm mới
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full">
        
        {/* --- RENDER TABS --- */}
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map(tab => (
            <button 
              key={tab.id}
              onClick={() => updateParams({ status: tab.id, page: 1 })} // Bấm tab -> Chuyển status -> Reset trang 1
              className={`px-6 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                currentStatus === tab.id 
                  ? 'border-[#ee4d2d] text-[#ee4d2d]' 
                  : 'border-transparent text-gray-600 hover:text-[#ee4d2d]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-medium">
              <tr>
                <th className="px-5 py-4">Tên sản phẩm</th>
                <th className="px-5 py-4 cursor-pointer hover:text-[#ee4d2d]" onClick={() => handleSort('price')}>
                  Giá {sortBy === 'price' && (order === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-5 py-4 cursor-pointer hover:text-[#ee4d2d]" onClick={() => handleSort('stockQuantity')}>
                  Kho hàng {sortBy === 'stockQuantity' && (order === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-5 py-4 cursor-pointer hover:text-[#ee4d2d]" onClick={() => handleSort('soldCount')}>
                  Đã bán {sortBy === 'soldCount' && (order === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-5 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
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
                  <td colSpan="5" className="px-5 py-16 text-center text-gray-500">
                    <div className="text-4xl mb-3 opacity-50">📋</div>
                    <p>Không tìm thấy sản phẩm nào.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 min-w-[300px]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-sm border border-gray-200 overflow-hidden shrink-0 bg-base-200">
                          {getDisplayImage(product) ? (
                            <img src={getDisplayImage(product)} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="flex h-full items-center justify-center text-xs text-gray-400">No Img</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <Link to={`/product/${product.id}`} className="font-medium text-gray-800 hover:text-[#ee4d2d] line-clamp-2">
                            {product.name}
                          </Link>
                          {/* --- BỔ SUNG: HUY HIỆU HIỂN THỊ CỜ TRẠNG THÁI (UX) --- */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">ID: {product.id}</span>
                            {product.status === 'INACTIVE' && (
                              <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] rounded-sm font-semibold">ĐÃ ẨN</span>
                            )}
                            {product.stockQuantity === 0 && product.status === 'ACTIVE' && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-sm font-semibold">HẾT HÀNG</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-medium">
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
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
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
          <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end">
            <div className="join gap-1">
              <button 
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="join-item btn btn-sm bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                «
              </button>
              
              {Array.from({ length: pageInfo.totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`join-item btn btn-sm border-gray-300 w-8 h-8 rounded-sm font-medium text-sm ${
                      page === pageNum 
                        ? 'bg-[#ee4d2d] text-white border-[#ee4d2d] hover:bg-[#d73211]' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                disabled={page === pageInfo.totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="join-item btn btn-sm bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}