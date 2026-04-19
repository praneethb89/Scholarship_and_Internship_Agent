// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    university: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword, country, university } = formData;
    
    if (!fullName || !email || !password || !confirmPassword || !country || !university) {
      return setError('Please fill in all fields.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    
    setError('');
    setLoading(true);

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      try {
        // 2. Try to save the extra profile data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          fullName,
          email,
          country,
          university,
          createdAt: new Date().toISOString(),
          profileComplete: false
        });
        
        console.log('User registered successfully:', user.uid);
        // 3. Redirect to the Wizard!
        navigate('/wizard');

      } catch (firestoreErr) {
        // 🚨 ROLLBACK: If database fails, delete the auth user so they aren't stuck!
        console.error("Database save failed, rolling back user creation...");
        await deleteUser(user);
        setError('Database error: ' + firestoreErr.message + '. Please try again.');
        setLoading(false);
        return;
      }
    
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('This email is already registered. Please log in.');
      else setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem', marginTop: '0.4rem',
    borderRadius: '8px', border: '1px solid var(--glass-border)',
    backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
    outline: 'none', fontSize: '0.95rem'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', paddingBottom: '2rem' }}>
      <motion.div 
        className="glass-card"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.8rem' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Join the platform to discover your perfect opportunities.
        </p>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
              {error}
            </motion.p>
          )}

          <div><label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Full Name</label><input type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} style={inputStyle} /></div>
          <div><label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Email Address</label><input type="email" name="email" placeholder="boss@example.com" value={formData.email} onChange={handleChange} style={inputStyle} /></div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}><label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Country</label><input type="text" name="country" placeholder="e.g. USA" value={formData.country} onChange={handleChange} style={inputStyle} /></div>
            <div style={{ flex: 1 }}><label style={{ fontWeight: '500', fontSize: '0.9rem' }}>University</label><input type="text" name="university" placeholder="e.g. MIT" value={formData.university} onChange={handleChange} style={inputStyle} /></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}><label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Password</label><input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} style={inputStyle} /></div>
            <div style={{ flex: 1 }}><label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Confirm Password</label><input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} style={inputStyle} /></div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} type="submit"
            style={{
              marginTop: '1.5rem', padding: '0.8rem', borderRadius: '8px', border: 'none',
              backgroundColor: loading ? 'var(--text-secondary)' : 'var(--accent-color)',
              color: '#ffffff', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;