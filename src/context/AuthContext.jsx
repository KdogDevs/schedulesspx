import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

// Create context
const AuthContext = createContext();

// Export hook for convenient usage
export const useAuth = () => useContext(AuthContext);

// Precompute banned emails for faster lookup
const BANNED_EMAILS = new Set([
  'ccrosby25@spxstudent.org',
  'dedwards25@spxstudent.org',
  'achenault25@spxstudent.org',
  'wfreeman25@spxstudent.org',
  'guebelacker25@spxstudent.org',
  'etewolde27@spxstudent.org'
]);

// Precompute admin emails for faster lookup
const ADMIN_EMAILS = new Set([
  'kagenmjensen@me.com',
  'dcamick25@spxstudent.org',
  'lfarrell@spx.org',
  'rpage27@spxstudent.org'
]);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [reminderPreference, setReminderPreference] = useState(true);
  const [shouldCheckBan, setShouldCheckBan] = useState(false);
  
  // Load saved user data on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedExpiry = localStorage.getItem('sessionExpiry');
      
      if (savedUser && savedExpiry && new Date().getTime() < parseInt(savedExpiry)) {
        const userData = JSON.parse(savedUser);
        
        // Check and reset banned status
        userData.isBanned = isBannedEmail(userData.email);
        
        setUser(userData);
        setReminderPreference(userData.reminderPreference ?? true);
        setShouldCheckBan(userData.isBanned);
      } else {
        // Clear expired session
        localStorage.removeItem('user');
        localStorage.removeItem('sessionExpiry');
        localStorage.removeItem('isBanned');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);
  
  // Memoized email validation functions for better performance
  const isAuthorizedEmail = useCallback((email) => {
    if (!email) return false;
    
    const lowerEmail = email.toLowerCase();
    
    // Check if banned
    if (BANNED_EMAILS.has(lowerEmail)) return false;
    
    const domain = lowerEmail.split('@')[1];
    return domain === 'spx.org' || domain === 'spxstudent.org' || lowerEmail === 'kagenmjensen@me.com';
  }, []);
  
  const isAdminEmail = useCallback((email) => {
    return email && ADMIN_EMAILS.has(email.toLowerCase());
  }, []);
  
  const isStudentEmail = useCallback((email) => {
    if (!email) return false;
    return email.toLowerCase().endsWith('@spxstudent.org');
  }, []);
  
  const isFacultyEmail = useCallback((email) => {
    if (!email) return false;
    return email.toLowerCase().endsWith('@spx.org');
  }, []);
  
  const isBannedEmail = useCallback((email) => {
    if (!email) return false;
    
    const lowerEmail = email.toLowerCase();
    
    // Other banned emails
    return BANNED_EMAILS.has(lowerEmail);
  }, []);
  
  // Login function with optimized data handling
  const login = useCallback((userData) => {
    if (!userData || !userData.email) {
      console.error('Invalid user data provided to login function');
      return;
    }
    
    // Calculate important user attributes
    const authorizedUser = {
      ...userData,
      isAuthorized: isAuthorizedEmail(userData.email),
      isAdmin: isAdminEmail(userData.email),
      isStudent: isStudentEmail(userData.email),
      isFaculty: isFacultyEmail(userData.email), 
      isBanned: isBannedEmail(userData.email),
      reminderPreference: userData.reminderPreference ?? true,
    };
    
    // Set local state
    setUser(authorizedUser);
    setShouldCheckBan(authorizedUser.isBanned);
    
    // Store in localStorage with expiry
    const expiry = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days
    localStorage.setItem('user', JSON.stringify(authorizedUser));
    localStorage.setItem('sessionExpiry', expiry.toString());
    localStorage.setItem('isBanned', authorizedUser.isBanned.toString());
  }, [isAuthorizedEmail, isAdminEmail, isStudentEmail, isFacultyEmail, isBannedEmail]);
  
  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setShouldCheckBan(false);
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('isBanned');
  }, []);
  
  // User state check functions
  const isLoggedIn = useCallback(() => Boolean(user), [user]);
  const isAuthorized = useCallback(() => Boolean(user?.isAuthorized), [user]);
  const isAdmin = useCallback(() => Boolean(user?.isAdmin), [user]);
  const isStudent = useCallback(() => Boolean(user?.isStudent), [user]);
  const isFaculty = useCallback(() => Boolean(user?.isFaculty), [user]);
  const getBanStatus = useCallback(() => {
    if (!user) return { isBanned: false, type: null };
    
    if (!user.isBanned) return { isBanned: false, type: null };
    
    return { isBanned: true, type: 'student' };
  }, [user]);
  
  // Reminder preference update function
  const updateReminderPreference = useCallback((preference) => {
    setReminderPreference(preference);
    
    // Update user object if it exists
    if (user) {
      const updatedUser = { ...user, reminderPreference: preference };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    isLoggedIn,
    isAuthorized, 
    isAdmin,
    isStudent,
    isFaculty,
    getBanStatus,
    shouldCheckBan,
    reminderPreference,
    updateReminderPreference,
  }), [
    user, 
    login, 
    logout, 
    isLoggedIn, 
    isAuthorized, 
    isAdmin, 
    isStudent, 
    isFaculty,
    getBanStatus,
    shouldCheckBan,
    reminderPreference, 
    updateReminderPreference
  ]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
