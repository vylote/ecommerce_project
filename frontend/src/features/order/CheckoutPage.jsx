import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../shared/utils/api";
// Thay đổi Navbar tương ứng với component của bạn, ở đây giả sử dùng Navbar chung
import Navbar from "../../shared/components/Navbar";
import { MapPin, Ticket, Coins, CreditCard, CheckCircle2 } from "lucide-react";

const PAYMENT_METHODS = [
  { value: "COD", label: "Thanh toán khi nhận hàng" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
  { value: "MOCK_ONLINE", label: "Ví ShopeePay (Demo)" },
];

const formatAddress = (addr) => {
  if (!addr) return "";
  return [addr.detail, addr.ward, addr.district, addr.province]
    .filter(Boolean)
    .join(", ");
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dữ liệu lấy từ CartPage truyền sang qua state
  const selectedCartItems = location.state?.selectedItems || [];

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [useCoins, setUseCoins] = useState(false);

  // Sinh Idempotency Key 1 lần duy nhất cho mỗi phiên mở trang
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `txn-${Date.now()}`,
  );

  // 1. Kiểm tra nếu vào trang mà chưa chọn hàng
  useEffect(() => {
    if (!selectedCartItems || selectedCartItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm từ giỏ hàng trước khi thanh toán!");
      navigate("/cart", { replace: true });
    }
  }, [selectedCartItems, navigate]);

  // 2. Fetch danh sách địa chỉ của User
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setAddressLoading(true);
        const res = await api.get("/addresses");
        const list = res.data.result || [];
        setAddresses(list);

        // Mặc định chọn địa chỉ isDefault = true, nếu không có thì lấy cái đầu tiên
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      } catch (error) {
        toast.error("Không thể tải danh sách địa chỉ!");
      } finally {
        setAddressLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  // 3. Logic Gộp nhóm theo Shop (Giống màn Cart)
  const groupedByShop = selectedCartItems.reduce((acc, item) => {
    const shopId = item.shopId;
    if (!acc[shopId]) {
      acc[shopId] = {
        shopId,
        shopName: item.shopName || `Shop #${shopId}`,
        items: [],
      };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {});

  // 4. Các biến tính toán tiền tệ
  const totalItemsAmount = selectedCartItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  // Phí vận chuyển giả định (Mock): 16.500đ / Shop
  const shippingFeePerShop = 16500;
  const totalShippingFee =
    Object.keys(groupedByShop).length * shippingFeePerShop;

  // Xu giả định
  const coinDiscount = useCoins ? 200 : 0;

  const grandTotal = totalItemsAmount + totalShippingFee - coinDiscount;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // 5. Logic Đặt hàng cốt lõi
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ nhận hàng!");
      return;
    }

    setSubmitting(true);
    try {
      // BƯỚC 1: TẠO ĐƠN HÀNG (OrderService sẽ tách làm nhiều đơn dựa theo shopId)
      const orderRes = await api.post("/orders", {
        addressId: selectedAddressId,
        note: note.trim() || null,
        idempotencyKey: idempotencyKey,
        cartItemIds: selectedCartItems.map(item => item.id),
      });

      const createdOrders = orderRes.data.result || [];
      if (createdOrders.length === 0)
        throw new Error("Không có đơn hàng nào được tạo.");

      // BƯỚC 2: TẠO LIÊN KẾT THANH TOÁN (Payment) CHO TỪNG ĐƠN
      // Ví dụ: Có 2 đơn hàng, ta sẽ tạo 2 payment tương ứng.
      const paymentResults = await Promise.allSettled(
        createdOrders.map((order) =>
          api.post(`/payments/orders/${order.id}`, { method: paymentMethod }),
        ),
      );

      // BƯỚC 3: NẾU THANH TOÁN MOCK_ONLINE, TỰ ĐỘNG XÁC NHẬN LUÔN
      if (paymentMethod === "MOCK_ONLINE") {
        const confirmResults = await Promise.allSettled(
          paymentResults
            .filter((r) => r.status === "fulfilled")
            .map((r) => {
              const paymentId = r.value?.data?.result?.id;
              if (paymentId) {
                return api.post(`/payments/${paymentId}/confirm`);
              }
              return Promise.resolve();
            }),
        );

        if (confirmResults.some((r) => r.status === "rejected")) {
          toast.error(
            "Một số giao dịch thanh toán online bị lỗi, vui lòng kiểm tra lại đơn hàng.",
          );
        }
      }

      // Xoá giỏ hàng thành công -> Bắn event update Navbar số lượng
      window.dispatchEvent(new Event("cart_updated"));
      toast.success("Đặt hàng thành công!");

      // Chuyển hướng sang trang lịch sử đơn mua
      navigate("/orders", { replace: true });
    } catch (error) {
      // 409 Conflict: Bắt dính lỗi Idempotency Double Submit!
      if (error.response?.status === 409) {
        toast.error(
          "Giao dịch đang được xử lý, vui lòng không nhấn đặt hàng nhiều lần!",
        );
      } else {
        toast.error(
          error.response?.data?.message || "Lỗi hệ thống khi đặt hàng!",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Tránh render mớ hỗn độn nếu chưa có data giỏ hàng bị ép redirect
  if (selectedCartItems.length === 0) return null;

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-32">
      <Navbar />

      <div className="max-w-[1200px] mx-auto mt-6 space-y-4">
        {/* SECTION 1: ĐỊA CHỈ NHẬN HÀNG */}
        <div className="bg-white rounded-sm p-6 shadow-sm border-t-[3px] border-[#ee4d2d]">
          <div className="flex items-center gap-2 text-[#ee4d2d] text-lg font-medium mb-4">
            <MapPin size={20} /> Địa Chỉ Nhận Hàng
          </div>

          {addressLoading ? (
            <div className="text-gray-500">Đang tải địa chỉ...</div>
          ) : selectedAddress ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-bold text-base text-gray-800">
                  {selectedAddress.fullName} (+84){" "}
                  {selectedAddress.phone.replace(/^0/, "")}
                </span>
                <span className="text-gray-600">
                  {formatAddress(selectedAddress)}
                </span>
                {selectedAddress.isDefault && (
                  <span className="border border-[#ee4d2d] text-[#ee4d2d] text-xs px-1 rounded-sm">
                    Mặc định
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowAddressPicker(!showAddressPicker)}
                className="text-blue-600 uppercase text-sm hover:underline font-medium"
              >
                Thay Đổi
              </button>
            </div>
          ) : (
            <div className="text-gray-500">
              Bạn chưa thiết lập địa chỉ nhận hàng.
            </div>
          )}

          {/* Modal/Dropdown chọn địa chỉ */}
          {showAddressPicker && (
            <div className="mt-4 p-4 border border-gray-200 rounded bg-gray-50 space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-1 accent-[#ee4d2d]"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div>
                    <div className="font-medium text-gray-800">
                      {addr.fullName}{" "}
                      <span className="text-gray-500 font-normal ml-2">
                        {addr.phone}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {formatAddress(addr)}
                    </div>
                  </div>
                </label>
              ))}
              <div className="pt-2">
                <button
                  onClick={() => setShowAddressPicker(false)}
                  className="bg-white border text-gray-700 px-4 py-1.5 text-sm rounded shadow-sm hover:bg-gray-100"
                >
                  Xong
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: DANH SÁCH SẢN PHẨM (Group by Shop) */}
        <div className="bg-white rounded-sm shadow-sm">
          <div className="grid grid-cols-12 px-6 py-4 border-b text-gray-500 text-sm font-medium">
            <div className="col-span-6 text-gray-800 text-lg">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-right">Thành tiền</div>
          </div>

          {Object.values(groupedByShop).map((shop, index) => (
            <div
              key={shop.shopId}
              className={`${index > 0 ? "border-t-8 border-[#f5f5f5]" : ""}`}
            >
              <div className="px-6 py-4 font-semibold text-gray-800 border-b flex items-center gap-2">
                <span className="bg-[#ee4d2d] text-white text-xs px-1.5 py-0.5 rounded-sm">
                  Yêu Thích
                </span>
                {shop.shopName}
              </div>

              {shop.items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 px-6 py-4 border-b border-dashed items-center hover:bg-gray-50"
                >
                  <div className="col-span-6 flex gap-3 items-center">
                    <div className="w-12 h-12 border shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl opacity-50">📦</span>
                      )}
                    </div>
                    <span className="text-sm line-clamp-2">
                      {item.productName}
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-sm text-gray-600">
                    ₫{item.productPrice.toLocaleString("vi-VN")}
                  </div>
                  <div className="col-span-2 text-center text-sm text-gray-600">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-sm text-gray-800 font-medium">
                    ₫{item.totalPrice.toLocaleString("vi-VN")}
                  </div>
                </div>
              ))}

              {/* Lời nhắn & Vận chuyển của từng Shop */}
              <div className="grid grid-cols-12 px-6 py-4 items-center bg-[#fafdff] border-b border-dashed">
                <div className="col-span-6 flex items-center gap-4">
                  <span className="text-sm">Lời nhắn:</span>
                  <input
                    type="text"
                    placeholder="Lưu ý cho Người bán..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="border border-gray-300 rounded-sm px-3 py-1.5 text-sm w-80 outline-none focus:border-gray-400"
                  />
                </div>
                <div className="col-span-6 flex justify-between items-center text-sm">
                  <span className="text-[#00bfa5] font-medium flex items-center gap-1">
                    Phương thức vận chuyển (Mô phỏng)
                  </span>
                  <div className="text-right">
                    <div className="text-gray-800">
                      Nhanh - Nhận hàng sau 2 ngày
                    </div>
                    <div className="text-gray-500 text-xs">
                      Không cho đồng kiểm
                    </div>
                  </div>
                  <span className="text-gray-800 font-medium">
                    ₫{shippingFeePerShop.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 3: VOUCHER & XU */}
        <div className="bg-white rounded-sm shadow-sm space-y-4 py-2">
          <div className="px-6 py-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-2 text-lg text-gray-800">
              <Ticket className="text-[#ee4d2d]" size={22} /> Shopee Voucher
            </div>
            <button className="text-blue-600 text-sm hover:underline">
              Chọn Voucher
            </button>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-800">
              <Coins className="text-yellow-500" size={22} /> Shopee Xu
              <span className="text-gray-500 text-sm ml-2">
                Dùng 200 Shopee Xu
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm">-₫200</span>
              <input
                type="checkbox"
                className="toggle toggle-warning toggle-sm"
                checked={useCoins}
                onChange={(e) => setUseCoins(e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PHƯƠNG THỨC THANH TOÁN */}
        <div className="bg-white rounded-sm shadow-sm">
          <div className="px-6 py-6 border-b flex items-start gap-8">
            <div className="text-lg font-medium text-gray-800 w-48 shrink-0">
              Phương thức thanh toán
            </div>
            <div className="flex flex-wrap gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`px-4 py-2 border rounded-sm text-sm flex items-center gap-2 transition-all ${
                    paymentMethod === method.value
                      ? "border-[#ee4d2d] text-[#ee4d2d] shadow-[inset_0_0_0_1px_#ee4d2d]"
                      : "border-gray-300 text-gray-800 hover:border-gray-400"
                  }`}
                >
                  {method.label}
                  {paymentMethod === method.value && (
                    <CheckCircle2 size={16} className="text-[#ee4d2d]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#fffefb] px-6 py-4 flex justify-end">
            <div className="w-[400px] space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tổng tiền hàng</span>
                <span>₫{totalItemsAmount.toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển</span>
                <span>₫{totalShippingFee.toLocaleString("vi-VN")}</span>
              </div>
              {useCoins && (
                <div className="flex justify-between text-gray-500">
                  <span>Shopee Xu</span>
                  <span>-₫200</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 pb-2">
                <span className="text-gray-500">Tổng thanh toán</span>
                <span className="text-3xl font-medium text-[#ee4d2d]">
                  ₫{grandTotal.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 border-t flex justify-between items-center bg-[#fffefb]">
            <div className="text-gray-500 text-sm w-[600px] leading-relaxed">
              Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo{" "}
              <span className="text-blue-600 cursor-pointer">
                Điều khoản Shopee
              </span>
            </div>
            <button
              disabled={submitting || !selectedAddressId}
              onClick={handlePlaceOrder}
              className="bg-[#ee4d2d] hover:bg-[#d73211] text-white px-10 py-3 rounded-sm font-medium w-[210px] disabled:bg-gray-400 transition-colors"
            >
              {submitting ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
