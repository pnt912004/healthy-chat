import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { useTheme } from '../contexts/ThemeContext';
import { notificationService } from '../services/notificationService';

const Toggle = ({ checked, onChange }) => (
  <label className="toggle cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
  </label>
);

const SettingsPage = () => {
  useScrollReveal();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    water_reminder: true,
    water_interval_hours: 2,
    meal_reminder: true,
    exercise_reminder: true,
    weekly_report: true,
    quiet_hours_start: "22:00",
    quiet_hours_end: "07:00"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getReminderSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await notificationService.updateReminderSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
      // Revert if error
      fetchSettings();
    }
  };

  if (loading) return <div className="flex justify-center p-8"><span className="material-icons animate-spin text-primary-500">sync</span></div>;

  return (
    <>
      <header className="mb-xl reveal">
        <h1 className="text-h1 font-h1 text-on-surface mb-2">Cài Đặt</h1>
        <p className="text-body-md font-body-md text-on-surface-variant">
          Quản lý tài khoản, tùy chọn sức khỏe và nhắc nhở.
        </p>
      </header>

      <div className="space-y-xl max-w-4xl">
        {/* Cài Đặt Nhắc Nhở */}
        <section className="card reveal">
          <div className="flex items-center gap-3 mb-lg">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <h2 className="text-h2 font-h2 text-on-surface">Cài Đặt Nhắc Nhở</h2>
          </div>
          <ul className="divide-y divide-outline-variant/40">
            <li className="py-md flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
              <div>
                <p className="text-h3 font-h3">Nhắc nhở uống nước</p>
                <p className="text-body-sm text-on-surface-variant">Gửi thông báo nếu bạn quên uống nước</p>
              </div>
              <div className="flex items-center gap-4">
                <select 
                  className="input-field py-1 px-2 text-sm"
                  value={settings.water_interval_hours}
                  onChange={(e) => updateSetting('water_interval_hours', parseInt(e.target.value))}
                  disabled={!settings.water_reminder}
                >
                  <option value={1}>Mỗi 1 giờ</option>
                  <option value={2}>Mỗi 2 giờ</option>
                  <option value={3}>Mỗi 3 giờ</option>
                </select>
                <Toggle checked={settings.water_reminder} onChange={(e) => updateSetting('water_reminder', e.target.checked)} />
              </div>
            </li>
            
            <li className="py-md flex items-center justify-between gap-md">
              <div>
                <p className="text-h3 font-h3">Nhắc nhở bữa ăn</p>
                <p className="text-body-sm text-on-surface-variant">Nhắc nhở nhập dữ liệu bữa ăn nếu quên</p>
              </div>
              <Toggle checked={settings.meal_reminder} onChange={(e) => updateSetting('meal_reminder', e.target.checked)} />
            </li>

            <li className="py-md flex items-center justify-between gap-md">
              <div>
                <p className="text-h3 font-h3">Nhắc nhở tập thể dục</p>
                <p className="text-body-sm text-on-surface-variant">Nhắc nhở nếu bạn chưa vận động trong ngày</p>
              </div>
              <Toggle checked={settings.exercise_reminder} onChange={(e) => updateSetting('exercise_reminder', e.target.checked)} />
            </li>

            <li className="py-md flex items-center justify-between gap-md">
              <div>
                <p className="text-h3 font-h3">Báo cáo tổng kết tuần</p>
                <p className="text-body-sm text-on-surface-variant">Thông báo khi có báo cáo sức khỏe mới</p>
              </div>
              <Toggle checked={settings.weekly_report} onChange={(e) => updateSetting('weekly_report', e.target.checked)} />
            </li>
          </ul>
        </section>

        {/* Giờ Yên Tĩnh */}
        <section className="card reveal reveal-delay-1">
          <div className="flex items-center gap-3 mb-lg">
            <span className="material-symbols-outlined text-primary">do_not_disturb_on</span>
            <h2 className="text-h2 font-h2 text-on-surface">Giờ Yên Tĩnh (Không làm phiền)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="space-y-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">Từ (Bắt đầu)</label>
              <input 
                type="time" 
                className="input-field" 
                value={settings.quiet_hours_start}
                onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
              />
            </div>
            <div className="space-y-xs">
              <label className="text-label-md font-label-md text-on-surface-variant">Đến (Kết thúc)</label>
              <input 
                type="time" 
                className="input-field" 
                value={settings.quiet_hours_end}
                onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
              />
            </div>
          </div>
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
