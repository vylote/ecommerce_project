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
  const handleUpdateQuantity = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    // Cập nhật giao diện trước cho mượt (Optimistic Update)
    setCartItems(items => items.map(item => 
      item.productId === productId ? { ...item, quantity: newQty, totalPrice: newQty * item.productPrice } : item
    ));

    try {
      await api.put(`/cart/items/${productId}`, { 
        productId: productId, 
        quantity: newQty // Theo logic Backend của bạn (cộng dồn), hoặc truyền số lượng tuyệt đối tuỳ API
      });
    } catch (error) {
      toast.error("Lỗi cập nhật số lượng");
      fetchCart(); // Rollback lại data thực tế nếu lỗi
    }
  };

  // 4. XỬ LÝ XÓA SẢN PHẨM
  const handleRemove = async (productId) => {
    try {
      await api.delete(`/cart/items/${productId}`);
      setCartItems(items => items.filter(item => item.productId !== productId));
      setSelectedItems(selected => selected.filter(id => id !== productId));
      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  // 5. XỬ LÝ CHECKBOX (Chọn sản phẩm để thanh toán)
  const handleSelectItem = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectShop = (shopId) => {
    const shopItemIds = groupedCart[shopId].items.map(item => item.productId);
    const isAllSelected = shopItemIds.every(id => selectedItems.includes(id));

    if (isAllSelected) {
      setSelectedItems(prev => prev.filter(id => !shopItemIds.includes(id)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...shopItemIds])]);
    }
  };

  // 6. TÍNH TỔNG TIỀN (Chỉ tính những món được tick chọn)
  const totalAmount = cartItems
    .filter(item => selectedItems.includes(item.productId))
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }
    // Chuyển hướng sang trang thanh toán, truyền theo danh sách ID sản phẩm đã chọn
    navigate('/checkout', { state: { selectedItems } });
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
                     onChange={(e) => setSelectedItems(e.target.checked ? cartItems.map(i => i.productId) : [])}
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
                       checked={shop.items.every(item => selectedItems.includes(item.productId))}
                       onChange={() => handleSelectShop(shop.shopId)} />
                <Store size={18} className="text-gray-600" />
                <span>{shop.shopName}</span>
              </div>

              {/* Danh sách sản phẩm của Shop */}
              {shop.items.map(item => (
                <div key={item.productId} className="p-4 grid grid-cols-12 items-center border-b last:border-0 hover:bg-gray-50">
                  <div className="col-span-5 flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 cursor-pointer"
                           checked={selectedItems.includes(item.productId)}
                           onChange={() => handleSelectItem(item.productId)} />
                    <img src={item.imageUrl || 'https://via.placeholder.com/80'} alt={item.productName} className="w-20 h-20 object-cover border" />
                    <span className="text-sm line-clamp-2">{item.productName}</span>
                  </div>

                  <div className="col-span-2 text-center text-sm">
                    {item.productPrice.toLocaleString('vi-VN')}₫
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <div className="flex items-center border rounded">
                      <button onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">-</button>
                      <input type="text" value={item.quantity} readOnly className="w-10 text-center text-sm border-x outline-none" />
                      <button onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">+</button>
                    </div>
                  </div>

                  <div className="col-span-2 text-center text-sm font-medium text-[#ee4d2d]">
                    {item.totalPrice.toLocaleString('vi-VN')}₫
                  </div>

                  <div className="col-span-1 text-center">
                    <button onClick={() => handleRemove(item.productId)} className="text-red-500 hover:text-red-700">
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