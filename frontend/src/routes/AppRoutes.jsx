// src/routes/AppRoutes.jsx
// Cấu hình React Router cho toàn bộ ứng dụng

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminTips from '../pages/admin/AdminTips';
import AdminChatLogs from '../pages/admin/AdminChatLogs';
import HomePage          from '../pages/HomePage';
import LoginPage         from '../pages/LoginPage';
import RegisterPage      from '../pages/RegisterPage';
import DashboardPage     from '../pages/DashboardPage';
import GoalsPage         from '../pages/GoalsPage';
import ProfilePage       from '../pages/ProfilePage';
import AIAssistantPage   from '../pages/AIAssistantPage';
import NutritionPage     from '../pages/NutritionPage';
import WaterTrackerPage  from '../pages/WaterTrackerPage';
import ExercisePage      from '../pages/ExercisePage';
import WellnessPage      from '../pages/WellnessPage';
import ReportsPage       from '../pages/ReportsPage';
import SettingsPage      from '../pages/SettingsPage';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      
      <Route element={<AuthLayout />}>
        <Route path="/login"     element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register"  element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      </Route>

      {/* App Routes (Protected) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/ai"         element={<AIAssistantPage />} />
          <Route path="/nutrition"  element={<NutritionPage />} />
          <Route path="/water"      element={<WaterTrackerPage />} />
          <Route path="/exercise"   element={<ExercisePage />} />
          <Route path="/wellness"   element={<WellnessPage />} />
          <Route path="/reports"    element={<ReportsPage />} />
          <Route path="/goals"      element={<GoalsPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
          <Route path="/settings"   element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Admin Routes (Protected by AdminRoute) */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/tips" element={<AdminTips />} />
          <Route path="/admin/chat-logs" element={<AdminChatLogs />} />
          <Route path="/admin/settings" element={<div>Admin Settings Placeholder</div>} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

