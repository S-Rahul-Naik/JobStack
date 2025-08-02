import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ApplicantDashboard from './pages/ApplicantDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import UploadResume from './pages/UploadResume';
import ApplicantApplications from './pages/ApplicantApplications';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import Chat from './pages/Chat';
import NotificationSettings from './pages/NotificationSettings';
import NotificationDashboard from './pages/NotificationDashboard';
import GlobalFooterBar from './components/GlobalFooterBar';

function AppContent() {
  const location = useLocation();
  const isChat = location.pathname === '/chat';
  
  // Don't show navbar on authentication pages
  const isAuthPage = ['/', '/register', '/forgot-password', '/reset-password'].some(path => 
    location.pathname === path || location.pathname.startsWith('/reset-password/')
  );

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="applicant">
              <ApplicantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-resume"
          element={
            <ProtectedRoute role="applicant">
              <UploadResume />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute role="applicant">
              <ApplicantApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification-settings"
          element={
            <ProtectedRoute>
              <NotificationSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!isChat && !isAuthPage && <GlobalFooterBar />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </Router>
  );
}

export default App;
