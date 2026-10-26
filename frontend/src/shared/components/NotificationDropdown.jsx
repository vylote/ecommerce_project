import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, CheckCheck, Package, Truck, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { useNotification } from '../hooks/useNotification.jsx';

export default function NotificationDropdown({ user }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification(user?.id);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClickButton = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_CONFIRMED':
        return <Package size={16} className="text-blue-600" />;
      case 'ORDER_SHIPPING':
        return <Truck size={16} className="text-purple-600" />;
      case 'ORDER_COMPLETED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'PAYMENT_SUCCESS':
      case 'NEW_ORDER':
        return <ShoppingBag size={16} className="text-emerald-600" />;
      case 'ORDER_CANCELLED':
        return <XCircle size={16} className="text-rose-600" />;
      default:
        return <Bell size={16} className="text-amber-600" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleClickButton}
        className="flex items-center gap-1.5 hover:opacity-80 relative py-1 focus:outline-none transition-opacity cursor-pointer"
        title="Thông báo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span>Thông báo</span>
        {user && unreadCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-gray-800 border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden origin-top-right animate-fade-in text-left">
          {/* Header dropdown */}
          <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-gray-900 uppercase tracking-wide">
                Thông báo mới nhận
              </span>
              {unreadCount > 0 && (
                <span className="bg-green-100 text-green-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-green-600 hover:text-green-700 font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={13} /> Đọc tất cả
              </button>
            )}
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-xs">
                <span className="text-3xl block mb-2">📭</span>
                Chưa có thông báo nào
              </div>
            ) : (
              notifications.slice(0, 15).map((notif) => (
                <div
                  key={notif.id || Math.random()}
                  onClick={() => {
                    if (!notif.isRead && notif.id) markAsRead(notif.id);
                    setIsOpen(false);
                    navigate('/orders');
                  }}
                  className={`p-3.5 flex gap-3 items-start hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notif.isRead ? 'bg-green-50/30' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">{notif.title}</p>
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {notif.createdAt
                        ? new Date(notif.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })
                        : 'Vừa xong'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer dropdown */}
          <div className="p-2.5 border-t border-gray-100 text-center bg-gray-50/60">
            <Link
              to="/orders"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-green-700 hover:text-green-800 block"
            >
              Xem tất cả đơn mua →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
