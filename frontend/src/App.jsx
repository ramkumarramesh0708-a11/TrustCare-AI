import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Pages
import OverviewDashboard from './pages/OverviewDashboard';
import ScreeningDirectory from './pages/ScreeningDirectory';
import AssessmentForm from './pages/AssessmentForm';
import AssessmentDetail from './pages/AssessmentDetail';
import AssessmentHistory from './pages/AssessmentHistory';
import AlertCenter from './pages/AlertCenter';
import ReviewWorkspace from './pages/ReviewWorkspace';
import ModelRegistryPage from './pages/ModelRegistryPage';
import AuditLogs from './pages/AuditLogs';
import UserProfile from './pages/UserProfile';
import HelpAndPrivacy from './pages/HelpAndPrivacy';
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Authenticating session...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewDashboard />} />
            <Route path="modules" element={<ScreeningDirectory />} />
            <Route path="assessments/new" element={<AssessmentForm />} />
            <Route path="assessments/:id" element={<AssessmentDetail />} />
            <Route path="assessments" element={<AssessmentHistory />} />
            <Route path="alerts" element={<AlertCenter />} />
            <Route path="review-workspace" element={<ReviewWorkspace />} />
            <Route path="models" element={<ModelRegistryPage />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="help" element={<HelpAndPrivacy />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
