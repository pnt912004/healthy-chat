import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { getWaterSummary, addWaterLog, getGoal, deleteWaterLog, getWaterWeekly, getWaterRange } from '../services/healthService';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const quickLogs = [
  { icon: 'water_full', label: '250 ml', sub: 'Ly Nhỏ', amount: 250 },
  { icon: 'local_drink', label: '500 ml', sub: 'Chai Vừa', amount: 500 },
  { icon: 'opacity',     label: '150 ml', sub: 'Ngụm Nhỏ', amount: 150 },
  { icon: 'add',         label: '1000 ml', sub: 'Chai Lớn', amount: 1000 },
];

const WaterTrackerPage = () => {
  const [currentMl, setCurrentMl] = useState(0);
  const [goalMl, setGoalMl] = useState(2500);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('day');
  const [rangeData, setRangeData] = useState([]);

  useScrollReveal();

  const fetchData = async () => {
    try {
      const goalRes = await getGoal().catch(() => ({ daily_water_target_ml: 2500 }));
      setGoalMl(goalRes.daily_water_target_ml || 2500);

      if (filterType === 'day') {
        const [sumRes, weeklyRes] = await Promise.all([
          getWaterSummary(selectedDate),
          getWaterWeekly(selectedDate).catch(() => [])
        ]);
        setCurrentMl(sumRes.total_ml || 0);
        setLogs(sumRes.logs || []);
        const normalizedWeek = Array.isArray(weeklyRes) ? weeklyRes : Array.isArray(weeklyRes?.data) ? weeklyRes.data : Array.isArray(weeklyRes?.weekly) ? weeklyRes.weekly : Array.isArray(weeklyRes?.week) ? weeklyRes.week : [];
        setWeekData(normalizedWeek);
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
        const rangeRes = await getWaterRange(start, end);
        setRangeData(rangeRes);
        
        if (rangeRes.length > 0) {
           const avg = rangeRes.reduce((s, a) => s + a.total_ml, 0) / rangeRes.length;
           setCurrentMl(avg);
        } else {
           setCurrentMl(0);
        }
        setLogs([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu nước:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, filterType]);

  const handleAddWater = async (amount) => {
    try {
      await addWaterLog(amount);
      fetchData();
    } catch (error) {
      alert('Không thể thêm nhật ký nước.');
    }
  };

  const handleUndo = async () => {
    if (!logs || logs.length === 0) return;
    const lastLog = logs[logs.length - 1];
    try {
      await deleteWaterLog(lastLog.id);
      fetchData();
    } catch (error) {
      alert('Không thể hoàn tác nhật ký nước.');
    }
  };

  const currentL = (currentMl / 1000).toFixed(1);
  const goalL = (goalMl / 1000).toFixed(1);
  const pct = Math.min(Math.round((currentMl / goalMl) * 100), 100);
  
  return (
    <>
      {/* Header */}
      <header className="mb-xl reveal flex flex-col md:flex-row justify-between md:items-end gap-sm">
        <div>
          <h1 className="text-h1 font-h1 text-on-surface mb-xs">Lượng Nước Uống</h1>
          <p className="text-on-surface-variant font-body-md">Duy trì đủ nước giúp tăng sự tập trung và năng lượng.</p>
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
        {/* ── Left: Main Tracker ── */}
        <div className="md:col-span-8 flex flex-col gap-lg">

          {/* Progress Ring Card */}
          <div className="card flex flex-col md:flex-row items-center justify-between gap-xl reveal">
            {/* SVG Ring */}
            <div className="relative w-56 h-56 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="112" cy="112" r="95" fill="transparent"
                        stroke="currentColor" strokeWidth="12"
                        className="text-surface-container-high" />
                <circle cx="112" cy="112" r="95" fill="transparent"
                        stroke="currentColor" strokeWidth="12"
                        strokeDasharray="597"
                        strokeDashoffset={597 - (pct / 100) * 597}
                        strokeLinecap="round"
                        className="text-primary transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-display font-display text-on-surface">{currentL}</span>
                <span className="text-body-md text-on-surface-variant">Lít / {goalL}L</span>
                <span className="mt-2 inline-flex px-3 py-1 bg-secondary-container
                                  text-on-secondary-container rounded-full text-label-sm">
                  {pct}% Mục Tiêu
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-md w-full">
              <h2 className="text-h2 font-h2 text-on-surface">
                {pct >= 100 ? 'Tuyệt vời!' : 'Tiến Độ Tốt!'}
              </h2>
              <p className="text-on-surface-variant text-body-md">
                {pct >= 100 
                  ? 'Bạn đã hoàn thành mục tiêu uống nước hôm nay!' 
                  : `Bạn chỉ còn cách mục tiêu hàng ngày ${((goalMl - currentMl) / 1000).toFixed(1)}L. Tiếp tục uống nhé!`}
              </p>
              <div className="flex gap-md">
                <div className="p-md bg-surface-container-low rounded-lg flex-1">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Đã Uống</span>
                  <span className="text-h3 font-h3 text-on-surface">{currentMl} ml</span>
                </div>
                <div className="p-md bg-surface-container-low rounded-lg flex-1">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Mục Tiêu</span>
                  <span className="text-h3 font-h3 text-on-surface">{goalMl} ml</span>
                </div>
              </div>
            </div>
          </div>

          {filterType === 'day' && (
            <div className="card reveal reveal-delay-1">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="text-h3 font-h3 text-on-surface">Ghi Nhanh</h3>
                {logs && logs.length > 0 && (
                  <button onClick={handleUndo} className="flex items-center gap-1 text-on-surface-variant hover:text-red-500 text-label-sm font-semibold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">undo</span>
                    Hoàn tác
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
                {quickLogs.map(({ icon, label, sub, amount }) => (
                  <button key={label}
                          onClick={() => handleAddWater(amount)}
                          className="flex flex-col items-center gap-sm p-lg border border-outline-variant
                                     rounded-xl hover:bg-surface-container hover:border-primary
                                     transition-all active:scale-95 group">
                    <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">
                      {icon}
                    </span>
                    <span className="font-bold text-on-surface text-body-sm">{label}</span>
                    <span className="text-label-sm text-on-surface-variant">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Chart */}
          <div className="card reveal reveal-delay-2 flex flex-col h-96">
            <div className="flex justify-between items-center mb-xl">
              <h3 className="text-h3 font-h3 text-on-surface">Lịch Sử Uống Nước {filterType === 'day' ? '(Tuần)' : (filterType === 'month' ? '(Tháng)' : '(Năm)')}</h3>
              <div className="flex gap-xs items-center">
                <span className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-label-sm text-on-surface-variant">Nước (ml)</span>
              </div>
            </div>
            <div className="flex-1 w-full">
              {filterType === 'day' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="day_label" tick={{fill: 'var(--on-surface-variant)'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: 'var(--on-surface-variant)'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{borderRadius: '8px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)'}} cursor={{fill: 'var(--surface-variant)', opacity: 0.4}} />
                    <Bar dataKey="total_ml" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Nước (ml)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rangeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="date" tick={{fill: 'var(--on-surface-variant)'}} axisLine={false} tickLine={false} tickFormatter={(val) => val.substring(5)} />
                    <YAxis tick={{fill: 'var(--on-surface-variant)'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{borderRadius: '8px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)'}} />
                    <Area type="monotone" dataKey="total_ml" stroke="var(--primary)" strokeWidth={3} fill="var(--primary)" fillOpacity={0.2} name="Nước (ml)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Tips ── */}
        <div className="md:col-span-4 flex flex-col gap-lg">

          {/* Tip Card */}
          <div className="relative overflow-hidden bg-primary text-on-primary rounded-xl p-xl
                           min-h-[200px] flex flex-col justify-end group reveal reveal-delay-1">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaA6djie4zWj15Mbhd-kWwZuDhKZb8EqoCUOem-I9Qu6hRLtTiF6PXDa5ec8ShGnfjKIeKY7lAsqFJX7qsSw24u93kWpHY2_Rje4uWSjhXHGYOwsrSjnG6PdG4sjOgUuIXAyfaNKPVSPfc0LlYXNgY83l-kdwbq98zuyLYsB7E4YAipYwadfTYIGsRYR_GI1UuwpWPiPypksl2VVCUdDBf2pbGtVxDWDEQoEdDrYU6PQBtoJQs27E8q3SZdQ1Nq38fGbAFnf_fNGfc"
                 alt="Mẹo Nước" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-500" />
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded text-label-sm mb-2">Mẹo Hôm Nay</span>
              <h4 className="text-h3 font-h3 leading-tight mb-2">Uống nước ngay sau khi thức dậy.</h4>
              <p className="text-body-sm text-white/80">Bù nước ngay sau khi ngủ dậy giúp khởi động trao đổi chất và chức năng não bộ.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WaterTrackerPage;
