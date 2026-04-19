// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from './config/firebase'; // Import Firebase auth
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import auth helpers

import Login from './pages/Login';
import Signup from './pages/Signup';
import Wizard from './pages/Wizard';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';


function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'light');
  
  // New state to track if a user is logged in
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Listen for Firebase login/logout changes automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out successfully");
      window.location.href = '/login'; // Redirect to login page and clear state
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <Router>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.h1 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                fontSize: '2rem', 
                fontWeight: '800', 
                background: 'linear-gradient(45deg, var(--accent-color), #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1px',
                margin: 0
              }}
            >
              ✨ Opportunity Agent
            </motion.h1>
          </Link>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontWeight: '500' }}>
            
            {/* Dynamic Navigation based on Login Status */}
            {user ? (
              <>
                <Link to="/dashboard" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/profile" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Edit Profile</Link>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444', // Red color for logout
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: 0
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Login</Link>
                <Link to="/signup" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Signup</Link>
              </>
            )}
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--glass-shadow)',
                cursor: 'pointer',
                fontWeight: '600',
                marginLeft: '0.5rem'
              }}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </motion.button>
          </div>
        </nav>

        <Routes>
          {/* If user is logged in, default to dashboard. Otherwise, login */}
          <Route path="/" element={user ? <Dashboard /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/wizard" element={<Wizard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;