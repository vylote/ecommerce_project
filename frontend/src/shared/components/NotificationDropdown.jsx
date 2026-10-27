import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, CheckCheck, Package, Truck, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { useNotification } from '../hooks/useNotification.jsx';
import { useI18n } from '../i18n';

export default function NotificationDropdown({ user }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { t } = useI18n();
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
        title={t('nav.notifications')}
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
        <span>{t('nav.notifications')}</span>
        {user && unreadCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-[35%] sm:-translate-x-[38%] mt-2.5 w-84 sm:w-[400px] bg-white text-gray-800 border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] z-50 text-left animate-in fade-in duration-200">
          {/* Mũi tên chỉ hướng tam giác trỏ thẳng vào nút Thông báo */}
          <div className="absolute -top-2 left-[35%] sm:left-[38%] -translate-x-1/2 w-3.5 h-3.5 bg-gray-50 border-t border-l border-gray-200 rotate-45 z-20 pointer-events-none" />

          <div className="rounded-2xl overflow-hidden">
            {/* Header dropdown */}
            <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50 relative z-10">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-gray-900 uppercase tracking-wide">
                {t('notif.title')}
              </span>
              {unreadCount > 0 && (
                <span className="bg-green-100 text-green-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} {t('notif.unread')}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-green-600 hover:text-green-700 font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={13} /> {t('notif.mark_all_read')}
              </button>
            )}
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-xs">
                <span className="text-3xl block mb-2">📭</span>
                {t('notif.empty')}
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
                  className={`p-3.5 flex gap-3 items-start hover:bg-gray-50 cursor-pointer transition-colors relative group ${
                    !notif.isRead ? 'bg-green-50/30' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">{notif.title}</p>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                            })
                          : 'Vừa xong'}
                      </span>
                      {notif.isRead && notif.readAt && (
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded font-medium">
                          Đã đọc
                        </span>
                      )}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <div className="absolute right-3 top-3.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (notif.id) markAsRead(notif.id);
                        }}
                        className="w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-green-600 hover:border-green-500 hover:bg-green-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-2xs"
                        title="Đánh dấu đã đọc"
                      >
                        <CheckCheck size={11} />
                      </button>
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    </div>
                  )}
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
              {t('notif.view_all_orders')}
            </Link>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
