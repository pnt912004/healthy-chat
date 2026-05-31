// src/layouts/MainLayout.jsx
// Layout dùng cho các trang Public: Header + Footer bao bọc nội dung

import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';

const MainLayout = () => {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default MainLayout;
