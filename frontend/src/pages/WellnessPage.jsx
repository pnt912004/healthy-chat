import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { addSleepLog, getSleepLogs, getSleepSummary, deleteSleepLog, addMoodLog, getMoodLogs, deleteMoodLog, getWellnessInsights } from '../services/wellnessService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOODS = [
  { emoji: '😊', label: 'Vui vẻ', value: 'happy' },
  { emoji: '😐', label: 'Bình thường', value: 'neutral' },
  { emoji: '😔', label: 'Buồn bã', value: 'sad' },
  { emoji: '😤', label: 'Tức giận', value: 'angry' },
  { emoji: '😴', label: 'Mệt mỏi', value: 'tired' },
];

const TAGS = ['stress', 'happy', 'anxious', 'energetic', 'focused', 'tired', 'sick', 'relaxed'];

const WellnessPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  
  // Sleep state
  const [sleepLogs, setSleepLogs] = useState([]);
  const [sleepSummary, setSleepSummary] = useState({ avg_duration_hours: 0, streak_days: 0 });
  const [newSleep, setNewSleep] = useState({ sleep_time: '22:00', wake_time: '06:00', quality: 3, notes: '' });
  
  // Mood state
  const [moodLogs, setMoodLogs] = useState([]);
  const [newMood, setNewMood] = useState({ mood: 'happy', energy_level: 3, tags: [], notes: '' });
  
  // Insights state
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useScrollReveal();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sleeps, moods, summary] = await Promise.all([
        getSleepLogs(selectedDate).catch(() => []),
        getMoodLogs(selectedDate).catch(() => []),
        getSleepSummary().catch(() => ({ avg_duration_hours: 0, streak_days: 0 }))
      ]);
      setSleepLogs(sleeps);
      setMoodLogs(moods);
      setSleepSummary(summary);
    } catch (error) {
      console.error('Lỗi tải dữ liệu wellness', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await getWellnessInsights();
      setInsights(res.insights);
    } catch (e) {
      setInsights('Không thể tải AI Insights lúc này.');
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleAddSleep = async (e) => {
    e.preventDefault();
    try {
      // Create datetime from selectedDate and time inputs
      const sleepDT = new Date(`${selectedDate}T${newSleep.sleep_time}:00`);
      let wakeDT = new Date(`${selectedDate}T${newSleep.wake_time}:00`);
      
      // If wake time is before sleep time, assume wake time is the next day
      if (wakeDT <= sleepDT) {
        wakeDT.setDate(wakeDT.getDate() + 1);
      }
      
      await addSleepLog({
        sleep_time: sleepDT.toISOString(),
        wake_time: wakeDT.toISOString(),
        quality: newSleep.quality,
        notes: newSleep.notes,
        logged_at: new Date().toISOString()
      });
      fetchData();
    } catch (error) {
      alert('Lỗi thêm nhật ký giấc ngủ.');
    }
  };

  const handleAddMood = async (e) => {
    e.preventDefault();
    try {
      await addMoodLog({
        ...newMood,
        logged_at: new Date().toISOString()
      });
      fetchData();
      setNewMood({ ...newMood, tags: [], notes: '' });
    } catch (error) {
      alert('Lỗi thêm nhật ký cảm xúc.');
    }
  };

  const toggleTag = (tag) => {
    setNewMood(prev => {
      const tags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags };
    });
  };

  return (
    <>
      {/* Header */}
      <header className="mb-xl reveal flex flex-col md:flex-row justify-between md:items-end gap-sm">
        <div>
          <h1 className="text-h1 font-h1 text-on-surface mb-xs">Sức Khỏe Tinh Thần & Giấc Ngủ</h1>
          <p className="text-on-surface-variant font-body-md">Theo dõi cảm xúc và giấc ngủ để cải thiện chất lượng cuộc sống.</p>
        </div>
        <div className="flex gap-sm items-center">
          <input type="date" 
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="input-field max-w-xs" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        {/* ── Left Column ── */}
        <div className="md:col-span-8 flex flex-col gap-lg">

          {/* Sleep Logger */}
          <div className="card reveal">
            <div className="flex items-center gap-sm mb-md">
              <span className="material-symbols-outlined text-indigo-500 bg-indigo-100 p-xs rounded-lg">bedtime</span>
              <h3 className="text-h3 font-h3 text-on-surface">Nhật Ký Giấc Ngủ</h3>
            </div>
            <form onSubmit={handleAddSleep} className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Giờ đi ngủ</label>
                <input type="time" className="input-field" value={newSleep.sleep_time} onChange={e => setNewSleep({...newSleep, sleep_time: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Giờ thức dậy</label>
                <input type="time" className="input-field" value={newSleep.wake_time} onChange={e => setNewSleep({...newSleep, wake_time: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm text-on-surface-variant">Chất lượng ({newSleep.quality} sao)</label>
                <input type="range" min="1" max="5" step="1" className="w-full accent-indigo-500" value={newSleep.quality} onChange={e => setNewSleep({...newSleep, quality: parseInt(e.target.value)})} />
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>Rất tệ</span>
                  <span>Rất tốt</span>
                </div>
              </div>
              <div className="space-y-1 flex items-end justify-end">
                <button type="submit" className="btn bg-indigo-500 text-white hover:bg-indigo-600 w-full sm:w-auto">Ghi Giấc Ngủ</button>
              </div>
            </form>
          </div>

          {/* Mood Tracker */}
          <div className="card reveal reveal-delay-1">
            <div className="flex items-center gap-sm mb-md">
              <span className="material-symbols-outlined text-pink-500 bg-pink-100 p-xs rounded-lg">mood</span>
              <h3 className="text-h3 font-h3 text-on-surface">Nhật Ký Cảm Xúc</h3>
            </div>
            <form onSubmit={handleAddMood} className="space-y-md">
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-2">Cảm xúc hiện tại</label>
                <div className="flex gap-sm overflow-x-auto pb-2">
                  {MOODS.map(m => (
                    <button type="button" key={m.value}
                            onClick={() => setNewMood({...newMood, mood: m.value})}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all min-w-[80px]
                              ${newMood.mood === m.value ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-surface border-outline-variant hover:bg-surface-container'}`}>
                      <span className="text-3xl">{m.emoji}</span>
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-2">Mức năng lượng ({newMood.energy_level}/5)</label>
                <input type="range" min="1" max="5" step="1" className="w-full accent-pink-500" value={newMood.energy_level} onChange={e => setNewMood({...newMood, energy_level: parseInt(e.target.value)})} />
              </div>

              <div>
                <label className="text-label-sm text-on-surface-variant block mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <button type="button" key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                              ${newMood.tags.includes(tag) ? 'bg-pink-500 text-white border-pink-500' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn bg-pink-500 text-white hover:bg-pink-600 w-full sm:w-auto">Ghi Cảm Xúc</button>
              </div>
            </form>
          </div>

        </div>

        {/* ── Right Column: History & Insights ── */}
        <div className="md:col-span-4 flex flex-col gap-lg">
          
          {/* Summary Card */}
          <div className="card reveal flex flex-col gap-sm">
             <div className="flex items-center gap-sm mb-xs">
              <span className="material-symbols-outlined text-green-500 bg-green-100 p-xs rounded-lg">monitoring</span>
              <h3 className="text-h3 font-h3 text-on-surface">Tổng Quan Tuần</h3>
            </div>
            <div className="grid grid-cols-2 gap-sm">
              <div className="p-3 bg-surface-container-low rounded-lg text-center">
                <p className="text-label-sm text-on-surface-variant mb-1">TB Giấc Ngủ</p>
                <p className="text-h2 font-h2 text-indigo-500">{sleepSummary.avg_duration_hours.toFixed(1)}h</p>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg text-center">
                <p className="text-label-sm text-on-surface-variant mb-1">Chuỗi Ngủ Đủ</p>
                <p className="text-h2 font-h2 text-green-500">{sleepSummary.streak_days} <span className="text-sm">ngày</span></p>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="card bg-gradient-to-br from-indigo-50 to-pink-50 border border-indigo-100 reveal reveal-delay-1">
             <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-purple-600 bg-purple-100 p-xs rounded-lg">auto_awesome</span>
                <h3 className="text-h3 font-h3 text-purple-900">AI Insights</h3>
              </div>
              <button onClick={loadInsights} disabled={insightsLoading} className="text-purple-600 hover:bg-purple-100 p-1 rounded-full transition-colors">
                <span className={`material-symbols-outlined ${insightsLoading ? 'animate-spin' : ''}`}>refresh</span>
              </button>
            </div>
            <div className="text-body-sm text-purple-800 leading-relaxed min-h-[80px] flex items-center justify-center bg-white/50 rounded-lg p-md border border-white">
              {insightsLoading ? 'Đang phân tích dữ liệu...' : (insights || 'Nhấn nút refresh để AI phân tích mối liên hệ giữa giấc ngủ và cảm xúc của bạn trong tuần qua.')}
            </div>
          </div>

          {/* Today History */}
          <div className="card reveal reveal-delay-2 flex-1">
             <h3 className="text-h3 font-h3 text-on-surface mb-md">Lịch Sử Hôm Nay</h3>
             
             <div className="space-y-md">
               <div>
                 <h4 className="text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Giấc Ngủ</h4>
                 {sleepLogs.length === 0 ? <p className="text-sm text-on-surface-variant italic">Chưa ghi nhận</p> : (
                   sleepLogs.map(log => (
                     <div key={log.id} className="flex justify-between items-center bg-surface-container-low p-2 rounded mb-2">
                       <div>
                         <p className="font-medium text-sm">{log.duration_hours.toFixed(1)} giờ</p>
                         <p className="text-xs text-on-surface-variant">Chất lượng: {'⭐'.repeat(log.quality)}</p>
                       </div>
                       <button onClick={() => {deleteSleepLog(log.id); fetchData();}} className="text-on-surface-variant hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                     </div>
                   ))
                 )}
               </div>

               <div>
                 <h4 className="text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Cảm Xúc</h4>
                 {moodLogs.length === 0 ? <p className="text-sm text-on-surface-variant italic">Chưa ghi nhận</p> : (
                   moodLogs.map(log => {
                     const moodObj = MOODS.find(m => m.value === log.mood) || MOODS[1];
                     return (
                     <div key={log.id} className="flex justify-between items-center bg-surface-container-low p-2 rounded mb-2">
                       <div>
                         <p className="font-medium text-sm flex items-center gap-1"><span>{moodObj.emoji}</span> {moodObj.label} (NL: {log.energy_level}/5)</p>
                         {log.tags && log.tags.length > 0 && <p className="text-xs text-on-surface-variant mt-1">#{log.tags.join(' #')}</p>}
                       </div>
                       <button onClick={() => {deleteMoodLog(log.id); fetchData();}} className="text-on-surface-variant hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                     </div>
                   )})
                 )}
               </div>
             </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default WellnessPage;
