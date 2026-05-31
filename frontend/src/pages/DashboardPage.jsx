// src/pages/DashboardPage.jsx
// Tổng Quan Sức Khoẻ – tiếng Việt, scroll animations, mobile-friendly

import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { getNutritionSummary, getWaterSummary, getRandomTip, addNutritionLog, addWaterLog, getGoal, deleteNutritionLog, deleteWaterLog } from '../services/healthService';
import { getExerciseSummary } from '../services/exerciseService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getCurrentUser } from '../services/authService';

const DashboardPage = () => {
  const [nutrition, setNutrition] = useState({ consumed: 0, target: 2400 });
  const [water, setWater] = useState({ consumed: 0, target: 2.5 });
  const [tip, setTip] = useState({ content: 'Đang tải mẹo sức khoẻ...', icon: 'psychology' });
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waterStreak, setWaterStreak] = useState(0);
  const [exercise, setExercise] = useState({ minutes: 0, caloriesBurned: 0, count: 0 });
  
  // Quick Add State
  const [foodName, setFoodName] = useState('');
  const [foodCalo, setFoodCalo] = useState('');

  useScrollReveal();

  const user = getCurrentUser();

  const fetchData = async () => {
    try {
      const [nutriRes, waterRes, tipRes, goalRes, exerciseRes] = await Promise.all([
        getNutritionSummary(),
        getWaterSummary(),
        getRandomTip(),
        getGoal().catch(() => ({ daily_calorie_goal: 2400, daily_water_target_ml: 2500 })),
        getExerciseSummary().catch(() => ({ total_minutes: 0, total_calories_burned: 0, count: 0 }))
      ]);

      setNutrition({
        consumed: nutriRes?.total_calories || 0,
        target: goalRes?.daily_calorie_goal || 2400
      });
      setNutritionLogs(nutriRes?.logs || []);

      setWater({
        consumed: (waterRes?.total_ml || 0) / 1000,
        target: (goalRes?.daily_water_target_ml || 2500) / 1000
      });
      setWaterLogs(waterRes?.logs || []);
      setWaterStreak(waterRes?.streak_days || 0);

      setExercise({
        minutes: exerciseRes?.total_minutes || 0,
        caloriesBurned: exerciseRes?.total_calories_burned || 0,
        count: exerciseRes?.count || 0
      });

      setTip(tipRes);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickAddNutrition = async (e) => {
    e.preventDefault();
    if (!foodName || !foodCalo) return;

    const hour = new Date().getHours();
    let mealType = 'snack';
    if (hour >= 5 && hour < 10) mealType = 'breakfast';
    else if (hour >= 10 && hour < 14) mealType = 'lunch'; // 10h đến 13h59
    else if (hour >= 18 && hour < 22) mealType = 'dinner'; // 18h đến 21h59

    try {
      await addNutritionLog({ 
        food_name: foodName, 
        calories: parseInt(foodCalo),
        meal_type: mealType,
        logged_at: new Date().toISOString()
      });
      setFoodName('');
      setFoodCalo('');
      fetchData(); // Refresh data
    } catch (error) {
      alert('Không thể thêm nhật ký dinh dưỡng.');
    }
  };

  const handleQuickAddWater = async (amountMl) => {
    try {
      await addWaterLog(amountMl);
      fetchData(); // Refresh data
    } catch (error) {
      alert('Không thể thêm nhật ký nước.');
    }
  };

  const handleUndoNutrition = async () => {
    if (!nutritionLogs || nutritionLogs.length === 0) return;
    const lastLog = nutritionLogs[nutritionLogs.length - 1];
    try {
      await deleteNutritionLog(lastLog.id);
      fetchData();
    } catch (error) {
      alert('Không thể hoàn tác nhật ký dinh dưỡng.');
    }
  };

  const handleUndoWater = async () => {
    if (!waterLogs || waterLogs.length === 0) return;
    const lastLog = waterLogs[waterLogs.length - 1];
    try {
      await deleteWaterLog(lastLog.id);
      fetchData();
    } catch (error) {
      alert('Không thể hoàn tác nhật ký nước.');
    }
  };

  const netCalories = Math.max(nutrition.consumed - exercise.caloriesBurned, 0);
  const percentage = Math.min(Math.round((netCalories / nutrition.target) * 100), 100);

  return (
    <>
      {/* Page Header */}
      <header className="mb-xl reveal">
        <h1 className="text-h1 font-h1 text-on-surface mb-xs">Chào {user?.username || 'bạn'}!</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant">
          Theo dõi hành trình sức khoẻ của bạn hôm nay.
        </p>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">

        {/* Cân Bằng Năng Lượng – Biểu đồ vòng */}
        <section className="md:col-span-8 card flex flex-col md:flex-row items-center gap-xl justify-between reveal reveal-delay-1">
          <div className="flex-1">
            <h2 className="text-h2 font-h2 text-on-surface mb-sm">Cân Bằng Năng Lượng</h2>
            <p className="text-body-md font-body-md text-on-surface-variant mb-lg">
              So sánh tổng năng lượng tiêu thụ với lượng nạp vào của bạn.
            </p>
            <div className="flex flex-col gap-sm">
              {[
                { label: 'Mục Tiêu', value: `${nutrition.target} kcal`, color: '' },
                { label: 'Đã Nạp',   value: `${nutrition.consumed} kcal`, color: 'text-primary', dot: 'bg-primary-container' },
                { label: 'Tiêu Hao', value: `${exercise.caloriesBurned.toFixed(0)} kcal`, color: 'text-orange-500', dot: 'bg-orange-200' },
                { label: 'Net (Nạp - Tiêu)', value: `${netCalories.toFixed(0)} kcal`, color: 'text-on-surface-variant', dot: 'bg-surface-container' },
                { label: 'Còn Lại',  value: `${Math.max(nutrition.target - netCalories, 0).toFixed(0)} kcal`, color: 'text-on-surface-variant', dot: 'bg-surface-container' },
              ].map(({ label, value, color, dot }) => (
                <div key={label}
                     className="flex justify-between items-center border-b border-surface-container-high pb-xs last:border-0 last:pb-0 last:pt-xs">
                  <span className="text-body-md font-body-md text-on-surface flex items-center gap-xs">
                    {dot && <span className={`w-3 h-3 rounded-full ${dot}`}></span>}
                    {label}
                  </span>
                  <span className={`text-h3 font-h3 ${color || 'text-on-surface'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Donut Chart */}
          <div className="w-48 h-48 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Consumed', value: Math.min(percentage, 100) },
                  { name: 'Remaining', value: Math.max(100 - percentage, 0) }
                ]} innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                  <Cell fill="var(--primary)" />
                  <Cell fill="var(--surface-container-high)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-h2 font-h2 text-primary">{percentage}%</span>
              <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wide">Mục Tiêu</span>
            </div>
          </div>
        </section>

        {/* Ghi Nhanh */}
        <section className="md:col-span-4 card flex flex-col reveal reveal-delay-2">
          <div className="flex items-center justify-between mb-lg">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary bg-primary-fixed/20 p-xs rounded-lg">
                restaurant_menu
              </span>
              <h2 className="text-h3 font-h3 text-on-surface">Ghi Nhanh</h2>
            </div>
            {nutritionLogs && nutritionLogs.length > 0 && (
              <button onClick={handleUndoNutrition} type="button" className="flex items-center gap-1 text-on-surface-variant hover:text-red-500 text-label-sm font-semibold transition-colors">
                <span className="material-symbols-outlined text-[18px]">undo</span>
                Hoàn tác
              </button>
            )}
          </div>
          <form className="flex-1 flex flex-col gap-md" onSubmit={handleQuickAddNutrition}>
            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant mb-xs">
                Tên Thức Ăn
              </label>
              <input type="text" 
                     value={foodName}
                     onChange={(e) => setFoodName(e.target.value)}
                     placeholder="VD: Cơm Gà Nướng Salad" className="input-field" />
            </div>
            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant mb-xs">
                Calo (kcal)
              </label>
              <input type="number"
                     value={foodCalo}
                     onChange={(e) => setFoodCalo(e.target.value)}
                     placeholder="VD: 350" className="input-field" />
            </div>
            <button type="submit"
                    className="mt-auto w-full h-xxl bg-primary text-on-primary rounded-lg
                               text-label-md font-label-md hover:bg-surface-tint transition-colors
                               shadow-soft flex items-center justify-center gap-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
              Thêm Nhật Ký
            </button>
          </form>
        </section>

        {/* Theo Dõi Nước */}
        <section className="md:col-span-12 lg:col-span-8 card flex flex-col justify-between reveal reveal-delay-3">
          <div className="flex justify-between items-start mb-md">
            <div>
              <div className="flex items-center gap-sm mb-xs">
                <span className="material-symbols-outlined text-secondary bg-secondary-fixed/30 p-xs rounded-lg">
                  local_drink
                </span>
                <h2 className="text-h3 font-h3 text-on-surface">Theo Dõi Nước</h2>
                {waterLogs && waterLogs.length > 0 && (
                  <button onClick={handleUndoWater} className="ml-2 flex items-center gap-1 text-on-surface-variant hover:text-red-500 text-label-sm font-semibold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">undo</span>
                    Hoàn tác
                  </button>
                )}
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Mục Tiêu Ngày: {water.target}L</p>
            </div>
            <div className="text-right">
              <span className="text-h2 font-h2 text-secondary">{water.consumed}L</span>
              <span className="text-body-sm font-body-sm text-on-surface-variant block">Đã Uống</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-sm bg-surface-container-low p-md rounded-lg">
            {[250, 250, 250, 250, 500, 500].map((amount, i) => {
              const currentTotalMl = water.consumed * 1000;
              const thresholdMl = (i + 1) * 250; // Simple logic for display
              const filled = currentTotalMl >= thresholdMl;
              return (
                <button key={i}
                        onClick={() => handleQuickAddWater(amount)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
                          ${filled
                            ? 'bg-secondary text-on-primary hover:opacity-80'
                            : 'bg-surface border border-outline-variant text-outline hover:bg-surface-dim'
                          }`}>
                  <span className={`material-symbols-outlined ${filled ? 'filled' : ''}`}>
                    water_drop
                  </span>
                </button>
              );
            })}
            <button title="Thêm 250ml"
                    onClick={() => handleQuickAddWater(250)}
                    className="ml-auto w-10 h-10 rounded-full flex items-center justify-center
                               bg-surface border border-outline text-on-surface
                               hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </section>

        {/* Bài Tập Hôm Nay */}
        <section className="md:col-span-12 lg:col-span-4 card flex flex-col justify-between reveal reveal-delay-3">
          <div className="flex items-center gap-sm mb-xs">
            <span className="material-symbols-outlined text-orange-500 bg-orange-100 p-xs rounded-lg">
              fitness_center
            </span>
            <h2 className="text-h3 font-h3 text-on-surface">Bài Tập Hôm Nay</h2>
          </div>
          <div className="mt-md flex justify-between items-center">
            <div>
              <p className="text-body-sm text-on-surface-variant">Thời gian tập</p>
              <p className="text-h2 font-h2 text-on-surface">{exercise.minutes} <span className="text-body-md font-normal">phút</span></p>
            </div>
            <div className="text-right">
              <p className="text-body-sm text-on-surface-variant">Tiêu hao</p>
              <p className="text-h2 font-h2 text-orange-500">{exercise.caloriesBurned.toFixed(0)} <span className="text-body-md font-normal">kcal</span></p>
            </div>
          </div>
        </section>

        {/* Mẹo Sức Khoẻ */}
        <section className="md:col-span-12 lg:col-span-4 bg-primary-fixed rounded-xl p-lg
                             shadow-soft flex flex-col justify-center items-center text-center
                             relative overflow-hidden reveal reveal-delay-4">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
          <span className="material-symbols-outlined text-primary mb-sm relative z-10"
                style={{ fontSize: '32px' }}>
            {tip.icon || 'psychology'}
          </span>
          <h3 className="text-h3 font-h3 text-on-primary-fixed-variant mb-xs relative z-10">
            Mẹo {tip.category || 'Sức Khoẻ'}
          </h3>
          <p className="text-body-sm font-body-sm text-on-primary-fixed-variant relative z-10">
            {tip.content}
          </p>
        </section>

        {/* Gamification: Badges & Streaks */}
        <section className="md:col-span-12 card flex flex-col gap-sm reveal reveal-delay-4">
          <div className="flex items-center gap-sm mb-xs">
            <span className="material-symbols-outlined text-tertiary bg-tertiary-container p-xs rounded-lg">military_tech</span>
            <h2 className="text-h3 font-h3 text-on-surface">Thành Tích & Huy Hiệu</h2>
          </div>
          <div className="flex flex-wrap gap-md mt-sm">
            {/* Streak Badge */}
            <div className={`px-lg py-sm rounded-xl flex items-center gap-sm border ${waterStreak >= 3 ? 'bg-secondary-container border-secondary text-on-secondary-container' : 'bg-surface border-outline-variant text-on-surface-variant'}`}>
              <span className="text-2xl">{waterStreak >= 3 ? '🔥' : '💧'}</span>
              <div>
                <p className="font-bold text-label-md">Chuỗi Uống Nước</p>
                <p className="text-label-sm">{waterStreak} ngày liên tiếp</p>
              </div>
            </div>
            {/* Calorie Badge */}
            <div className={`px-lg py-sm rounded-xl flex items-center gap-sm border ${percentage >= 100 && percentage <= 110 ? 'bg-primary-container border-primary text-on-primary-container' : 'bg-surface border-outline-variant text-on-surface-variant'}`}>
              <span className="text-2xl">{percentage >= 100 && percentage <= 110 ? '🌟' : '🎯'}</span>
              <div>
                <p className="font-bold text-label-md">Cân Bằng Năng Lượng</p>
                <p className="text-label-sm">{percentage >= 100 && percentage <= 110 ? 'Đạt mục tiêu hoàn hảo' : 'Đang tiến tới mục tiêu'}</p>
              </div>
            </div>
            {/* Exercise Badge */}
            <div className={`px-lg py-sm rounded-xl flex items-center gap-sm border ${exercise.minutes >= 30 ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-surface border-outline-variant text-on-surface-variant'}`}>
              <span className="text-2xl">{exercise.minutes >= 30 ? '🏃' : '🚶'}</span>
              <div>
                <p className="font-bold text-label-md">Tập Luyện Đều Đặn</p>
                <p className="text-label-sm">{exercise.minutes >= 30 ? 'Đạt mục tiêu 30 phút' : 'Cần thêm thời gian tập'}</p>
              </div>
            </div>
            {/* Beginner Badge */}
            <div className="px-lg py-sm rounded-xl flex items-center gap-sm border bg-tertiary-container border-tertiary text-on-tertiary-container">
              <span className="text-2xl">🌱</span>
              <div>
                <p className="font-bold text-label-md">Người Mới Bắt Đầu</p>
                <p className="text-label-sm">Bắt đầu hành trình sức khỏe</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DashboardPage;
