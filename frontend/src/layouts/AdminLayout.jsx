import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  DashboardOutlined, 
  UserOutlined, 
  LogoutOutlined,
  BulbOutlined,
  LineChartOutlined,
  SettingOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { getAdminUnreadCount } from '../services/adminService';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkUnread = async () => {
      try {
        const data = await getAdminUnreadCount();
        setUnreadCount(data.unread_count);
      } catch (error) {}
    };
    checkUnread();
    const interval = setInterval(checkUnread, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/users', icon: <UserOutlined />, label: 'Quản lý người dùng' },
    { key: '/admin/tips', icon: <BulbOutlined />, label: 'Health Tips' },
    { 
      key: '/admin/chat-logs', 
      icon: <LineChartOutlined />, 
      label: (
        <div className="flex items-center justify-between w-full">
          <span>Giám sát Chat</span>
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
      )
    },
    { key: '/admin/settings', icon: <SettingOutlined />, label: 'Cấu hình hệ thống' },
  ];

  const handleMenuClick = (key) => {
    setSidebarOpen(false);
    navigate(key);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header (Only visible on small screens) */}
      <div className="md:hidden flex items-center justify-between bg-primary p-4 text-white">
        <span className="font-bold text-lg">Admin Panel</span>
        <button onClick={() => setSidebarOpen(true)}>
          <MenuOutlined className="text-2xl" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 bg-slate-950 px-6">
          <span className="text-white text-xl font-bold">Admin Panel</span>
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <CloseOutlined className="text-xl" />
          </button>
        </div>
        
        <nav className="p-4 flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleMenuClick(item.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left
                ${location.pathname === item.key 
                  ? 'bg-primary text-white font-semibold' 
                  : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left text-red-400 hover:bg-red-900/30 hover:text-red-300 mt-4"
          >
            <span className="text-lg"><LogoutOutlined /></span>
            <span>Đăng xuất</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-surface-container-lowest dark:bg-inverse-surface border-b border-outline-variant dark:border-outline px-6 flex items-center justify-end shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-on-surface dark:text-inverse-on-surface">
              Xin chào, <strong>{user?.username}</strong>
            </span>
            <Link 
              to="/dashboard"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Về Dashboard User
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-background dark:bg-slate-950 overflow-auto">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-6 shadow-soft min-h-[400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
