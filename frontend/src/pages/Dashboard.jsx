// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import OpportunityModal from '../components/OpportunityModal';

const Dashboard = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState(null); // State for the modal

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.matches) {
              setOpportunities(userData.matches);
            }
          }
        } catch (error) {
          console.error("Error fetching matches:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}><h3>Loading Dashboard...</h3></div>;

  return (
    <div style={{ minHeight: '80vh' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        <motion.div className="glass-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>Profile Strength</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }} animate={{ width: opportunities.length > 0 ? '90%' : '50%' }} transition={{ duration: 1, delay: 0.5 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-color), #8b5cf6)' }}
              />
            </div>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{opportunities.length > 0 ? '90%' : '50%'}</span>
          </div>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            {opportunities.length > 0 ? "Profile optimized!" : "Upload resume to boost strength"}
          </p>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>Total Matches</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{opportunities.length}</p>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>Saved Opportunities</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>0</p>
        </motion.div>

      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>Recommended for You</h2>
      
      {opportunities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>No matches found yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Upload your resume in the Edit Profile section to let our AI find the best opportunities for you.</p>
          <Link to="/profile" style={{ background: 'var(--accent-color)', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Go to Edit Profile</Link>
        </div>
      ) : (
        <motion.div 
          variants={container} initial="hidden" animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}
        >
          {opportunities.map((opp, index) => (
            <motion.div 
              key={opp.id || index} variants={item} whileHover={{ scale: 1.03, y: -5 }} className="glass-card"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }}
              onClick={() => setSelectedOpp(opp)} // Make the whole card clickable too!
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: opp.type === 'Internship' ? '#dbeafe' : '#f3e8ff', color: opp.type === 'Internship' ? '#1e40af' : '#6b21a8', fontWeight: '600' }}>
                    {opp.type}
                  </span>
                  <h3 style={{ margin: '0.8rem 0 0.2rem 0', fontSize: '1.2rem' }}>{opp.title}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{opp.org} • {opp.country}</p>
                </div>
                <div style={{ textAlign: 'center', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '2px solid var(--accent-color)' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '0.9rem', lineHeight: '1' }}>{opp.match}%</span>
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>Match</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: '500' }}>⏳ Due: {opp.deadline}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents double-firing if clicking the button vs the card
                    setSelectedOpp(opp);
                  }}
                  style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  View
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* MODAL ADDED HERE! */}
      <OpportunityModal opp={selectedOpp} onClose={() => setSelectedOpp(null)} />
      
    </div>
  );
};

export default Dashboard;