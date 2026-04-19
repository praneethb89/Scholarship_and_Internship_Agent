// src/components/OpportunityModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OpportunityModal = ({ opp, onClose }) => {
  if (!opp) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, padding: '1rem'
        }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card"
          style={{ 
            width: '100%', maxWidth: '600px', padding: '2.5rem', 
            position: 'relative', maxHeight: '90vh', overflowY: 'auto' 
          }}
          onClick={(e) => e.stopPropagation()} // Prevent clicking inside modal from closing it
        >
          <button 
            onClick={onClose}
            style={{ 
              position: 'absolute', top: '1rem', right: '1rem', 
              background: 'none', border: 'none', fontSize: '1.5rem', 
              cursor: 'pointer', color: 'var(--text-secondary)' 
            }}
          >
            ✕
          </button>

          <span style={{ 
            fontSize: '0.85rem', padding: '0.3rem 0.8rem', borderRadius: '12px', 
            background: opp.type === 'Internship' ? '#dbeafe' : '#f3e8ff', 
            color: opp.type === 'Internship' ? '#1e40af' : '#6b21a8', 
            fontWeight: '600' 
          }}>
            {opp.type}
          </span>

          <h2 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.8rem' }}>{opp.title}</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0', fontWeight: '500' }}>
            {opp.org} • {opp.country}
          </p>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI Match Score</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{opp.match}%</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Application Deadline</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#ef4444' }}>{opp.deadline}</p>
            </div>
          </div>

          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Opportunity Details
          </h3>
          <p style={{ lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '2rem' }}>
            This is an excellent opportunity tailored to your profile. Based on our AI analysis, your skills highly align with the requirements for this role at {opp.org}. Ensure your application highlights your core competencies matched by our system.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button 
              onClick={onClose}
              style={{ 
                padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', 
                background: 'transparent', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' 
              }}
            >
              Close
            </button>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ 
                padding: '0.8rem 2rem', borderRadius: '8px', border: 'none', 
                background: 'linear-gradient(45deg, var(--accent-color), #8b5cf6)', 
                color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: 'var(--glass-shadow)' 
              }}
            >
              Apply Now 🚀
            </motion.button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OpportunityModal;