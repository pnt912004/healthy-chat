import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { getNutritionSummary, getNutritionLogs, addNutritionLog, getGoal, deleteNutritionLog, getNutritionRange } from '../services/healthService';
import foodService from '../services/foodService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NutritionPage = () => {
  const [summary, setSummary] = useState({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 });
  const [logs, setLogs] = useState([]);
  const [goal, setGoal] = useState({ daily_calorie_goal: 2400 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Custom or manual food form
  const [newFood, setNewFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: 'auto' });
  
  // Advanced features state
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [foodSearchText, setFoodSearchText] = useState('');
  const [foodSearchResults, setFoodSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);

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

  const fetchFoodData = async () => {
    try {
      const cats = await foodService.getCategories();
      setCategories(cats);
      const favs = await foodService.getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Lỗi tải dữ liệu foods:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, filterType]);

  useEffect(() => {
    fetchFoodData();
  }, []);

  useEffect(() => {
    if (foodSearchText.length > 2) {
      const delaySearch = setTimeout(async () => {
        try {
          const res = await foodService.searchFoods(foodSearchText);
          setFoodSearchResults(res.items);
        } catch (e) {
          console.error(e);
        }
      }, 500);
      return () => clearTimeout(delaySearch);
    } else {
      setFoodSearchResults([]);
    }
  }, [foodSearchText]);

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
        calories: food.calories || food.k,
        protein: food.protein || food.p_val || 0,
        carbs: food.carbs || food.c_val || 0,
        fat: food.fat || food.f_val || 0,
        meal_type: finalMealType
      });
      fetchData();
      setShowAddModal(false);
    } catch (error) {
      alert('Không thể thêm thực phẩm.');
    }
  };

  const handleAddCustomFood = async (e) => {
    e.preventDefault();
    if (!newFood.name || !newFood.calories) return;
    await handleQuickAdd({
      name: newFood.name,
      calories: Number(newFood.calories),
      protein: Number(newFood.protein) || 0,
      carbs: Number(newFood.carbs) || 0,
      fat: Number(newFood.fat) || 0
    }, newFood.meal_type);
    setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '', meal_type: 'auto' });
  };

  const handleAIEstimate = async () => {
    if (!aiQuery) return;
    setAiLoading(true);
    try {
      const result = await foodService.aiEstimateFood(aiQuery);
      setNewFood({
        name: result.food_name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        meal_type: 'auto'
      });
    } catch (error) {
      alert('Không thể ước tính tự động.');
    } finally {
      setAiLoading(false);
    }
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

  const toggleFavorite = async (foodId, isFav) => {
    try {
      if (isFav) {
        await foodService.removeFavorite(foodId);
      } else {
        await foodService.addFavorite(foodId);
      }
      fetchFoodData();
    } catch (error) {
      console.error(error);
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
                   placeholder="Lọc nhật ký..." className="input-field pl-12" />
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
            const mealLogs = (logs || []).filter(l => (l.meal_type || 'snack') === type.id && (!searchQuery || (l.food_name || '').toLowerCase().includes(searchQuery.toLowerCase())));
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
                  <button onClick={() => { setNewFood({...newFood, meal_type: type.id}); setShowAddModal(true); }}
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

          {/* Món Ăn Yêu Thích */}
          <div className="card reveal reveal-delay-1">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-h3 font-h3">Món Yêu Thích</h3>
              <div className="flex items-center gap-sm">
                {logs && logs.length > 0 && (
                  <button onClick={handleUndo} className="flex items-center gap-1 text-on-surface-variant hover:text-red-500 text-label-sm font-semibold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">undo</span>
                    Hoàn tác
                  </button>
                )}
                <span className="material-symbols-outlined text-outline">favorite</span>
              </div>
            </div>
            <div className="flex flex-col gap-sm max-h-60 overflow-y-auto pr-2">
              {favorites.length > 0 ? favorites.map((fav) => (
                <div key={fav.id} 
                     className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-lg transition-all group">
                  <div className="flex-1 cursor-pointer" onClick={() => handleQuickAdd({
                    name: fav.food.name,
                    calories: fav.food.calories_per_100g,
                    protein: fav.food.protein_per_100g,
                    carbs: fav.food.carbs_per_100g,
                    fat: fav.food.fat_per_100g
                  })}>
                    <p className="text-body-sm font-semibold">{fav.food.name}</p>
                    <p className="text-xs text-outline">{fav.food.default_portion_g}g • {fav.food.calories_per_100g} kcal</p>
                  </div>
                  <button onClick={() => toggleFavorite(fav.food.id, true)}>
                    <span className="material-symbols-outlined text-primary text-sm">favorite</span>
                  </button>
                </div>
              )) : (
                <p className="text-outline text-sm italic">Chưa có món yêu thích</p>
              )}
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

      {/* Add Food Modal with Smart Search */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-surface rounded-xl p-lg w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-h3 font-h3 mb-md">Thêm Thực Phẩm</h3>
            
            {/* AI Smart Input */}
            <div className="bg-primary/5 rounded-lg p-md mb-md border border-primary/20">
              <p className="text-body-sm font-semibold text-primary mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">magic_button</span> Ước tính bằng AI
              </p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Vd: 1 bát phở bò, 2 quả trứng luộc..." 
                  className="input-field flex-1 text-sm"
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAIEstimate()}
                />
                <button 
                  onClick={handleAIEstimate} 
                  disabled={aiLoading}
                  className="bg-primary text-on-primary px-3 rounded-lg flex items-center justify-center"
                >
                  {aiLoading ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Phân tích'}
                </button>
              </div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleAddCustomFood} className="flex flex-col gap-sm">
              <div className="relative">
                <input 
                  required 
                  placeholder="Tìm hoặc nhập tên món ăn..." 
                  className="input-field w-full" 
                  value={newFood.name} 
                  onChange={e => {
                    setNewFood({...newFood, name: e.target.value});
                    setFoodSearchText(e.target.value);
                  }} 
                />
                {foodSearchResults.length > 0 && foodSearchText.length > 2 && (
                  <div className="absolute top-full left-0 right-0 bg-surface shadow-lg rounded-lg border border-outline-variant mt-1 z-50 max-h-48 overflow-y-auto">
                    {foodSearchResults.map(f => {
                      const isFav = favorites.some(fav => fav.food_id === f.id);
                      return (
                      <div key={f.id} className="p-2 border-b border-outline-variant flex justify-between items-center hover:bg-surface-container cursor-pointer">
                        <div onClick={() => {
                          setNewFood({
                            ...newFood,
                            name: f.name,
                            calories: f.calories_per_100g,
                            protein: f.protein_per_100g,
                            carbs: f.carbs_per_100g,
                            fat: f.fat_per_100g
                          });
                          setFoodSearchResults([]);
                        }}>
                          <p className="text-body-sm font-bold">{f.name}</p>
                          <p className="text-xs text-outline">{f.calories_per_100g} kcal / 100g</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); toggleFavorite(f.id, isFav); }}>
                          <span className={`material-symbols-outlined text-sm ${isFav ? 'text-primary font-bold' : 'text-outline'}`}>favorite</span>
                        </button>
                      </div>
                    )})}
                  </div>
                )}
              </div>
              <input required type="number" step="0.1" placeholder="Calo (kcal)" className="input-field" value={newFood.calories} onChange={e => setNewFood({...newFood, calories: e.target.value})} />
              <div className="grid grid-cols-3 gap-sm">
                <input type="number" step="0.1" placeholder="Protein (g)" className="input-field" value={newFood.protein} onChange={e => setNewFood({...newFood, protein: e.target.value})} />
                <input type="number" step="0.1" placeholder="Carbs (g)" className="input-field" value={newFood.carbs} onChange={e => setNewFood({...newFood, carbs: e.target.value})} />
                <input type="number" step="0.1" placeholder="Fat (g)" className="input-field" value={newFood.fat} onChange={e => setNewFood({...newFood, fat: e.target.value})} />
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
