import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { getExerciseSummary, addExerciseLog, deleteExerciseLog, getExerciseWeekly, getExerciseRange, getExerciseLogs } from '../services/exerciseService';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const quickActivities = [
  { icon: 'directions_run', label: 'Chạy bộ' },
  { icon: 'directions_bike', label: 'Đạp xe' },
  { icon: 'self_improvement', label: 'Yoga' },
  { icon: 'fitness_center', label: 'Gym' },
  { icon: 'pool', label: 'Bơi' },
  { icon: 'directions_walk', label: 'Đi bộ' },
];

const ExercisePage = () => {
  const [summary, setSummary] = useState({ total_minutes: 0, total_calories_burned: 0, count: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('day');
  const [rangeData, setRangeData] = useState([]);

  const [newLog, setNewLog] = useState({ exercise_type: 'Chạy bộ', duration_minutes: 30, intensity: 'moderate', notes: '' });

  useScrollReveal();

  const fetchData = async () => {
    setLoading(true);
    try {
      if (filterType === 'day') {
        const [sumRes, weeklyRes, logsRes] = await Promise.all([
          getExerciseSummary(selectedDate).catch(() => ({ total_minutes: 0, total_calories_burned: 0, count: 0 })),
          getExerciseWeekly(selectedDate).catch(() => ({ days: [] })),
          getExerciseLogs(selectedDate).catch(() => [])
        ]);
        setSummary(sumRes);
        setWeekData(weeklyRes.days || []);
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
        const rangeRes = await getExerciseRange(start, end).catch(() => ({ days: [], total_calories: 0, total_minutes: 0 }));
        setRangeData(rangeRes.days || []);
        setSummary({
          total_minutes: rangeRes.total_minutes || 0,
          total_calories_burned: rangeRes.total_calories || 0,
          count: 0
        });
        setLogs([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu bài tập:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, filterType]);

  const handleAddLog = async (e) => {
    if (e) e.preventDefault();
    try {
      await addExerciseLog({
        ...newLog,
        logged_at: new Date(selectedDate).toISOString()
      });
      fetchData();
      setNewLog({ ...newLog, duration_minutes: 30, notes: '' });
    } catch (error) {
      alert('Không thể thêm nhật ký bài tập.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExerciseLog(id);
      fetchData();
    } catch (error) {
      alert('Không thể xóa bài tập.');
    }
  };

  return (
    <>
      {/* Header */}
      <header className="mb-xl reveal flex flex-col md:flex-row justify-between md:items-end gap-sm">
        <div>
          <h1 className="text-h1 font-h1 text-on-surface mb-xs">Theo Dõi Bài Tập</h1>
          <p className="text-on-surface-variant font-body-md">Ghi lại hoạt động thể chất để theo dõi lượng calo tiêu thụ.</p>
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
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        {/* ── Left Column ── */}
        <div className="md:col-span-8 flex flex-col gap-lg">

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md reveal">
            <div className="card bg-primary text-on-primary flex items-center justify-between">
              <div>
                <p className="text-body-md opacity-80 uppercase tracking-wider mb-1">Calories Đốt Cháy</p>
                <h2 className="text-display font-display">{summary.total_calories_burned.toFixed(0)} <span className="text-h3 font-h3">kcal</span></h2>
              </div>
              <span className="material-symbols-outlined text-5xl opacity-50">local_fire_department</span>
            </div>
            <div className="card bg-surface-container-low border border-outline-variant flex items-center justify-between">
              <div>
                <p className="text-body-md text-on-surface-variant uppercase tracking-wider mb-1">Thời Gian Tập</p>
                <h2 className="text-display font-display text-on-surface">{summary.total_minutes} <span className="text-h3 font-h3 text-on-surface-variant">phút</span></h2>
              </div>
              <span className="material-symbols-outlined text-5xl text-primary opacity-50">timer</span>
            </div>
          </div>

          {filterType === 'day' && (
            <div className="card reveal reveal-delay-1">
              <h3 className="text-h3 font-h3 text-on-surface mb-lg">Thêm Bài Tập</h3>
              
              <div className="flex gap-sm overflow-x-auto pb-4 mb-4 hide-scrollbar">
                {quickActivities.map(act => (
                  <button key={act.label} 
                          onClick={() => setNewLog({...newLog, exercise_type: act.label})}
                          className={`flex-shrink-0 flex items-center gap-xs px-4 py-2 rounded-full border transition-colors ${newLog.exercise_type === act.label ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'}`}>
                    <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
                    <span className="text-label-md">{act.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddLog} className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="text-label-sm text-on-surface-variant">Loại bài tập</label>
                  <input type="text" className="input-field" value={newLog.exercise_type} onChange={e => setNewLog({...newLog, exercise_type: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm text-on-surface-variant">Thời gian (phút)</label>
                  <input type="number" min="1" className="input-field" value={newLog.duration_minutes} onChange={e => setNewLog({...newLog, duration_minutes: parseInt(e.target.value) || 0})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm text-on-surface-variant">Cường độ</label>
                  <select className="input-field" value={newLog.intensity} onChange={e => setNewLog({...newLog, intensity: e.target.value})}>
                    <option value="low">Nhẹ nhàng</option>
                    <option value="moderate">Vừa phải</option>
                    <option value="high">Mạnh</option>
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2 flex items-end">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto ml-auto">Ghi Nhận</button>
                </div>
              </form>
            </div>
          )}

          {/* Chart */}
          <div className="card reveal reveal-delay-2 flex flex-col h-96">
            <div className="flex justify-between items-center mb-xl">
              <h3 className="text-h3 font-h3 text-on-surface">Calories Tiêu Hao {filterType === 'day' ? '(Tuần)' : (filterType === 'month' ? '(Tháng)' : '(Năm)')}</h3>
            </div>
            <div className="flex-1 w-full">
              {filterType === 'day' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="date" tick={{fill: 'var(--on-surface-variant)'}} axisLine={false} tickLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString('vi-VN', {weekday: 'short'})} />
                    <YAxis tick={{fill: 'var(--on-surface-variant)'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{borderRadius: '8px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)'}} cursor={{fill: 'var(--surface-variant)', opacity: 0.4}} />
                    <Bar dataKey="calories_burned" fill="#f97316" radius={[4, 4, 0, 0]} name="Calories (kcal)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rangeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="date" tick={{fill: 'var(--on-surface-variant)'}} axisLine={false} tickLine={false} tickFormatter={(val) => val.substring(5)} />
                    <YAxis tick={{fill: 'var(--on-surface-variant)'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{borderRadius: '8px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)'}} />
                    <Area type="monotone" dataKey="calories_burned" stroke="#f97316" strokeWidth={3} fill="#f97316" fillOpacity={0.2} name="Calories (kcal)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

        {/* ── Right Column: History ── */}
        <div className="md:col-span-4 flex flex-col gap-lg">
          {filterType === 'day' && (
            <div className="card reveal reveal-delay-2 flex-1">
              <h3 className="text-h3 font-h3 text-on-surface mb-md">Lịch Sử Hôm Nay</h3>
              {logs.length === 0 ? (
                <div className="text-center py-xl text-on-surface-variant flex flex-col items-center">
                  <span className="material-symbols-outlined text-5xl mb-2 opacity-50">fitness_center</span>
                  <p>Chưa có bài tập nào hôm nay</p>
                </div>
              ) : (
                <div className="space-y-sm">
                  {logs.map(log => (
                    <div key={log.id} className="p-md rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-between group">
                      <div>
                        <p className="font-bold text-on-surface">{log.exercise_type}</p>
                        <p className="text-label-sm text-on-surface-variant">{log.duration_minutes} phút • {log.calories_burned.toFixed(0)} kcal</p>
                      </div>
                      <button onClick={() => handleDelete(log.id)} className="text-on-surface-variant hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Tip Card */}
          <div className="relative overflow-hidden bg-[#f97316] text-white rounded-xl p-xl
                           min-h-[200px] flex flex-col justify-end group reveal reveal-delay-3">
            <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop"
                 alt="Mẹo Tập Luyện" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-500" />
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded text-label-sm mb-2">Động Lực</span>
              <h4 className="text-h3 font-h3 leading-tight mb-2">Duy trì sự đều đặn.</h4>
              <p className="text-body-sm text-white/80">Chỉ cần 30 phút mỗi ngày sẽ tạo nên sự khác biệt lớn cho sức khỏe tim mạch.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExercisePage;
