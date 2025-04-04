import React, { memo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WeekScheduleProvider } from './context/WeekScheduleContext';
import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage';
import MainDashboard from './pages/MainDashboard';
import Admin from './pages/Admin';
import Account from './pages/Account';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import TeacherTools from './pages/TeacherTools';
import News from './pages/News';
import ChangeLog from './pages/ChangeLog';
import MarchMadness from './pages/MarchMadness';
import './styles/App.css';

// Memoized PrivateRoute for better performance
const PrivateRoute = memo(({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/landing" replace />;
});

// Memoized AppContent to prevent unnecessary re-renders
const AppContent = memo(() => {
  const { user, setUser } = useAuth();
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/landing" element={<LandingPage user={user} setUser={setUser} />} />
            <Route 
              path="/main" 
              element={
                <PrivateRoute>
                  <MainDashboard />
                </PrivateRoute>
              } 
            />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
            <Route path="/teacher-tools" element={<PrivateRoute><TeacherTools /></PrivateRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/news" element={<News />} />
            <Route path="/march-madness" element={<MarchMadness />} />
            <Route path="/changelog" element={<ChangeLog />} />
            <Route path="*" element={<Navigate to="/landing" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
});

// Memoized App component
const App = memo(() => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider>
          <WeekScheduleProvider>
            <AppContent />
          </WeekScheduleProvider>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
});

export default App;
