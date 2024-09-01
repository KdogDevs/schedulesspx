import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLogin from './components/GoogleLogin'; // Adjust the import path if necessary
import './LandingPage.css';

const LandingPage = ({ user, setUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/main');
    }
  }, [user, navigate]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    navigate('/main'); // Redirect after successful sign-in
  };

  return (
    <div className="landing-page">
      <h1 className="landing-title">Welcome to ScheduleSPX</h1>
      <div className="landing-buttons">
        <GoogleLogin onLoginSuccess={handleLoginSuccess} />
        <button onClick={() => navigate('/about')}>Learn More</button>
      </div>
    </div>
  );
};

export default LandingPage;
