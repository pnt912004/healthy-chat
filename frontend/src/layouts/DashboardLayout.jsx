// src/layouts/DashboardLayout.jsx
// Layout dùng cho các trang nội bộ sau khi đăng nhập: Sidebar + Header + Content

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar    from '../components/Navbar';
import Sidebar   from '../components/Sidebar';
import Footer    from '../components/Footer';
import MobileNav from '../components/MobileNav';
import { notificationService } from '../services/notificationService';

const DashboardLayout = () => {
  useEffect(() => {
    notificationService.checkReminders().catch(console.error);
    const interval = setInterval(() => {
      notificationService.checkReminders().catch(console.error);
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 px-md py-xl lg:px-xl pb-24 lg:pb-xl">
          <Outlet />
        </main>
      </div>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;
