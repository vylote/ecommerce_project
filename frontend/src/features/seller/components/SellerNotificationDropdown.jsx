import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  BellRing,
  CheckCheck,
  Check,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';

export default function SellerNotificationDropdown({
  notifications = [],
  unreadCount = 0,
  markAsRead,
  markAllAsRead,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'order'
  const dropdownRef = useRef(null);

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lọc thông báo theo tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    if (activeTab === 'order') {
      return notifications.filter(
        (n) =>
          n.type === 'NEW_ORDER' ||
          n.type === 'ORDER_CANCELLED' ||
          n.type === 'PAYMENT_SUCCESS' ||
          n.type === 'ORDER_CONFIRMED' ||
          n.type === 'ORDER_SHIPPING'
      );
    }
    return notifications;
  }, [notifications, activeTab]);

  // Icon và Style theo loại thông báo
  const getTypeConfig = (type) => {
    switch (type) {
      case 'NEW_ORDER':
        return {
          icon: <ShoppingBag size={18} className="text-emerald-600" />,
          bgColor: 'bg-emerald-50 border-emerald-200',
          badgeText: 'Đơn mới',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'PAYMENT_SUCCESS':
        return {
          icon: <CreditCard size={18} className="text-blue-600" />,
          bgColor: 'bg-blue-50 border-blue-200',
          badgeText: 'Thanh toán',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'ORDER_CANCELLED':
        return {
          icon: <AlertTriangle size={18} className="text-rose-600" />,
          bgColor: 'bg-rose-50 border-rose-200',
          badgeText: 'Đã hủy',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      default:
        return {
          icon: <Info size={18} className="text-amber-600" />,
          bgColor: 'bg-amber-50 border-amber-200',
          badgeText: 'Hệ thống',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        };
    }
  };

  // Định dạng thời gian sắc nét
  const formatTime = (isoString) => {
    if (!isoString) return 'Vừa xong';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);

      if (diffSec < 60) return 'Vừa xong';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
      if (diffSec < 86400) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay';
      }
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Vừa xong';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông Thông Báo */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all focus:outline-none text-white cursor-pointer"
        title="Thông báo người bán"
        aria-label="Thông báo người bán"
      >
        {unreadCount > 0 ? (
          <BellRing size={20} className="text-amber-300 animate-[wiggle_1s_ease-in-out_infinite]" />
        ) : (
          <Bell size={20} className="text-white/90 hover:text-white transition-colors" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-4.5 text-center shadow-md ring-2 ring-emerald-600 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-88 sm:w-[420px] bg-white text-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-gray-100 z-50 overflow-hidden origin-top-right transition-all animate-in fade-in duration-200">
          {/* Header Panel */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
                <Sparkles size={17} className="text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Thông báo Shop</h3>
                <p className="text-[11px] text-emerald-100 font-medium">Cập nhật đơn hàng & hoạt động</p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white/15 hover:bg-white/25 active:scale-95 rounded-lg text-white transition-all cursor-pointer backdrop-blur-xs"
                title="Đánh dấu tất cả thông báo là đã đọc"
              >
                <CheckCheck size={14} className="text-emerald-200" />
                <span>Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Tab Navigation / Filter */}
          <div className="flex items-center gap-1 px-3 py-2 bg-gray-50/90 border-b border-gray-100 text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Tất cả ({notifications.length})
            </button>

            <button
              onClick={() => setActiveTab('unread')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'unread'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>Chưa đọc</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('order')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'order'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Đơn hàng
            </button>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                  <Inbox size={26} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-gray-700">Không có thông báo nào</p>
                <p className="text-xs text-gray-400 mt-1">
                  {activeTab === 'unread'
                    ? 'Bạn đã đọc toàn bộ thông báo!'
                    : 'Các thông báo mới về đơn hàng sẽ xuất hiện tại đây.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const config = getTypeConfig(notif.type);
                const isRead = notif.isRead;

                return (
                  <div
                    key={notif.id || `${notif.createdAt}-${Math.random()}`}
                    onClick={() => {
                      if (!isRead && notif.id) {
                        markAsRead(notif.id);
                      }
                      setIsOpen(false);
                      navigate('/seller/orders');
                    }}
                    className={`group relative p-3.5 flex gap-3 items-start transition-all cursor-pointer border-l-4 ${
                      !isRead
                        ? 'bg-gradient-to-r from-emerald-50/60 via-emerald-50/20 to-white border-l-emerald-500 hover:from-emerald-50 hover:to-emerald-50/40'
                        : 'bg-white hover:bg-gray-50/80 border-l-transparent'
                    }`}
                  >
                    {/* Icon đại diện */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${config.bgColor} shadow-2xs group-hover:scale-105 transition-transform`}
                    >
                      {config.icon}
                    </div>

                    {/* Nội dung thông báo */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${config.badgeClass}`}
                        >
                          {config.badgeText}
                        </span>
                        <h4
                          className={`text-xs leading-snug line-clamp-1 ${
                            !isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'
                          }`}
                        >
                          {notif.title}
                        </h4>
                      </div>

                      <p
                        className={`text-xs leading-relaxed line-clamp-2 ${
                          !isRead ? 'text-gray-700' : 'text-gray-500'
                        }`}
                      >
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatTime(notif.createdAt)}
                        </span>
                        {isRead && notif.readAt && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                            Đã đọc
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cột hành động: Nút đánh dấu đã đọc hoặc chấm xanh chưa đọc */}
                    <div className="absolute right-3.5 top-4 flex items-center">
                      {!isRead ? (
                        <div className="flex items-center gap-1.5">
                          {/* Nút Đã Đọc riêng cho item */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (notif.id) markAsRead(notif.id);
                            }}
                            className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-2xs"
                            title="Đánh dấu đã đọc"
                          >
                            <Check size={12} strokeWidth={2.5} />
                          </button>
                          {/* Chấm tròn trạng thái chưa đọc */}
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shadow-2xs" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Panel */}
          <div className="p-3 bg-gray-50/90 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã được đọc'}
            </span>
            <Link
              to="/seller/orders"
              onClick={() => setIsOpen(false)}
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả đơn hàng</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
