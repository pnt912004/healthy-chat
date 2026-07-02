import React, { useState, useEffect, useRef } from 'react';
import { Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const [{ unread_count }, notifs] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getNotifications(0, 10)
      ]);
      setUnreadCount(unread_count);
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Setup polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = async () => {
    setOpen(!open);
    if (!open) {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif.id);
      fetchNotifications();
    }
    setOpen(false);
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    fetchNotifications();
  };

  const getIcon = (type) => {
    switch(type) {
      case 'water': return <span className="material-symbols-outlined text-blue-500">water_drop</span>;
      case 'meal': return <span className="material-symbols-outlined text-orange-500">restaurant</span>;
      case 'exercise': return <span className="material-symbols-outlined text-green-500">fitness_center</span>;
      case 'weekly': return <span className="material-symbols-outlined text-purple-500">assessment</span>;
      default: return <span className="material-symbols-outlined text-gray-500">notifications</span>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
        onClick={handleToggle}
      >
        <Badge count={unreadCount} overflowCount={99} size="small">
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">notifications</span>
        </Badge>
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
          <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="font-semibold text-gray-800 dark:text-white">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <span className="material-symbols-outlined animate-spin">sync</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_none</span>
                <p>Bạn không có thông báo nào</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map(notif => (
                  <li 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex gap-3 transition-colors ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notif.content}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {dayjs(notif.created_at).fromNow()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 text-center border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 font-medium"
              onClick={() => setOpen(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
