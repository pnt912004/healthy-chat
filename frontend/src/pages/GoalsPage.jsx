// src/pages/GoalsPage.jsx
// Trang Mục Tiêu & Tính TDEE – tiếng Việt, mobile-friendly, scroll animations

import { useState, useEffect, useRef } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { getGoal, updateGoal, calculateTDEE } from '../services/healthService';
import { useNavigate } from 'react-router-dom';

const GoalsPage = () => {
  useScrollReveal();
  const navigate = useNavigate();
  const resultsRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    current_weight: '',
    target_weight: '',
    body_fat_percentage: '',
    height: '',
    age: '',
    gender: 'male',
    activity_level: 'sedentary',
    weekly_goal_rate: 0.5,
    daily_water_target_ml: 2500,
    daily_sleep_target_hours: 8.0,
    daily_exercise_target_minutes: 30
  });

  const [results, setResults] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [customCalories, setCustomCalories] = useState('');
  const [notification, setNotification] = useState(null); // Cho thông báo thành công

  useEffect(() => {
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    try {
      const data = await getGoal();
      if (data) {
        setFormData({
          current_weight: data.current_weight || '',
          target_weight: data.target_weight || '',
          body_fat_percentage: data.body_fat_percentage || '',
          height: data.height || '',
          age: data.age || '',
          gender: data.gender || 'male',
          activity_level: data.activity_level || 'sedentary',
          weekly_goal_rate: data.weekly_goal_rate || 0.5,
          daily_water_target_ml: data.daily_water_target_ml || 2500,
          daily_sleep_target_hours: data.daily_sleep_target_hours || 8.0,
          daily_exercise_target_minutes: data.daily_exercise_target_minutes || 30
        });
        if (data.tdee) {
          setResults({
            tdee: data.tdee,
            bmi: data.bmi,
            target_calories: data.daily_calorie_goal || data.tdee,
            estimated_days: data.estimated_days_to_target
          });
          setCustomCalories(Math.round(data.daily_calorie_goal || data.tdee));
          setIsPreview(false);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('Chưa có mục tiêu nào được thiết lập.');
      } else {
        console.error('Lỗi khi tải mục tiêu:', error);
      }
    }
  };

  const activityOptions = [
    { value: 'sedentary',      label: 'Ít Vận Động',   desc: 'Hầu như không tập luyện',       icon: 'weekend' },
    { value: 'lightly_active', label: 'Vận Động Nhẹ',  desc: 'Tập 1-3 buổi/tuần',             icon: 'directions_walk' },
    { value: 'moderate',       label: 'Vừa Phải',      desc: 'Tập 3-5 buổi/tuần',             icon: 'directions_run' },
    { value: 'active',         label: 'Năng Động',     desc: 'Tập 6-7 buổi/tuần',             icon: 'fitness_center' },
    { value: 'very_active',    label: 'Rất Năng Động', desc: 'Tập nặng/Công việc thể lực',    icon: 'sports_martial_arts' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setIsPreview(false);
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);
    try {
      const payload = {
        ...formData,
        current_weight: parseFloat(formData.current_weight) || 0,
        target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
        body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
        height: parseFloat(formData.height) || 0,
        age: parseInt(formData.age, 10) || 0,
        weekly_goal_rate: parseFloat(formData.weekly_goal_rate) || 0.5,
      };
      const calculated = await calculateTDEE(payload);
      setResults({
        tdee: calculated.tdee,
        bmi: calculated.bmi,
        target_calories: calculated.daily_calorie_goal,
        estimated_days: calculated.estimated_days_to_target
      });
      setCustomCalories(Math.round(calculated.daily_calorie_goal));
      setIsPreview(true);
      setNotification('Tính toán thành công! Xem kết quả bên dưới.');
      setTimeout(() => setNotification(null), 3000);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      alert('Không thể tính toán. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    setLoading(true);
    setNotification(null);
    try {
      const payload = {
        ...formData,
        current_weight: parseFloat(formData.current_weight) || 0,
        target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
        body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
        height: parseFloat(formData.height) || 0,
        age: parseInt(formData.age, 10) || 0,
        weekly_goal_rate: parseFloat(formData.weekly_goal_rate) || 0.5,
        daily_water_target_ml: parseInt(formData.daily_water_target_ml, 10) || 2500,
        daily_sleep_target_hours: parseFloat(formData.daily_sleep_target_hours) || 8.0,
        daily_exercise_target_minutes: parseInt(formData.daily_exercise_target_minutes, 10) || 30,
        daily_calorie_goal: customCalories ? Number(customCalories) : null
      };
      const updated = await updateGoal(payload);
      setIsPreview(false);
      setNotification('Cập nhật mục tiêu thành công!');
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Lỗi khi lưu mục tiêu:', error.response?.data || error.message);
      const detail = error.response?.data?.detail || 'Không thể cập nhật mục tiêu. Vui lòng thử lại.';
      alert(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setIsPreview(false);
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-xl reveal relative">
        {notification && (
          <div className="absolute top-0 right-0 bg-primary text-on-primary px-lg py-sm rounded-lg shadow-soft animate-fade-in flex items-center gap-2 z-50">
            <span className="material-symbols-outlined">check_circle</span>
            {notification}
          </div>
        )}
        <div className="flex items-center gap-sm mb-xs">
          <span className="material-symbols-outlined text-primary text-3xl">track_changes</span>
          <h1 className="text-h1 font-h1 text-on-background">Xác Định Mục Tiêu</h1>
        </div>
        <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">
          Nhập các chỉ số hiện tại để thiết lập cơ sở chính xác. Chúng tôi sẽ tính toán Tổng
          Năng Lượng Tiêu Thụ Hàng Ngày (TDEE) và đưa ra khuyến nghị sức khoẻ phù hợp.
        </p>
      </div>

      {/* Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">

        {/* ── Trái: Form Nhập Liệu ── */}
        <div className="lg:col-span-7 reveal reveal-delay-1">
          <div className="card p-lg lg:p-xl">
            <form className="space-y-xl" onSubmit={handlePreview}>
              {/* Hàng 1: Cân Nặng + Chiều Cao */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-sm">
                  <label className="text-label-md font-label-md text-on-surface" htmlFor="current_weight">
                    Cân Nặng Hiện Tại
                  </label>
                  <div className="relative">
                    <input id="current_weight" type="number" step="0.1" required
                           value={formData.current_weight} onChange={handleChange}
                           placeholder="VD: 65"
                           className="input-field pr-12" />
                    <span className="absolute right-md top-1/2 -translate-y-1/2 text-outline text-body-md">kg</span>
                  </div>
                </div>
                <div className="space-y-sm">
                  <label className="text-label-md font-label-md text-on-surface" htmlFor="height">
                    Chiều Cao
                  </label>
                  <div className="relative">
                    <input id="height" type="number" step="0.1" required
                           value={formData.height} onChange={handleChange}
                           placeholder="VD: 170"
                           className="input-field pr-12" />
                    <span className="absolute right-md top-1/2 -translate-y-1/2 text-outline text-body-md">cm</span>
                  </div>
                </div>
              </div>

              {/* Hàng 2: Tuổi + Giới Tính */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-sm">
                  <label className="text-label-md font-label-md text-on-surface" htmlFor="age">Tuổi</label>
                  <input id="age" type="number" required
                         value={formData.age} onChange={handleChange}
                         placeholder="VD: 25" className="input-field" />
                </div>
                <div className="space-y-sm">
                  <label className="text-label-md font-label-md text-on-surface" htmlFor="gender">Giới Tính</label>
                  <div className="relative">
                    <select id="gender" 
                            value={formData.gender} onChange={handleChange}
                            className="input-field appearance-none cursor-pointer pr-10">
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Cân Nặng Mục Tiêu & Body Fat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-sm">
                  <label className="text-label-md font-label-md text-on-surface" htmlFor="target_weight">
                    Cân Nặng Mục Tiêu
                  </label>
                  <div className="relative">
                    <input id="target_weight" type="number" step="0.1" required
                           value={formData.target_weight} onChange={handleChange}
                           placeholder="VD: 58"
                           className="input-field pr-12" />
                    <span className="absolute right-md top-1/2 -translate-y-1/2 text-outline text-body-md">kg</span>
                  </div>
                </div>
                <div className="space-y-sm">
                  <label className="text-label-md font-label-md text-on-surface" htmlFor="body_fat_percentage">
                    Tỷ Lệ Mỡ (Body Fat %)
                  </label>
                  <div className="relative">
                    <input id="body_fat_percentage" type="number" step="0.1"
                           value={formData.body_fat_percentage} onChange={handleChange}
                           placeholder="Tùy chọn, VD: 20"
                           className="input-field pr-12" />
                    <span className="absolute right-md top-1/2 -translate-y-1/2 text-outline text-body-md">%</span>
                  </div>
                </div>
              </div>

              {/* Tốc Độ Giảm/Tăng Cân */}
              <div className="space-y-sm">
                <label className="text-label-md font-label-md text-on-surface" htmlFor="weekly_goal_rate">
                  Tốc Độ Thay Đổi Cân Nặng (Tùy chọn nếu có Cân Nặng Mục Tiêu)
                </label>
                <div className="relative">
                  <select id="weekly_goal_rate" 
                          value={formData.weekly_goal_rate} onChange={handleChange}
                          className="input-field appearance-none cursor-pointer pr-10">
                    <option value="0.25">Chậm (0.25 kg/tuần)</option>
                    <option value="0.5">Vừa phải (0.5 kg/tuần)</option>
                    <option value="0.75">Nhanh (0.75 kg/tuần)</option>
                    <option value="1.0">Rất nhanh (1.0 kg/tuần)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Các Mục Tiêu Cá Nhân Khác */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="space-y-sm">
                  <label className="text-label-md font-label-md text-on-surface" htmlFor="daily_water_target_ml">
                    Mục Tiêu Nước (ml)
                  </label>
                  <input id="daily_water_target_ml" type="number" step="100" required
                         value={formData.daily_water_target_ml} onChange={handleChange}
                         placeholder="VD: 2500" className="input-field" />
                </div>
                <div className="space-y-sm">
                  <label className="text-label-md font-label-md text-on-surface" htmlFor="daily_sleep_target_hours">
                    Mục Tiêu Ngủ (giờ)
                  </label>
                  <input id="daily_sleep_target_hours" type="number" step="0.5" required
                         value={formData.daily_sleep_target_hours} onChange={handleChange}
                         placeholder="VD: 8.0" className="input-field" />
                </div>
                <div className="space-y-sm">
                  <label className="text-label-md font-label-md text-on-surface" htmlFor="daily_exercise_target_minutes">
                    Vận Động (phút)
                  </label>
                  <input id="daily_exercise_target_minutes" type="number" step="5" required
                         value={formData.daily_exercise_target_minutes} onChange={handleChange}
                         placeholder="VD: 30" className="input-field" />
                </div>
              </div>

              {/* Mức Độ Hoạt Động */}
              <div className="space-y-md">
                <label className="text-label-md font-label-md text-on-surface block">Mức Độ Hoạt Động</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
                  {activityOptions.map(({ value, label, desc, icon }) => (
                    <label key={value}
                           className={`relative cursor-pointer rounded-lg border-2 p-md transition-all duration-200
                             ${formData.activity_level === value
                               ? 'border-primary bg-surface-container-low'
                               : 'border-surface-variant bg-surface-container-lowest hover:border-outline-variant'
                             }`}>
                      <input type="radio" name="activity" value={value}
                             className="sr-only"
                             checked={formData.activity_level === value}
                             onChange={() => {
                               setFormData({ ...formData, activity_level: value });
                               setIsPreview(false);
                             }} />
                      <div className="flex flex-col items-center text-center gap-sm">
                        <span className={`material-symbols-outlined ${formData.activity_level === value ? 'text-primary' : 'text-outline'}`}>
                          {icon}
                        </span>
                        <span className="text-label-md font-label-md text-on-surface">{label}</span>
                        <span className="text-[10px] text-on-surface-variant leading-tight">{desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit"
                      disabled={loading || isPreview}
                      className="w-full h-xxl bg-primary text-on-primary rounded-lg
                                 text-label-md font-label-md hover:bg-surface-tint transition-colors
                                 shadow-soft flex items-center justify-center gap-sm disabled:opacity-50">
                <span className="material-symbols-outlined">calculate</span>
                {loading ? 'Đang Tính Toán...' : 'Tính Toán'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Phải: Kết Quả ── */}
        <div ref={resultsRef} className="lg:col-span-5 flex flex-col gap-lg reveal reveal-delay-2">
          {/* Hero Image */}
          <div className="rounded-xl overflow-hidden h-48 w-full relative shadow-soft">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9BpvPdqHU727ymoIpArC2MI5qpenXcIebYaCo6mh-uai5p2yKJistP8lvOf0fNF01Y1Xsw4HP9Uv56QrzIVAvWFeAHsURCmdczC4x_2RJnfvw9UHnB4TrG96PGPxLKWP9OWMRD6T-yg8b1e5ajonF2pSQyqc1uWh91wi_asPCK3uNfTIjDSFzT66L6NuFX3ys10m0fxL4GVR1pDpoHo_M4xntLR-_oXC3jKrAJF2yZnwhM40AMtIALs1I4ci80SugrM1Nps6wL-IR"
              alt="Hành Trình Sức Khoẻ"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent"></div>
            <div className="absolute bottom-md left-md text-on-primary">
              <span className="text-h3 font-h3">Kết Quả Phân Tích</span>
            </div>
          </div>

          {results ? (
            <>
              {/* TDEE Card */}
              <div className="bg-surface-container text-on-surface rounded-xl p-lg border border-surface-variant
                               shadow-soft relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8"></div>
                <div className="flex justify-between items-start mb-sm relative z-10">
                  <div>
                    <h3 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                      Calo Duy Trì (TDEE)
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">
                    local_fire_department
                  </span>
                </div>
                <div className="flex items-baseline gap-xs mt-md relative z-10">
                  <span className="text-display font-display text-primary">{Math.round(results?.tdee || 0)}</span>
                  <span className="text-body-md font-body-md text-on-surface-variant">kcal / ngày</span>
                </div>
              </div>

              {/* BMI + Target Grid */}
              <div className="grid grid-cols-2 gap-md animate-fade-in" style={{ animationFillMode: 'both' }}>
                <div className="card flex flex-col justify-center items-center text-center p-md">
                  <h4 className="text-label-sm font-label-sm text-outline mb-xs">BMI Của Bạn</h4>
                  <span className="text-h2 font-h2 text-on-background">{results?.bmi?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="card flex flex-col justify-center items-center text-center p-md bg-primary-container/20">
                  <h4 className="text-label-sm font-label-sm text-primary mb-xs">Mục Tiêu Nạp</h4>
                  <span className="text-h2 font-h2 text-primary">{customCalories || Math.round(results?.target_calories || 0)}</span>
                  <span className="text-[10px] text-on-surface-variant">kcal / ngày</span>
                </div>
              </div>

              <div className="bg-inverse-surface text-inverse-on-surface rounded-xl p-lg shadow-soft animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <div className="flex items-center gap-sm mb-md">
                  <span className="material-symbols-outlined text-inverse-primary">lightbulb</span>
                  <h4 className="text-h3 font-h3">Lời Khuyên</h4>
                </div>
                <p className="text-body-sm leading-relaxed mb-md">
                  Dựa trên mục tiêu của bạn, chúng tôi đề xuất <strong>{Math.round(results?.target_calories || 0)} kcal</strong> mỗi ngày. 
                  Bạn có thể tùy chỉnh lượng calo mục tiêu ở dưới nếu muốn.
                  {results?.estimated_days && (
                    <span className="block mt-2 text-primary font-bold">
                      🔥 Dự kiến bạn sẽ mất khoảng {results.estimated_days} ngày để đạt mục tiêu cân nặng với lượng calo duy trì thâm hụt này!
                    </span>
                  )}
                </p>
                
                <div className="space-y-md">
                  <div className="space-y-sm">
                    <label className="text-label-sm text-inverse-on-surface" htmlFor="custom_calories">
                      Tùy Chỉnh Lượng Calo Mục Tiêu
                    </label>
                    <div className="relative">
                      <input id="custom_calories" type="number" 
                             value={customCalories} 
                             onChange={(e) => setCustomCalories(e.target.value)}
                             className="w-full px-md py-sm rounded-lg bg-surface text-on-surface border-none focus:ring-2 focus:ring-primary" />
                      <span className="absolute right-md top-1/2 -translate-y-1/2 text-outline text-body-sm">kcal</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-sm mt-lg">
                    {isPreview ? (
                      <>
                        <button type="button" onClick={handleCancelPreview} disabled={loading}
                                className="w-full py-sm bg-surface-variant text-on-surface-variant rounded-lg text-label-md hover:bg-surface-container transition-colors">
                          Hủy
                        </button>
                        <button type="button" onClick={handleSaveGoal} disabled={loading}
                                className="w-full py-sm bg-primary text-on-primary rounded-lg text-label-md hover:bg-surface-tint transition-colors">
                          Lưu Mục Tiêu
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => navigate('/dashboard')} disabled={loading}
                                className="w-full py-sm bg-surface-variant text-on-surface-variant rounded-lg text-label-md hover:bg-surface-container transition-colors">
                          Bắt Đầu
                        </button>
                        <button type="button" onClick={handleSaveGoal} disabled={loading}
                                className="w-full py-sm bg-primary text-on-primary rounded-lg text-label-md hover:bg-surface-tint transition-colors">
                          Lưu Thay Đổi
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-xl text-center text-on-surface-variant italic">
              Nhập các chỉ số và nhấn tính toán để xem kết quả phân tích.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GoalsPage;
