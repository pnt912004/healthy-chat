// src/layouts/AuthLayout.jsx
// Layout tối giản dùng cho trang Login và Register (không có Navbar/Footer)

import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-md">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
