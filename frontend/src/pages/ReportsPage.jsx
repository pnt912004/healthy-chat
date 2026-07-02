import React, { useState, useEffect, useRef } from 'react';
import { reportService } from '../services/reportService';
import { getGoal } from '../services/healthService';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [weeklyData, setWeeklyData] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [userGoal, setUserGoal] = useState(null);
  const [aiReview, setAiReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  
  const reportRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const goalRes = await getGoal().catch(() => null);
      setUserGoal(goalRes);
      
      if (activeTab === 'weekly') {
        const [report, score] = await Promise.all([
          reportService.getWeeklyReport(),
          reportService.getHealthScore()
        ]);
        setWeeklyData(report);
        setHealthScore(score);
      } else {
        const [report, score] = await Promise.all([
          reportService.getMonthlyReport(),
          reportService.getHealthScore()
        ]);
        setWeeklyData(report);
        setHealthScore(score);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiReview = async () => {
    setAiLoading(true);
    try {
      const review = await reportService.getAIReview();
      setAiReview(review);
    } catch (error) {
      console.error('Error fetching AI review:', error);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiReview();
  }, []);

  const exportPDF = async () => {
    const input = reportRef.current;
    if (!input) return;
    
    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`HealthyChat_Report_${dayjs().format('YYYY-MM-DD')}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Có lỗi khi xuất PDF');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto dark:text-white" ref={reportRef}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-h1 font-h1 text-on-surface mb-2">
            Báo Cáo Sức Khoẻ
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant">
            Tổng quan tình hình sức khỏe và thói quen của bạn
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-highest p-1 rounded-lg flex">
            <button 
              onClick={() => setActiveTab('weekly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'weekly' ? 'bg-surface-container-lowest shadow text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Tuần
            </button>
            <button 
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'monthly' ? 'bg-surface-container-lowest shadow text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Tháng
            </button>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary rounded-lg shadow-soft transition-colors"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            In PDF
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 btn-primary"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-label-md font-label-md text-on-surface-variant">Trung bình Calo nạp</h3>
          <p className="text-h2 font-h2 mt-2 text-primary">
            {weeklyData?.avg_calories_consumed?.toFixed(0) || 0}
            <span className="text-body-sm font-body-sm text-outline ml-1">/ {userGoal?.daily_calorie_goal || 2000}</span>
          </p>
          <p className="text-body-sm text-outline mt-1">kcal/ngày</p>
        </div>
        <div className="card">
          <h3 className="text-label-md font-label-md text-on-surface-variant">Trung bình Nước uống</h3>
          <p className="text-h2 font-h2 mt-2 text-[#3b82f6]">
            {weeklyData?.avg_water_ml?.toFixed(0) || 0}
            <span className="text-body-sm font-body-sm text-outline ml-1">/ {userGoal?.daily_water_target_ml || 2500}</span>
          </p>
          <p className="text-body-sm text-outline mt-1">ml/ngày</p>
        </div>
        <div className="card">
          <h3 className="text-label-md font-label-md text-on-surface-variant">Thời gian tập luyện</h3>
          <p className="text-h2 font-h2 mt-2 text-[#22c55e]">
            {weeklyData?.total_exercise_minutes || 0}
          </p>
          <p className="text-body-sm text-outline mt-1">phút / {activeTab === 'weekly' ? 'tuần' : 'tháng'}</p>
        </div>
        <div className="card">
          <h3 className="text-label-md font-label-md text-on-surface-variant">Số ngày đạt mục tiêu</h3>
          <p className="text-h2 font-h2 mt-2 text-[#a855f7]">{weeklyData?.days_goal_reached || 0}</p>
          <p className="text-body-sm text-outline mt-1">ngày / {activeTab === 'weekly' ? '7 ngày' : 'tháng'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Health Score */}
        <div className="card flex flex-col items-center justify-center">
          <h2 className="text-h2 font-h2 mb-6 self-start w-full text-on-surface">Điểm Sức Khỏe</h2>
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 36 36" className="w-48 h-48">
              <path
                className="text-surface-variant dark:text-surface-variant"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${healthScore?.total_score || 0}, 100`}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-on-surface">
                {healthScore?.total_score?.toFixed(0) || 0}
              </span>
              <span className="text-sm text-on-surface-variant">/ 100</span>
            </div>
          </div>
          <div className="mt-6 w-full space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Dinh dưỡng (40)</span>
              <span className="font-medium text-[#f97316]">{healthScore?.nutrition_score?.toFixed(1) || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Nước (30)</span>
              <span className="font-medium text-[#3b82f6]">{healthScore?.water_score?.toFixed(1) || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Đều đặn (30)</span>
              <span className="font-medium text-[#22c55e]">{healthScore?.consistency_score?.toFixed(1) || 0}</span>
            </div>
          </div>
        </div>

        {/* AI Review */}
        <div className="lg:col-span-2 bg-primary-container rounded-xl p-6 shadow-soft border border-outline-variant">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-h2 font-h2 flex items-center gap-2 text-on-primary-container">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              AI Review {activeTab === 'weekly' ? 'Tuần' : 'Tháng'}
            </h2>
            <button 
              onClick={fetchAiReview}
              className="p-2 bg-surface-container-lowest rounded-full hover:bg-surface-container-low transition-all text-primary"
              disabled={aiLoading}
            >
              <span className={`material-symbols-outlined ${aiLoading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>
          
          {aiLoading ? (
            <div className="h-40 flex items-center justify-center text-on-primary-container/70">
              <span className="material-symbols-outlined animate-spin mr-2">sync</span> Đang phân tích dữ liệu...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest/80 p-4 rounded-lg backdrop-blur-sm border border-outline-variant/50">
                <h3 className="font-h3 text-on-surface mb-3 flex items-center gap-2">
                  <span className="text-[#22c55e] material-symbols-outlined text-sm">visibility</span>
                  Nhận xét
                </h3>
                <ul className="space-y-2">
                  {aiReview?.observations?.map((obs, idx) => (
                    <li key={idx} className="text-body-sm text-on-surface-variant flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface-container-lowest/80 p-4 rounded-lg backdrop-blur-sm border border-outline-variant/50">
                <h3 className="font-h3 text-on-surface mb-3 flex items-center gap-2">
                  <span className="text-[#f97316] material-symbols-outlined text-sm">lightbulb</span>
                  Lời khuyên
                </h3>
                <ul className="space-y-2">
                  {aiReview?.recommendations?.map((rec, idx) => (
                    <li key={idx} className="text-body-sm text-on-surface-variant flex items-start gap-2">
                      <span className="text-[#22c55e] mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h2 className="text-h2 font-h2 text-on-surface mb-6">Lượng Calo Nạp ({activeTab === 'weekly' ? '7 Ngày Qua' : 'Tháng Này'})</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData?.daily_summaries || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => dayjs(val).format('DD/MM')} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'var(--color-surface-container-highest)' }}
                />
                <Bar dataKey="calories_consumed" name="Calo Nạp" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-h2 font-h2 text-on-surface mb-6">Lượng Nước Uống ({activeTab === 'weekly' ? '7 Ngày Qua' : 'Tháng Này'})</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData?.daily_summaries || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => dayjs(val).format('DD/MM')} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'var(--color-surface-container-highest)' }}
                />
                <Line type="monotone" dataKey="water_ml" name="Nước (ml)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
