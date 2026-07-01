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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            Báo Cáo Sức Khoẻ
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tổng quan tình hình sức khỏe và thói quen của bạn
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex">
            <button 
              onClick={() => setActiveTab('weekly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'weekly' ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
            >
              Tuần
            </button>
            <button 
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'monthly' ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
            >
              Tháng
            </button>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition-colors"
          >
            <span className="material-icons text-sm">print</span>
            In PDF
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow transition-colors"
          >
            <span className="material-icons text-sm">download</span>
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Trung bình Calo nạp</h3>
          <p className="text-3xl font-bold mt-2 text-primary-600">
            {weeklyData?.avg_calories_consumed?.toFixed(0) || 0}
            <span className="text-sm font-normal text-gray-400 ml-1">/ {userGoal?.daily_calorie_goal || 2000}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">kcal/ngày</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Trung bình Nước uống</h3>
          <p className="text-3xl font-bold mt-2 text-blue-500">
            {weeklyData?.avg_water_ml?.toFixed(0) || 0}
            <span className="text-sm font-normal text-gray-400 ml-1">/ {userGoal?.daily_water_target_ml || 2500}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">ml/ngày</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Thời gian tập luyện</h3>
          <p className="text-3xl font-bold mt-2 text-green-500">
            {weeklyData?.total_exercise_minutes || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">phút / {activeTab === 'weekly' ? 'tuần' : 'tháng'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Số ngày đạt mục tiêu</h3>
          <p className="text-3xl font-bold mt-2 text-purple-500">{weeklyData?.days_goal_reached || 0}</p>
          <p className="text-xs text-gray-400 mt-1">ngày / {activeTab === 'weekly' ? '7 ngày' : 'tháng'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Health Score */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-6 self-start w-full">Điểm Sức Khỏe</h2>
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 36 36" className="w-48 h-48">
              <path
                className="text-gray-200 dark:text-gray-700"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary-500"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${healthScore?.total_score || 0}, 100`}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-800 dark:text-white">
                {healthScore?.total_score?.toFixed(0) || 0}
              </span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
          </div>
          <div className="mt-6 w-full space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Dinh dưỡng (40)</span>
              <span className="font-medium text-orange-500">{healthScore?.nutrition_score?.toFixed(1) || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Nước (30)</span>
              <span className="font-medium text-blue-500">{healthScore?.water_score?.toFixed(1) || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Đều đặn (30)</span>
              <span className="font-medium text-green-500">{healthScore?.consistency_score?.toFixed(1) || 0}</span>
            </div>
          </div>
        </div>

        {/* AI Review */}
        <div className="lg:col-span-2 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-primary-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="material-icons text-primary-600">auto_awesome</span>
              AI Review {activeTab === 'weekly' ? 'Tuần' : 'Tháng'}
            </h2>
            <button 
              onClick={fetchAiReview}
              className="p-2 bg-white dark:bg-gray-700 rounded-full hover:shadow transition-all"
              disabled={aiLoading}
            >
              <span className={`material-icons text-primary-600 ${aiLoading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>
          
          {aiLoading ? (
            <div className="h-40 flex items-center justify-center text-gray-500">
              <span className="material-icons animate-spin mr-2">sync</span> Đang phân tích dữ liệu...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/60 dark:bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-green-500 material-icons text-sm">visibility</span>
                  Nhận xét
                </h3>
                <ul className="space-y-2">
                  {aiReview?.observations?.map((obs, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/60 dark:bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <span className="text-orange-500 material-icons text-sm">lightbulb</span>
                  Lời khuyên
                </h3>
                <ul className="space-y-2">
                  {aiReview?.recommendations?.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-secondary-500 mt-0.5">•</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-6">Lượng Calo Nạp ({activeTab === 'weekly' ? '7 Ngày Qua' : 'Tháng Này'})</h2>
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
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="calories_consumed" name="Calo Nạp" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-6">Lượng Nước Uống ({activeTab === 'weekly' ? '7 Ngày Qua' : 'Tháng Này'})</h2>
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
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
