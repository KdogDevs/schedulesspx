import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import io from 'socket.io-client';
import './App.css';
import { useTheme } from './ThemeContext';
import DayHeader from './DayHeader';
import GoogleCalendar from './components/GoogleCalendar';
import PeriodProgress from './PeriodProgress';
import PeriodTitleUpdater from './PeriodTitleUpdater';
import Schedule from './Schedule';
import NavBar from './NavBar';
import Admin from './Admin';
import Account from './Account';
import About from './About';
import PrivacyPolicy from './PrivacyPolicy';

const socket = io('https://schedule-api.devs4u.workers.dev');

function AppContent() {
  const { theme } = useTheme();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [weekSchedule, setWeekSchedule] = useState({});

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedExpiry = localStorage.getItem('sessionExpiry');
    if (savedUser && savedExpiry && new Date().getTime() < parseInt(savedExpiry)) {
      setUser(JSON.parse(savedUser));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
    }

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.on('scheduleUpdate', (updatedSchedule) => {
      setWeekSchedule(updatedSchedule);
    });

    return () => {
      socket.off('connect');
      socket.off('scheduleUpdate');
    };
  }, []);

  const updateUser = (newUser) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      const expiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem('sessionExpiry', expiry.toString());
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
    }
  };

  const isAdminPage = location.pathname === '/admin';

  return (
    <div className={`App ${theme} flex flex-col min-h-screen`}>
      <NavBar user={user} setUser={updateUser} />
      <PeriodTitleUpdater />
      <Routes>
        <Route path="/admin" element={<Admin user={user} weekSchedule={weekSchedule} setWeekSchedule={setWeekSchedule} socket={socket} />} />
        <Route path="/account" element={<Account user={user} />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route
          path="/"
          element={
            <main className="flex-grow p-4 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[40vh]">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <DayHeader />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <Schedule weekSchedule={weekSchedule} />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <GoogleCalendar />
                </div>
              </div>
              <div className="w-full my-4 flex-grow flex items-center justify-center">
                <PeriodProgress weekSchedule={weekSchedule} />
              </div>
            </main>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
