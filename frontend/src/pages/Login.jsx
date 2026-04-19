// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '../config/firebase'; // Import Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields.');
    }
    
    setError('');
    setLoading(true);

    try {
      // Authenticate with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in successfully!');
      
      // Send the boss straight to the dashboard!
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      // Clean up Firebase error messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Try again later.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem', marginTop: '0.5rem',
    borderRadius: '8px', border: '1px solid var(--glass-border)',
    backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
    outline: 'none', fontSize: '1rem'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <motion.div 
        className="glass-card"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.8rem' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Login to find your next big opportunity.
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </motion.p>
          )}

          <div>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Email Address</label>
            <input type="email" placeholder="boss@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ cursor: 'pointer' }} />
            <label htmlFor="remember" style={{ fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>Remember Me</label>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit"
            style={{
              marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', border: 'none',
              backgroundColor: loading ? 'var(--text-secondary)' : 'var(--accent-color)',
              color: '#ffffff', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
        </p>

      </motion.div>
    </div>
  );
};

export default Login;