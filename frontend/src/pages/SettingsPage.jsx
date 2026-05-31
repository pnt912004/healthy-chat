// src/pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { useTheme } from '../contexts/ThemeContext';

const Toggle = ({ checked, onChange }) => (
  <label className="toggle">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <div className="toggle-track" />
  </label>
);

const SettingsPage = () => {
  useScrollReveal();
  const { theme, setTheme } = useTheme();

  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem('hc_notifs');
    return saved ? JSON.parse(saved) : { push: true, email: false };
  });

  useEffect(() => {
    localStorage.setItem('hc_notifs', JSON.stringify(notifs));
  }, [notifs]);

  return (
    <>
      <header className="mb-xl reveal">
        <h1 className="text-h1 font-h1 text-on-surface mb-2">Cài Đặt</h1>
        <p className="text-body-md font-body-md text-on-surface-variant">
          Quản lý tài khoản, tùy chọn sức khỏe và cấu hình ứng dụng.
        </p>
      </header>

      <div className="space-y-xl max-w-4xl">
        {/* Tùy Chọn Tài Khoản */}
        <section className="card reveal">
          <div className="flex items-center gap-3 mb-lg">
            <span className="material-symbols-outlined text-primary">person</span>
            <h2 className="text-h2 font-h2 text-on-surface">Tùy Chọn Tài Khoản</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="space-y-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">Ngôn Ngữ Hiển Thị</label>
              <div className="relative">
                <select className="input-field appearance-none pr-10 cursor-pointer">
                  <option>Tiếng Việt</option>
                  <option>English (US)</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>
            <div className="space-y-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">Đơn Vị Đo Lường</label>
              <div className="relative">
                <select className="input-field appearance-none pr-10 cursor-pointer">
                  <option>Hệ Mét (kg, cm, ml)</option>
                  <option>Hệ Anh (lbs, ft, oz)</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cài Đặt Thông Báo */}
        <section className="card reveal reveal-delay-1">
          <div className="flex items-center gap-3 mb-lg">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <h2 className="text-h2 font-h2 text-on-surface">Cài Đặt Thông Báo</h2>
          </div>
          <ul className="divide-y divide-outline-variant/40">
            {[
              { key: 'push',  title: 'Thông Báo Đẩy',   desc: 'Mẹo sức khỏe hàng ngày và nhắc nhở' },
              { key: 'email', title: 'Báo Cáo Email',    desc: 'Tóm tắt tiến độ hàng tuần và nhận định y tế' },
            ].map(({ key, title, desc }) => (
              <li key={key} className="py-md flex items-center justify-between gap-md">
                <div>
                  <p className="text-h3 font-h3">{title}</p>
                  <p className="text-body-sm text-on-surface-variant">{desc}</p>
                </div>
                <Toggle checked={notifs[key]} onChange={() => setNotifs(p => ({ ...p, [key]: !p[key] }))} />
              </li>
            ))}
          </ul>
        </section>

        {/* Giao Diện */}
        <section className="card reveal reveal-delay-2">
          <div className="flex items-center gap-3 mb-lg">
            <span className="material-symbols-outlined text-primary">palette</span>
            <h2 className="text-h2 font-h2 text-on-surface">Giao Diện</h2>
          </div>
          <div className="flex gap-md max-w-sm">
            {[
              { val: 'light', icon: 'light_mode', label: 'Sáng' },
              { val: 'dark',  icon: 'dark_mode',  label: 'Tối' },
            ].map(({ val, icon, label }) => (
              <button key={val} onClick={() => setTheme(val)}
                      className={`flex-1 py-xl border-2 rounded-xl flex flex-col items-center gap-sm transition-all
                        ${theme === val
                          ? 'border-primary bg-surface-container-low'
                          : 'border-outline-variant hover:bg-surface-container-low'
                        }`}>
                <span className={`material-symbols-outlined ${theme === val ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {icon}
                </span>
                <span className={`text-label-md font-label-md ${theme === val ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default SettingsPage;
