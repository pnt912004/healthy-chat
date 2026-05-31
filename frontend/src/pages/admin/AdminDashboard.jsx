import React, { useEffect, useState } from 'react';
import { Card, Statistic, Spin, Typography } from 'antd';
import { 
  UserOutlined, 
  MessageOutlined, 
  FireOutlined, 
  CoffeeOutlined 
} from '@ant-design/icons';
import { getDashboardStats } from '../../services/adminService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const { Title } = Typography;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Lỗi khi tải thống kê", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        Lỗi không thể tải dữ liệu thống kê. Vui lòng thử lại sau.
      </div>
    );
  }

  // Dữ liệu mẫu cho biểu đồ từ số liệu tổng quan
  const chartData = [
    { name: 'Người dùng', 'Tổng số': stats.total_users },
    { name: 'Chat', 'Tổng số': stats.total_chat_messages },
    { name: 'Nutrition', 'Tổng số': stats.total_nutrition_logs },
    { name: 'Water', 'Tổng số': stats.total_water_logs }
  ];

  return (
    <div>
      <Title level={2}>Dashboard Tổng Quan</Title>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <Card>
            <Statistic 
              title="Tổng Người Dùng" 
              value={stats.total_users} 
              prefix={<UserOutlined />} 
            />
          </Card>
        </div>
        <div>
          <Card>
            <Statistic 
              title="Người Dùng Mới Hôm Nay" 
              value={stats.new_users_today} 
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </div>
        <div>
          <Card>
            <Statistic 
              title="Active Hôm Nay" 
              value={stats.active_users_today} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </div>
        <div>
          <Card>
            <Statistic 
              title="Tổng Số Tin Nhắn" 
              value={stats.total_chat_messages} 
              prefix={<MessageOutlined />} 
            />
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <Card>
            <Statistic 
              title="Tổng Log Dinh Dưỡng" 
              value={stats.total_nutrition_logs} 
              prefix={<FireOutlined />} 
            />
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <Card>
            <Statistic 
              title="Tổng Log Nước" 
              value={stats.total_water_logs} 
              prefix={<CoffeeOutlined />} 
            />
          </Card>
        </div>
      </div>

      <div style={{ marginTop: 40, height: 400 }}>
        <Title level={4}>Biểu Đồ So Sánh Tổng Quan</Title>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Tổng số" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;
