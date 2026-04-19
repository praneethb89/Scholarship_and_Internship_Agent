// src/pages/Wizard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase'; // Added Firebase imports
import { doc, updateDoc } from 'firebase/firestore'; // Added Firestore update method

const Wizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    degree: '',
    fieldOfStudy: '',
    university: '', // Even though we asked in signup, good to confirm/update here
    gradYear: '',
    interests: [],
    skills: {}
  });

  const availableInterests = [
    'Frontend Dev', 'Backend Dev', 'Full Stack', 'Mobile Dev',
    'Python', 'Java', 'JavaScript', 'C++', 'Go', 'Rust',
    'AI & ML', 'Data Science', 'Cybersecurity', 
    'Cloud Computing', 'DevOps', 'CI/CD & Deployment', 
    'UI/UX Design', 'Database Admin', 'Blockchain',
    'Game Dev', 'System Architecture', 'SpringBoot', 'Robotics', 'Finance'
  ];

  const [currentSkill, setCurrentSkill] = useState('');
  const [currentRating, setCurrentRating] = useState('Beginner');

  const handleNext = () => {
    setError('');
    // Simple validation for Step 1
    if (step === 1 && (!formData.degree || !formData.fieldOfStudy)) {
      return setError('Please fill in your degree and field of study.');
    }
    // Simple validation for Step 2
    if (step === 2 && formData.interests.length === 0) {
      return setError('Please select at least one interest.');
    }
    setStep(prev => prev + 1);
  };
  
  const handleBack = () => setStep(prev => prev - 1);

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const addSkill = () => {
    if (currentSkill.trim() === '') return;
    setFormData(prev => ({
      ...prev,
      skills: { ...prev.skills, [currentSkill]: currentRating }
    }));
    setCurrentSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => {
      const newSkills = { ...prev.skills };
      delete newSkills[skillToRemove];
      return { ...prev, skills: newSkills };
    });
  };

  const handleSubmit = async () => {
    // Check if user is actually logged in
    const user = auth.currentUser;
    if (!user) {
      setError('No user found. Please log in first.');
      return;
    }

    if (Object.keys(formData.skills).length === 0) {
      return setError('Please add at least one skill.');
    }

    setLoading(true);
    setError('');

    try {
      // Reference to this specific user's document in Firestore
      const userRef = doc(db, 'users', user.uid);
      
      // Update the document with the wizard data
      await updateDoc(userRef, {
        profile: {
          degree: formData.degree,
          fieldOfStudy: formData.fieldOfStudy,
          university: formData.university,
          gradYear: formData.gradYear
        },
        interests: formData.interests,
        skills: formData.skills,
        profileComplete: true // Flag to show they finished the setup!
      });

      console.log('Profile setup complete and saved to Firestore!');
      navigate('/dashboard'); // Swoosh them to the dashboard

    } catch (err) {
      console.error("Error updating profile:", err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem', marginTop: '0.5rem',
    borderRadius: '8px', border: '1px solid var(--glass-border)',
    backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
    outline: 'none', fontSize: '0.95rem'
  };

  const btnStyle = {
    padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none',
    backgroundColor: 'var(--accent-color)', color: '#fff',
    fontWeight: '600', cursor: 'pointer', boxShadow: 'var(--glass-shadow)'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <motion.div 
        className="glass-card"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Profile Setup</h2>
          <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Step {step} of 3</span>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </motion.p>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><label>Degree</label><input type="text" placeholder="e.g. Bachelor of Science" value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} style={inputStyle} /></div>
                <div><label>Field of Study</label><input type="text" placeholder="e.g. Computer Science" value={formData.fieldOfStudy} onChange={e => setFormData({...formData, fieldOfStudy: e.target.value})} style={inputStyle} /></div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}><label>University</label><input type="text" placeholder="Confirm University" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} style={inputStyle} /></div>
                  <div style={{ flex: 1 }}><label>Grad Year</label><input type="number" placeholder="2026" value={formData.gradYear} onChange={e => setFormData({...formData, gradYear: e.target.value})} style={inputStyle} /></div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3 }}>
              <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Select areas you are interested in:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {availableInterests.map(interest => (
                  <motion.div 
                    key={interest} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(interest)}
                    style={{
                      padding: '0.6rem 1.2rem', borderRadius: '20px', cursor: 'pointer',
                      border: `1px solid ${formData.interests.includes(interest) ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                      backgroundColor: formData.interests.includes(interest) ? 'var(--accent-color)' : 'transparent',
                      color: formData.interests.includes(interest) ? '#fff' : 'var(--text-primary)',
                      fontWeight: '500', transition: 'all 0.2s'
                    }}
                  >
                    {interest}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3 }}>
              <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Add your skills and rate your expertise:</p>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input type="text" placeholder="e.g. Python, React" value={currentSkill} onChange={e => setCurrentSkill(e.target.value)} style={{ ...inputStyle, marginTop: 0, flex: 2 }} />
                <select value={currentRating} onChange={e => setCurrentRating(e.target.value)} style={{ ...inputStyle, marginTop: 0, flex: 1 }}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button onClick={addSkill} style={{ ...btnStyle, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>Add</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(formData.skills).map(([skill, rating]) => (
                  <div key={skill} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontWeight: '600' }}>{skill}</span>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>{rating}</span>
                      <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
          {step > 1 ? (
            <button onClick={handleBack} disabled={loading} style={{ ...btnStyle, backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>Back</button>
          ) : <div></div>}
          
          {step < 3 ? (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNext} style={btnStyle}>Next Step</motion.button>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
              onClick={handleSubmit} 
              disabled={loading}
              style={{ ...btnStyle, background: loading ? 'var(--text-secondary)' : 'linear-gradient(45deg, var(--accent-color), #8b5cf6)' }}
            >
              {loading ? 'Saving Profile...' : 'Complete Profile'}
            </motion.button>
          )}
        </div>

      </motion.div>
    </div>
  );
};

export default Wizard;