import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { getNutritionSummary, getNutritionLogs, addNutritionLog, getGoal, deleteNutritionLog, getNutritionRange } from '../services/healthService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NutritionPage = () => {
  const [summary, setSummary] = useState({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 });
  const [logs, setLogs] = useState([]);
  const [goal, setGoal] = useState({ daily_calorie_goal: 2400 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFood, setNewFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: 'auto' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('day'); // 'day', 'month', 'year'
  const [rangeData, setRangeData] = useState([]);

  useScrollReveal();

  const fetchData = async () => {
    try {
      const goalRes = await getGoal().catch(() => ({ daily_calorie_goal: 2400 }));
      setGoal(goalRes);

      if (filterType === 'day') {
        const [sumRes, logsRes] = await Promise.all([
          getNutritionSummary(selectedDate),
          getNutritionLogs(selectedDate)
        ]);
        setSummary(sumRes || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 });
        setLogs(logsRes || []);
      } else {
        const dateObj = new Date(selectedDate);
        let start, end;
        if (filterType === 'month') {
          start = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1).toISOString().split('T')[0];
          end = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).toISOString().split('T')[0];
        } else {
          start = new Date(dateObj.getFullYear(), 0, 1).toISOString().split('T')[0];
          end = new Date(dateObj.getFullYear(), 11, 31).toISOString().split('T')[0];
        }
        const rangeRes = await getNutritionRange(start, end);
        const data = rangeRes || [];
        setRangeData(data);
        
        if (data.length > 0) {
           const avgCal = data.reduce((s, a) => s + (a.calories || 0), 0) / data.length;
           const avgPro = data.reduce((s, a) => s + (a.protein || 0), 0) / data.length;
           const avgCarbs = data.reduce((s, a) => s + (a.carbs || 0), 0) / data.length;
           const avgFat = data.reduce((s, a) => s + (a.fat || 0), 0) / data.length;
           setSummary({ total_calories: avgCal, total_protein: avgPro, total_carbs: avgCarbs, total_fat: avgFat });
        } else {
           setSummary({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 });
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dinh dưỡng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, filterType]);

  const handleQuickAdd = async (food, forceMealType = null) => {
    let finalMealType = forceMealType;
    if (!finalMealType || finalMealType === 'auto') {
      const hour = new Date().getHours();
      finalMealType = 'snack';
      if (hour >= 5 && hour < 10) finalMealType = 'breakfast';
      else if (hour >= 10 && hour < 14) finalMealType = 'lunch';
      else if (hour >= 18 && hour < 22) finalMealType = 'dinner';
    }

    try {
      await addNutritionLog({
        food_name: food.name,
        calories: food.k,
        protein: food.p_val,
        carbs: food.c_val,
        fat: food.f_val,
        meal_type: finalMealType
      });
      fetchData();
    } catch (error) {
      alert('Không thể thêm thực phẩm.');
    }
  };

  const handleAddCustomFood = async (e) => {
    e.preventDefault();
    if (!newFood.name || !newFood.calories) return;
    await handleQuickAdd({
      name: newFood.name,
      k: Number(newFood.calories),
      p_val: Number(newFood.protein) || 0,
      c_val: Number(newFood.carbs) || 0,
      f_val: Number(newFood.fat) || 0
    }, newFood.meal_type);
    setShowAddModal(false);
    setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: 'auto' });
  };

  const handleUndo = async () => {
    if (!logs || logs.length === 0) return;
    const lastLog = logs[logs.length - 1];
    try {
      await deleteNutritionLog(lastLog.id);
      fetchData();
    } catch (error) {
      alert('Không thể hoàn tác nhật ký dinh dưỡng.');
    }
  };

  const targetCalories = goal?.daily_calorie_goal || 2400;
  const caloriesLeft = Math.max(targetCalories - (summary?.total_calories || 0), 0);
  const caloriePct = Math.min(((summary?.total_calories || 0) / targetCalories) * 100, 100);

  const mealTypes = [
    { id: 'breakfast', label: 'Bữa Sáng', icon: 'sunny' },
    { id: 'lunch', label: 'Bữa Trưa', icon: 'wb_sunny' },
    { id: 'dinner', label: 'Bữa Tối', icon: 'nights_stay' },
    { id: 'snack', label: 'Bữa Phụ', icon: 'cookie' },
  ];

  const recentFoods = [
    { name: 'Sữa Chua Hy Lạp', p: '150g', k: 120, p_val: 15, c_val: 6, f_val: 4 },
    { name: 'Hạnh Nhân Rang',  p: '30g',  k: 170, p_val: 6, c_val: 6, f_val: 14 },
    { name: 'Salad Quinoa',    p: '200g', k: 310, p_val: 10, c_val: 45, f_val: 12 },
  ];

  return (
    <>
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl reveal">
        <div>
          <h1 className="text-h1 font-h1 text-on-surface">Dinh Dưỡng Hàng Ngày</h1>
          <p className="text-body-lg font-body-lg text-outline">Theo dõi hành trình ăn uống hôm nay</p>
        </div>
        <div className="flex flex-col md:flex-row gap-sm items-center">
          <select className="input-field cursor-pointer py-1" value={filterType} onChange={e => setFilterType(e.target.value)}>
             <option value="day">Theo Ngày</option>
             <option value="month">Theo Tháng</option>
             <option value="year">Theo Năm</option>
          </select>
          <div className="relative w-full md:w-auto">
            {filterType === 'day' && (
              <input type="date" 
                     value={selectedDate}
                     onChange={(e) => setSelectedDate(e.target.value)}
                     className="input-field" />
            )}
            {filterType === 'month' && (
              <input type="month" 
                     value={selectedDate.substring(0, 7)}
                     onChange={(e) => setSelectedDate(e.target.value + '-01')}
                     className="input-field" />
            )}
            {filterType === 'year' && (
              <input type="number" 
                     min="2020" max="2100"
                     value={selectedDate.substring(0, 4)}
                     onChange={(e) => setSelectedDate(e.target.value + '-01-01')}
                     className="input-field" />
            )}
          </div>
          <div className="relative w-full md:max-w-xs">
            <input type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Tìm thực phẩm..." className="input-field pl-12" />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-md mb-xl">
        <div className="sm:col-span-2 bg-primary rounded-xl p-xl text-on-primary shadow-soft relative overflow-hidden reveal">
          <div className="relative z-10">
            <p className="text-label-md font-label-md uppercase opacity-80 mb-sm">Calo Còn Lại</p>
            <div className="flex items-baseline gap-2">
              <span className="text-display font-display">{Math.round(caloriesLeft)}</span>
              <span className="text-body-md">kcal</span>
            </div>
            <div className="w-full bg-white/20 h-3 rounded-full mt-lg overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{ width: `${caloriePct}%` }} />
            </div>
            <p className="text-body-sm mt-sm">{Math.round(summary?.total_calories || 0)} đã tiêu thụ / mục tiêu {Math.round(targetCalories)}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>nutrition</span>
          </div>
        </div>
        
        <div className="card flex flex-col justify-between reveal reveal-delay-1">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">egg_alt</span>
          </div>
          <div>
            <p className="text-body-sm text-outline">Protein</p>
            <p className="text-h2 font-h2">{Math.round(summary?.total_protein || 0)}<span className="text-body-sm ml-1 font-normal">g</span></p>
          </div>
        </div>

        <div className="card flex flex-col justify-between reveal reveal-delay-2">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-tertiary bg-tertiary-container/20 p-2 rounded-lg">grain</span>
          </div>
          <div>
            <p className="text-body-sm text-outline">Carbs</p>
            <p className="text-h2 font-h2">{Math.round(summary?.total_carbs || 0)}<span className="text-body-sm ml-1 font-normal">g</span></p>
          </div>
        </div>

        <div className="card flex flex-col justify-between reveal reveal-delay-3">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-inverse-primary bg-inverse-primary/20 p-2 rounded-lg">water_drop</span>
          </div>
          <div>
            <p className="text-body-sm text-outline">Fat</p>
            <p className="text-h2 font-h2">{Math.round(summary?.total_fat || 0)}<span className="text-body-sm ml-1 font-normal">g</span></p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {filterType === 'day' ? (
          <div className="lg:col-span-2 flex flex-col gap-lg">
            {mealTypes.map((type, typeIdx) => {
            const mealLogs = (logs || []).filter(l => (l.meal_type || 'snack') === type.id && (!searchQuery || l.food_name.toLowerCase().includes(searchQuery.toLowerCase())));
            const mealCalories = mealLogs.reduce((acc, curr) => acc + (curr.calories || 0), 0);
            
            return (
              <div key={type.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-soft reveal" style={{ animationDelay: `${typeIdx * 100}ms` }}>
                <div className="bg-surface-container px-md py-sm flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">{type.icon}</span>
                    <h3 className="text-h3 font-h3">{type.label}</h3>
                  </div>
                  <span className="text-body-sm font-bold text-on-surface-variant">{mealCalories} kcal</span>
                </div>
                <div className="p-md flex flex-col gap-md">
                  {mealLogs.length > 0 ? (
                    mealLogs.map((item, idx) => (
                      <div key={item.id} className={`flex items-center justify-between ${idx < mealLogs.length - 1 ? 'border-b border-outline-variant/30 pb-md' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-outline text-sm">restaurant</span>
                          </div>
                          <div>
                            <p className="text-body-md font-semibold text-on-surface">{item.food_name}</p>
                            <p className="text-xs text-outline">
                              {new Date(item.logged_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-body-md">{item.calories} kcal</p>
                          {(item.protein || item.carbs || item.fat) && (
                            <p className="text-[10px] uppercase font-bold text-outline">
                              P:{item.protein || 0} C:{item.carbs || 0} F:{item.fat || 0}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-xl text-center border-2 border-dashed border-outline-variant rounded-xl">
                      <p className="text-outline italic text-body-sm">Chưa có nhật ký {type.label.toLowerCase()}</p>
                    </div>
                  )}
                  <button onClick={() => setShowAddModal(true)}
                          className="flex items-center gap-2 text-primary font-bold text-body-sm hover:underline">
                    <span className="material-symbols-outlined text-sm">add_circle</span>Thêm Thực Phẩm
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <div className="lg:col-span-2 flex flex-col gap-lg">
            <div className="card p-xl reveal h-full">
               <h3 className="text-h3 font-h3 mb-md">Lịch sử Tiêu Thụ Calo ({filterType === 'month' ? 'Tháng' : 'Năm'})</h3>
               <div className="h-96 w-full mt-lg">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={rangeData}>
                     <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                     <XAxis dataKey="date" tick={{fill: 'var(--on-surface-variant)'}} axisLine={false} tickLine={false} tickFormatter={(val) => val.substring(5)} />
                     <YAxis tick={{fill: 'var(--on-surface-variant)'}} axisLine={false} tickLine={false} />
                     <Tooltip contentStyle={{borderRadius: '8px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)'}} />
                     <Area type="monotone" dataKey="calories" stroke="var(--primary)" strokeWidth={3} fill="var(--primary)" fillOpacity={0.2} name="Calo" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className="flex flex-col gap-lg">
          {/* Macros Summary */}
          <div className="card reveal">
            <h3 className="text-h3 font-h3 mb-md">Phân Tích Macro</h3>
            <div className="flex flex-col gap-md">
              {[
                { label: 'Carbohydrate', current: summary?.total_carbs || 0, target: (targetCalories * 0.5) / 4, color: 'bg-tertiary-container' },
                { label: 'Protein',      current: summary?.total_protein || 0, target: (targetCalories * 0.3) / 4, color: 'bg-primary' },
                { label: 'Chất Béo',     current: summary?.total_fat || 0, target: (targetCalories * 0.2) / 9, color: 'bg-inverse-primary' },
              ].map(({ label, current, target, color }) => (
                <div key={label} className="flex flex-col gap-xs">
                  <div className="flex justify-between text-body-sm">
                    <span className="font-semibold">{label}</span>
                    <span className="text-outline">{Math.round(current)}g / {Math.round(target)}g</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className={`${color} h-full rounded-full`} style={{ width: `${Math.min((current / (target || 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thực phẩm thường dùng */}
          <div className="card reveal reveal-delay-1">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-h3 font-h3">Thường Dùng</h3>
              <div className="flex items-center gap-sm">
                {logs && logs.length > 0 && (
                  <button onClick={handleUndo} className="flex items-center gap-1 text-on-surface-variant hover:text-red-500 text-label-sm font-semibold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">undo</span>
                    Hoàn tác
                  </button>
                )}
                <span className="material-symbols-outlined text-outline">history</span>
              </div>
            </div>
            <div className="flex flex-col gap-sm">
              {recentFoods.map((food) => (
                <div key={food.name} 
                     onClick={() => handleQuickAdd(food)}
                     className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-lg transition-all cursor-pointer group">
                  <div>
                    <p className="text-body-sm font-semibold">{food.name}</p>
                    <p className="text-xs text-outline">{food.p} • {food.k} kcal</p>
                  </div>
                  <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">add</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mẹo */}
          <div className="bg-surface-container-high rounded-xl p-md border border-primary/20 reveal reveal-delay-2">
            <div className="flex items-center gap-2 mb-sm text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <span className="font-bold text-label-sm uppercase">Gợi ý AI</span>
            </div>
            <p className="text-body-sm text-on-surface">Bạn đang nạp protein khá tốt hôm nay. Hãy thử thêm một chút rau xanh vào bữa tiếp theo nhé!</p>
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl p-lg w-full max-w-md">
            <h3 className="text-h3 font-h3 mb-md">Thêm Thực Phẩm Mới</h3>
            <form onSubmit={handleAddCustomFood} className="flex flex-col gap-sm">
              <input required placeholder="Tên món ăn" className="input-field" value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} />
              <input required type="number" placeholder="Calo (kcal)" className="input-field" value={newFood.calories} onChange={e => setNewFood({...newFood, calories: e.target.value})} />
              <div className="grid grid-cols-3 gap-sm">
                <input type="number" placeholder="Protein (g)" className="input-field" value={newFood.protein} onChange={e => setNewFood({...newFood, protein: e.target.value})} />
                <input type="number" placeholder="Carbs (g)" className="input-field" value={newFood.carbs} onChange={e => setNewFood({...newFood, carbs: e.target.value})} />
                <input type="number" placeholder="Fat (g)" className="input-field" value={newFood.fat} onChange={e => setNewFood({...newFood, fat: e.target.value})} />
              </div>
              <div className="mt-sm">
                <select className="input-field appearance-none cursor-pointer" value={newFood.meal_type} onChange={e => setNewFood({...newFood, meal_type: e.target.value})}>
                  <option value="auto">Tự động chọn bữa (theo giờ)</option>
                  <option value="breakfast">Bữa Sáng</option>
                  <option value="lunch">Bữa Trưa</option>
                  <option value="dinner">Bữa Tối</option>
                  <option value="snack">Bữa Phụ</option>
                </select>
              </div>
              <div className="flex gap-sm mt-md">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-surface-container text-on-surface py-2 rounded-lg font-bold">Hủy</button>
                <button type="submit" className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-bold">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NutritionPage;
