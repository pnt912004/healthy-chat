// src/pages/ProfilePage.jsx
import { useState } from 'react';
import { getCurrentUser, updateProfile, changePassword, deleteAccount, logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const user = getCurrentUser() || {};
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone: user.phone || ''
  });

  const [pwData, setPwData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [pwMessage, setPwMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handlePwChange = (e) => {
    setPwData({ ...pwData, [e.target.id]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const updatedData = await updateProfile(formData);
      const currentUser = JSON.parse(localStorage.getItem('hc_user')) || {};
      localStorage.setItem('hc_user', JSON.stringify({ ...currentUser, ...updatedData, ...formData }));
      setMessage({ text: 'Cập nhật hồ sơ thành công!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Có lỗi xảy ra', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwMessage({ text: 'Mật khẩu mới không khớp!', type: 'error' });
      return;
    }
    setPwLoading(true);
    setPwMessage({ text: '', type: '' });
    try {
      await changePassword({ current_password: pwData.currentPassword, new_password: pwData.newPassword });
      setPwMessage({ text: 'Đổi mật khẩu thành công!', type: 'success' });
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMessage({ text: err.response?.data?.detail || 'Sai mật khẩu hoặc có lỗi xảy ra', type: 'error' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn? Hành động này không thể hoàn tác.')) {
      try {
        await deleteAccount();
        logout();
        navigate('/login');
      } catch (error) {
        alert('Không thể xóa tài khoản: ' + (error.response?.data?.detail || 'Lỗi server'));
      }
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-xl">
        {/* Page Header */}
        <header className="mb-lg">
          <h1 className="text-h1 font-h1 text-on-surface mb-sm">Hồ Sơ Cá Nhân</h1>
          <p className="text-body-md font-body-md text-on-surface-variant">
            Quản lý thông tin cá nhân và bảo mật để bảo vệ tài khoản HealthyChat của bạn.
          </p>
        </header>

        {/* ── Personal Information Card ── */}
        <section className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-soft overflow-hidden">
          {/* Card Header */}
          <div className="px-lg py-md border-b border-surface-variant bg-surface-container-low
                          flex justify-between items-center">
            <h2 className="text-h3 font-h3 text-on-surface">Thông Tin Cá Nhân</h2>
            <span className="material-symbols-outlined text-outline">person</span>
          </div>

          <div className="p-lg space-y-lg">
            {/* Avatar */}
            <div className="flex items-center gap-lg">
              <div className="relative group">
                <img
                  src={user.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDj0raqm2t0fRhHHlQ55-LUviPGt0Ibk4MbA-UnrUM5W_gik2hCXeosdawsvsySvOYuZTg36KkTHgEoYIfMDzimd1g3n83BAxb2Y9u3Y65ZnnmfOb3dqyjb_VRsCXx3kXpTJFtlwsHQ8kuPeBi-U0YVyFnuqrdnP2ABrUzJMwWDSbqqajXapb-4dXlUyxHTv7hwzTcbWwUSQAZWnk6ZfwAhTkZbppWOKXmgYG83oNHltI0Siodgd-HcrhX4zvBvyd4ccUXO4gYa7rNj"}
                  alt="Current Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-lowest shadow-soft"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-label-md font-label-md text-on-surface mb-xs">Ảnh Đại Diện</h3>
                <p className="text-body-sm font-body-sm text-outline mb-sm">Tính năng tải ảnh lên đang được phát triển.</p>
              </div>
            </div>

            {/* Form Grid */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-lg" onSubmit={handleUpdate}>
              <div className="space-y-xs">
                <label className="text-label-sm font-label-sm text-on-surface-variant block" htmlFor="first_name">
                  Họ
                </label>
                <input id="first_name" type="text" value={formData.first_name} onChange={handleChange} className="input-field" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-sm font-label-sm text-on-surface-variant block" htmlFor="last_name">
                  Tên
                </label>
                <input id="last_name" type="text" value={formData.last_name} onChange={handleChange} className="input-field" />
              </div>
              <div className="space-y-xs md:col-span-2">
                <label className="text-label-sm font-label-sm text-on-surface-variant block" htmlFor="email">
                  Địa Chỉ Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    mail
                  </span>
                  <input id="email" type="email" value={formData.email} onChange={handleChange}
                         className="input-field pl-12" />
                </div>
              </div>
              <div className="space-y-xs md:col-span-2">
                <label className="text-label-sm font-label-sm text-on-surface-variant block" htmlFor="phone">
                  Số Điện Thoại
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    call
                  </span>
                  <input id="phone" type="tel" value={formData.phone} onChange={handleChange}
                         className="input-field pl-12" />
                </div>
              </div>

              {message.text && (
                <div className={`md:col-span-2 p-sm rounded-lg text-body-sm ${message.type === 'success' ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                  {message.text}
                </div>
              )}

              <div className="md:col-span-2 pt-sm flex justify-end">
                <button type="submit" disabled={loading}
                        className={`bg-primary text-on-primary text-label-md font-label-md px-6 py-3
                                   rounded-lg hover:opacity-90 transition-opacity active:scale-95 shadow-soft
                                   ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ── Security Card ── */}
        <section className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-soft overflow-hidden">
          <div className="px-lg py-md border-b border-surface-variant bg-surface-container-low
                          flex justify-between items-center">
            <h2 className="text-h3 font-h3 text-on-surface">Bảo Mật & Mật Khẩu</h2>
            <span className="material-symbols-outlined text-outline">lock</span>
          </div>
          <div className="p-lg">
            <form className="space-y-lg" onSubmit={handleUpdatePassword}>
              {/* Current Password */}
              <div className="space-y-xs">
                <label className="text-label-sm font-label-sm text-on-surface-variant block"
                       htmlFor="currentPassword">
                  Mật Khẩu Hiện Tại
                </label>
                <div className="relative">
                  <input id="currentPassword"
                         value={pwData.currentPassword}
                         onChange={handlePwChange}
                         type={showCurrentPw ? 'text' : 'password'}
                         placeholder="Nhập mật khẩu hiện tại"
                         className="input-field pr-12" required />
                  <button type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined">
                      {showCurrentPw ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* New Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg pt-sm border-t border-surface-variant">
                <div className="space-y-xs">
                  <label className="text-label-sm font-label-sm text-on-surface-variant block"
                         htmlFor="newPassword">
                    Mật Khẩu Mới
                  </label>
                  <input id="newPassword" value={pwData.newPassword} onChange={handlePwChange} type="password" placeholder="Tạo mật khẩu mới"
                         className="input-field" required minLength={8} />
                  <p className="text-body-sm font-body-sm text-outline mt-1 text-xs">
                    Phải dài ít nhất 8 ký tự.
                  </p>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-sm font-label-sm text-on-surface-variant block"
                         htmlFor="confirmPassword">
                    Xác Nhận Mật Khẩu Mới
                  </label>
                  <input id="confirmPassword" value={pwData.confirmPassword} onChange={handlePwChange} type="password" placeholder="Xác nhận mật khẩu mới"
                         className="input-field" required minLength={8} />
                </div>
              </div>

              {pwMessage.text && (
                <div className={`p-sm rounded-lg text-body-sm ${pwMessage.type === 'success' ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                  {pwMessage.text}
                </div>
              )}

              <div className="pt-md flex justify-end">
                <button type="submit" disabled={pwLoading}
                        className={`border border-outline text-on-surface text-label-md font-label-md
                                   px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors
                                   active:scale-95 ${pwLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {pwLoading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ── Danger Zone ── */}
        <section className="bg-error-container/20 rounded-xl border border-error/20 overflow-hidden">
          <div className="p-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
            <div>
              <h3 className="text-h3 font-h3 text-error mb-xs">Xóa Tài Khoản</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                Xóa vĩnh viễn tài khoản của bạn và mọi dữ liệu sức khỏe liên quan. Hành động này không thể hoàn tác.
              </p>
            </div>
            <button onClick={handleDeleteAccount}
                    className="bg-error text-on-error text-label-md font-label-md px-6 py-3
                               rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
              Xóa Tài Khoản
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default ProfilePage;
