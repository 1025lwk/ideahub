import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import IdeaDetailPage from './pages/IdeaDetailPage';
import PublishIdeaPage from './pages/PublishIdeaPage';
import DashboardPage from './pages/DashboardPage';
import AIGeneratePage from './pages/AIGeneratePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// 受保护路由：未登录跳转到登录页
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/ideas/:id" element={<IdeaDetailPage />} />
        <Route
          path="/publish"
          element={
            <ProtectedRoute>
              <PublishIdeaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/generate/:ideaId"
          element={
            <ProtectedRoute>
              <AIGeneratePage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
