import React, { useEffect, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/LandingPage.css';
import { useAuth } from '../context/AuthContext';

const GoogleLogin = lazy(() => import('../components/GoogleLogin'));

const LandingPage = React.memo(() => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const { user, login } = useAuth();

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/main');
    }
  }, [user, navigate]);

  const handleLoginSuccess = (userData) => {
    login(userData);
    navigate('/main');
  };

  return (
    <div className="landing-page">
      <div className="background-image-container"></div>
      <motion.h1
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="landing-title"
      >
        Welcome to Schedule SPX
      </motion.h1>
      <motion.h2
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.5 }}
        className="landing-subtitle"
      >
        The All-in-One Student Dashboard.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1.5 }}
        className="landing-body"
      >
        Please sign in to use, or <Link to="/about" className="highlight-link">Click Here</Link> to learn more.
      </motion.p>
      <motion.div
        className="landing-buttons"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1.5 }}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <GoogleLogin onLoginSuccess={handleLoginSuccess} />
        </Suspense>
        <p className="fine-print">
          By Signing in, you agree to the <Link to="/terms" className="highlight-link">Terms</Link> and the <Link to="/privacy" className="highlight-link">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
});

export default LandingPage;
