import React, { useState } from 'react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    allow_new_registrations: true,
    max_users_limit: 1000,
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate save
    setMessage('Cài đặt hệ thống đã được lưu thành công (Demo).');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-4xl mx-auto dark:text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
          Cài Đặt Hệ Thống (Admin)
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Quản lý cấu hình chung cho toàn bộ ứng dụng HealthyChat.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bảo Trì Hệ Thống</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Khóa ứng dụng để bảo trì (chỉ Admin mới có thể truy cập).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="maintenance_mode" checked={settings.maintenance_mode} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cho Phép Đăng Ký Mới</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mở chức năng tạo tài khoản cho người dùng mới.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="allow_new_registrations" checked={settings.allow_new_registrations} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Giới Hạn Người Dùng Tối Đa</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Giới hạn số lượng tài khoản đăng ký trên hệ thống.</p>
            </div>
            <input 
              type="number" 
              name="max_users_limit" 
              value={settings.max_users_limit} 
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white w-32"
            />
          </div>

          {message && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm border border-green-200 dark:border-green-800">
              {message}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button type="submit" className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors">
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
