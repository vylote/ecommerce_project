import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../shared/utils/api';
import CartHeader from './CartHeader';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. LẤY DỮ LIỆU TỪ BACKEND
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCartItems(res.data.result);
    } catch (error) {
      toast.error("Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  // 2. GỘP NHÓM SẢN PHẨM THEO SHOP (Group by Shop)
  const groupedCart = cartItems.reduce((acc, item) => {
    const shopId = item.shopId;
    if (!acc[shopId]) {
      acc[shopId] = {
        shopId: shopId,
        shopName: item.shopName || `Shop #${shopId}`, // API của bạn nên trả về shopName trong CartItemResponse
        items: []
      };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {});

  // 3. XỬ LÝ CẬP NHẬT SỐ LƯỢNG
  const handleUpdateQuantity = async (cartItemId, currentQty, change, item) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    // Cập nhật giao diện trước cho mượt (Optimistic Update)
    setCartItems(items => items.map(it => 
      it.id === cartItemId ? { ...it, quantity: newQty, totalPrice: newQty * it.productPrice } : it
    ));

    try {
      await api.put(`/cart/items/${cartItemId}`, { 
        productId: item.productId, 
        specificProductId: item.specificProductId || null,
        quantity: newQty
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật số lượng");
      fetchCart(); // Rollback lại data thực tế nếu lỗi
    }
  };

  // 4. XỬ LÝ XÓA SẢN PHẨM
  const handleRemove = async (cartItemId) => {
    try {
      await api.delete(`/cart/items/${cartItemId}`);
      setCartItems(items => items.filter(item => item.id !== cartItemId));
      setSelectedItems(selected => selected.filter(id => id !== cartItemId));
      window.dispatchEvent(new Event('cart_updated'));
      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  // 5. XỬ LÝ CHECKBOX (Chọn sản phẩm để thanh toán theo cart item id)
  const handleSelectItem = (cartItemId) => {
    setSelectedItems(prev => 
      prev.includes(cartItemId) ? prev.filter(id => id !== cartItemId) : [...prev, cartItemId]
    );
  };

  const handleSelectShop = (shopId) => {
    const shopItemIds = groupedCart[shopId].items.map(item => item.id);
    const isAllSelected = shopItemIds.every(id => selectedItems.includes(id));

    if (isAllSelected) {
      setSelectedItems(prev => prev.filter(id => !shopItemIds.includes(id)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...shopItemIds])]);
    }
  };

  // 6. TÍNH TỔNG TIỀN (Chỉ tính những món được tick chọn)
  const totalAmount = cartItems
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }
    // Lọc ra toàn bộ thông tin của các item được tích chọn theo item.id
    const fullSelectedItems = cartItems.filter(item => selectedItems.includes(item.id));

    // Chuyển hướng sang trang thanh toán và ném cục data này sang
    navigate('/checkout', { state: { selectedItems: fullSelectedItems } });
  };

  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen">
        <CartHeader />
        <div className="p-10 text-center">Đang tải giỏ hàng...</div>
      </div>
    );
  }

  // TRẠNG THÁI GIỎ HÀNG TRỐNG
  if (cartItems.length === 0) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen">
        <CartHeader />
        <div className="max-w-6xl mx-auto py-8">
          <div className="bg-white rounded shadow-sm flex flex-col items-center justify-center py-24 px-4">
            <ShoppingCart size={96} strokeWidth={1} className="text-gray-300 mb-6" />
            <p className="text-gray-500 mb-6">Giỏ hàng của bạn còn trống</p>
            <button
              onClick={() => navigate('/')}
              className="px-10 py-3 bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded font-medium transition-colors"
            >
              Mua Ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <CartHeader />

      <div className="py-8">
        <div className="max-w-6xl mx-auto space-y-4">

          {/* Header Bar */}
          <div className="bg-white p-4 rounded shadow-sm grid grid-cols-12 text-sm font-semibold text-gray-500">
            <div className="col-span-5 flex items-center">
              <input type="checkbox" className="mr-4 w-4 h-4 cursor-pointer" 
                     onChange={(e) => setSelectedItems(e.target.checked ? cartItems.map(i => i.id) : [])}
                     checked={selectedItems.length > 0 && selectedItems.length === cartItems.length} />
              Sản Phẩm
            </div>
            <div className="col-span-2 text-center">Đơn Giá</div>
            <div className="col-span-2 text-center">Số Lượng</div>
            <div className="col-span-2 text-center">Số Tiền</div>
            <div className="col-span-1 text-center">Thao Tác</div>
          </div>

          {/* Shop Sections */}
          {Object.values(groupedCart).map(shop => (
            <div key={shop.shopId} className="bg-white rounded shadow-sm">
              {/* Tên Shop */}
              <div className="p-4 border-b flex items-center gap-2 font-semibold">
                <input type="checkbox" className="w-4 h-4 cursor-pointer"
                       checked={shop.items.every(item => selectedItems.includes(item.id))}
                       onChange={() => handleSelectShop(shop.shopId)} />
                <Store size={18} className="text-gray-600" />
                <span>{shop.shopName}</span>
              </div>

              {/* Danh sách sản phẩm của Shop */}
              {shop.items.map(item => (
                <div key={item.id} className="p-4 grid grid-cols-12 items-center border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="col-span-5 flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 cursor-pointer shrink-0"
                           checked={selectedItems.includes(item.id)}
                           onChange={() => handleSelectItem(item.id)} />
                    <div className="w-20 h-20 min-w-20 max-w-20 min-h-20 max-h-20 shrink-0 border border-gray-200 rounded-sm overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img 
                        src={item.imageUrl || 'https://via.placeholder.com/80'} 
                        alt={item.productName} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 pr-2">
                      <span 
                        onClick={() => navigate(`/product/${item.productId}`)} 
                        className="text-sm font-medium line-clamp-2 text-gray-800 hover:text-primary cursor-pointer transition-colors"
                      >
                        {item.productName}
                      </span>
                      {item.variantName ? (
                        <span className="inline-block mt-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-xs w-fit border border-gray-200">
                          Phân loại: <strong className="text-gray-800 font-medium">{item.variantName}</strong>
                        </span>
                      ) : (
                        <span className="inline-block mt-1 text-xs text-gray-400">
                          Sản phẩm tiêu chuẩn
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 text-center text-sm font-medium text-gray-700">
                    ₫{Number(item.productPrice || 0).toLocaleString('vi-VN')}
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <div className="flex items-center border rounded">
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity, -1, item)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors">-</button>
                      <input type="text" value={item.quantity} readOnly className="w-10 text-center text-sm border-x outline-none font-medium text-gray-700" />
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity, 1, item)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors">+</button>
                    </div>
                  </div>

                  <div className="col-span-2 text-center text-sm font-semibold text-[#ee4d2d]">
                    ₫{Number(item.totalPrice || 0).toLocaleString('vi-VN')}
                  </div>

                  <div className="col-span-1 text-center">
                    <button 
                      onClick={() => handleRemove(item.id)} 
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={18} className="mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Thanh toán cố định (Bottom Bar) */}
          <div className="bg-white p-4 rounded shadow-sm sticky bottom-0 flex justify-between items-center z-10 border-t">
            <div className="flex items-center gap-4">
              <button
                onClick={async () => {
                  try {
                    await api.delete('/cart');
                    setCartItems([]);
                    setSelectedItems([]);
                    window.dispatchEvent(new Event('cart_updated'));
                    toast.success("Đã xóa toàn bộ giỏ hàng");
                  } catch (error) {
                    toast.error("Không thể xóa giỏ hàng");
                  }
                }}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                Xóa tất cả
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                Tổng thanh toán ({selectedItems.length} Sản phẩm): <span className="text-2xl font-bold text-[#ee4d2d] ml-2">{totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <button onClick={handleCheckout} className="px-10 py-3 bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded font-medium transition-colors">
                Mua Hàng
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;