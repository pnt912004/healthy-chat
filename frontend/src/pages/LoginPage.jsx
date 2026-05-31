// src/pages/LoginPage.jsx
// Trang đăng nhập – chuyển đổi từ Login/code.html

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="w-full max-w-[1000px] bg-surface-container-lowest rounded-xl
                        shadow-medium border border-outline-variant/30 flex overflow-hidden">
        {/* Left: Login Form */}
        <div className="w-full md:w-1/2 p-xl md:p-huge flex flex-col justify-center">
          {/* Brand */}
          <div className="mb-xl flex items-center gap-2 text-primary-container">
            <span className="material-symbols-outlined text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
              medical_services
            </span>
            <span className="text-h2 font-h2 text-on-surface">HealthyChat</span>
          </div>

          {/* Header */}
          <div className="mb-lg">
            <h1 className="text-h1 font-h1 text-on-surface mb-xs">Chào mừng trở lại</h1>
            <p className="text-body-md font-body-md text-on-surface-variant">
              Vui lòng nhập thông tin để truy cập bảng điều khiển sức khoẻ.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-md p-sm bg-error-container text-on-error-container rounded-lg text-body-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-md" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-xs"
                     htmlFor="username">
                Tên đăng nhập
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  person
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-xs"
                     htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>

            </div>

            {/* Submit */}
            <button type="submit"
                    disabled={loading}
                    className={`w-full h-xxl bg-primary-container text-on-primary
                               text-label-md font-label-md rounded-lg
                               hover:bg-primary transition-all active:scale-[0.98] mt-xl
                               ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-lg text-center">
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary font-semibold hover:text-primary-container transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Right: Brand Visual */}
        <div className="hidden md:block w-1/2 bg-surface-container relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/20 to-transparent mix-blend-multiply z-10"></div>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOeY6oB4o5bFGMntwPnal_osjsgUxKQDq_x-MapB5vb-Dooc_HptqLXdu9FbqUUXVIR37Ijx_4lwKI5XrnGcnrZ5C_7skgPJn6iuUhsyiCzplvANq2UKDrQQjTXp-F8tOJ8o8HU3x4hh8XBVaYRASPCjIFQ6FZMcvCNP9DXWxCaIpALmRVdgSsCNwywqy0Mx6VuVYyVLSwfhZ8TW13ss60QwvFerB8eAs1Jt0xPen3BrkWeAkBjysuiYRIuCJYebmTg1ItMEWqvUhr"
            alt="Person stretching and relaxing"
            className="absolute inset-0 w-full h-full object-cover grayscale-[30%]"
          />
          {/* Overlay Quote */}
          <div className="absolute bottom-xl left-xl right-xl z-20 p-md
                           bg-white/80 backdrop-blur-md rounded-xl border border-white/50 shadow-soft">
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-primary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                format_quote
              </span>
              <div>
                <p className="text-body-md font-body-md text-on-surface italic mb-xs">
                  "HealthyChat đã thay đổi hoàn toàn cách tôi quản lý thói quen chăm sóc sức khoẻ hàng ngày."
                </p>
                <p className="text-label-sm font-label-sm text-on-surface-variant">— Sarah J., Thành viên Premium</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default LoginPage;
