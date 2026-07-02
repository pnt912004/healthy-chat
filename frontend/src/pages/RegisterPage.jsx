// src/pages/RegisterPage.jsx
// Trang đăng ký – chuyển đổi từ Register/code.html
// Note: Không dùng layout chung (Navbar/Footer bị ẩn trên trang onboarding theo thiết kế gốc)

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto bg-surface-container-lowest
                      shadow-soft min-h-screen">

        {/* ── Left: Brand Image (desktop only) ── */}
        <div className="hidden lg:flex lg:w-5/12 relative bg-surface-container overflow-hidden rounded-r-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/90 to-surface-variant/20 z-10 mix-blend-multiply"></div>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzoRdkwE8mdHifIBCiDBbednpuGws3uCydjZtHAZBcln5ct6H-eHMH7XCATHDhl5QwONGyesIEigRnrD72WTDD9n0NTnLghUHiYrQTaMpKx7Pm9xcbI-D_kuMGOtZFZImT2X6sNfD89fL2bp7v5GMLbESPx0LmboWnoSBuDx3FBac8hk-ZrV3Ax-xGoz9qebNCCe5z7DfGlYnH4HwhkojhDPolvCWsAUnHDKmSCgXUDmjxsxGp2md6rlEKpH0KWtlQ0Mn1tUbJdnIa"
            alt="Healthy Lifestyle"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          {/* Overlay Content */}
          <div className="relative z-20 p-huge flex flex-col justify-end h-full w-full
                           bg-gradient-to-t from-background/90 via-background/40 to-transparent">
            <div className="inline-flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-primary-container"
                    style={{ fontVariationSettings: "'FILL' 1", fontSize: '32px' }}>
                health_and_safety
              </span>
              <span className="text-h2 font-h2 text-on-surface">HealthyChat</span>
            </div>
            <h1 className="text-display font-display text-on-surface mb-md max-w-md">
              Bắt đầu hành trình sống khoẻ.
            </h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-md">
              Tham gia cộng đồng tập trung vào sự tin cậy y tế và các thói quen hàng ngày dễ thực hiện.
              Chúng tôi ở đây để giúp bạn xây dựng một ngày mai khoẻ mạnh hơn.
            </p>
          </div>
        </div>

        {/* ── Right: Registration Form ── */}
        <div className="w-full lg:w-7/12 flex items-center justify-center p-xl md:p-huge
                         bg-surface-container-lowest">
          <div className="w-full max-w-[480px]">

            {/* Mobile Header */}
            <div className="lg:hidden mb-xl text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl
                               bg-surface-container text-primary mb-md shadow-soft border border-outline-variant/30">
                <span className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                  health_and_safety
                </span>
              </div>
              <h2 className="text-h1 font-h1 text-on-surface mb-xs">HealthyChat</h2>
              <p className="text-body-md font-body-md text-on-surface-variant">Tạo tài khoản mới</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-xl">
              <h2 className="text-h1 font-h1 text-on-surface mb-xs">Đăng ký tài khoản</h2>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Nhập thông tin bên dưới để thiết lập hồ sơ của bạn.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-md p-sm bg-error-container text-on-error-container rounded-lg text-body-sm">
                {error}
              </div>
            )}

            {success ? (
              <div className="bg-primary-container text-on-primary-container p-xl rounded-xl text-center">
                <span className="material-symbols-outlined text-[48px] text-primary mb-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mark_email_read
                </span>
                <h3 className="text-h3 font-h3 mb-sm">Đăng ký thành công!</h3>
                <p className="text-body-md mb-lg">
                  Vui lòng kiểm tra hộp thư email của bạn (<b>{formData.email}</b>) để xác nhận tài khoản.
                </p>
                <Link to="/login" className="inline-flex items-center justify-center h-xl px-xl bg-primary text-on-primary rounded-full hover:bg-primary-dark transition-colors font-semibold">
                  Về trang Đăng nhập
                </Link>
              </div>
            ) : (
            <form className="space-y-md" onSubmit={handleSubmit}>
              {/* First & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md font-label-md text-on-surface" htmlFor="firstName">
                    Họ
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
                      person
                    </span>
                    <input id="firstName" type="text" required
                           value={formData.firstName} onChange={handleChange}
                           placeholder="Nhập họ"
                           className="input-field pl-xxl" />
                  </div>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-md font-label-md text-on-surface" htmlFor="lastName">
                    Tên
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
                      person
                    </span>
                    <input id="lastName" type="text" required
                           value={formData.lastName} onChange={handleChange}
                           placeholder="Nhập tên"
                           className="input-field pl-xxl" />
                  </div>
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-xs">
                <label className="text-label-md font-label-md text-on-surface" htmlFor="username">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
                    badge
                  </span>
                  <input id="username" type="text" required
                         value={formData.username} onChange={handleChange}
                         placeholder="Chọn tên đăng nhập duy nhất"
                         className="input-field pl-xxl" />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-xs">
                <label className="text-label-md font-label-md text-on-surface" htmlFor="email">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
                    mail
                  </span>
                  <input id="email" type="email" required
                         value={formData.email} onChange={handleChange}
                         placeholder="vidu@example.com"
                         className="input-field pl-xxl" />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-xs">
                <label className="text-label-md font-label-md text-on-surface" htmlFor="phone">
                  Số điện thoại
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
                    phone
                  </span>
                  <input id="phone" type="tel"
                         value={formData.phone} onChange={handleChange}
                         placeholder="Nhập số điện thoại của bạn"
                         className="input-field pl-xxl" />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-xs">
                <label className="text-label-md font-label-md text-on-surface" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">
                    lock
                  </span>
                  <input id="password" required
                         type={showPassword ? 'text' : 'password'}
                         value={formData.password} onChange={handleChange}
                         placeholder="Tạo mật khẩu mạnh"
                         className="input-field pl-xxl pr-xxl" />
                  <button type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-md top-1/2 -translate-y-1/2 text-outline
                                     hover:text-on-surface transition-colors flex items-center">
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-sm pt-sm">
                <div className="flex items-center h-5 mt-[2px]">
                  <input id="terms" type="checkbox" required
                         className="w-5 h-5 rounded border-outline-variant text-primary
                                    focus:ring-primary focus:ring-2 bg-surface-container-lowest cursor-pointer" />
                </div>
                <label htmlFor="terms" className="text-body-sm font-body-sm text-on-surface-variant cursor-pointer">
                  Bằng cách tạo tài khoản, tôi đồng ý với{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-primary hover:underline font-semibold transition-colors">
                    Điều khoản dịch vụ
                  </a>
                  {' '}và{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-primary hover:underline font-semibold transition-colors">
                    Chính sách bảo mật
                  </a>.
                </label>
              </div>

              {/* Submit */}
              <div className="pt-sm">
                <button type="submit"
                        disabled={loading}
                        className={`w-full h-xxl bg-primary-container text-on-primary-container
                                   text-label-md font-label-md rounded-lg hover:bg-inverse-primary
                                   active:scale-[0.98] transition-all flex items-center justify-center
                                   gap-sm shadow-soft group ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span>{loading ? 'Đang xử lý...' : 'Tạo tài khoản'}</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform"
                        style={{ fontSize: '20px' }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </form>
            )}

            {/* Login redirect */}
            <div className="mt-xl text-center">
              <p className="text-body-md font-body-md text-on-surface-variant">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline transition-colors">
                  Đăng nhập tại đây
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
