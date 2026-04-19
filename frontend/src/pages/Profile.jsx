// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import ResumeUpload from '../components/ResumeUpload';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    fullName: '', country: '', university: '', degree: '', fieldOfStudy: '', gradYear: '', interests: [], skills: {}
  });

  const availableInterests = [
    'Frontend Dev', 'Backend Dev', 'Full Stack', 'Mobile Dev', 'Python', 'Java', 'JavaScript', 'C++', 'Go', 'Rust',
    'AI & ML', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'CI/CD & Deployment', 
    'UI/UX Design', 'Database Admin', 'Blockchain', 'Game Dev', 'System Architecture', 'Robotics', 'Finance'
  ];

  const [currentSkill, setCurrentSkill] = useState('');
  const [currentRating, setCurrentRating] = useState('Beginner');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              fullName: data.fullName || '', country: data.country || '', university: data.university || data.profile?.university || '',
              degree: data.profile?.degree || '', fieldOfStudy: data.profile?.fieldOfStudy || '', gradYear: data.profile?.gradYear || '',
              interests: data.interests || [], skills: data.skills || {}
            });
          }
        } catch (error) {
          setMessage({ type: 'error', text: 'Failed to load profile data.' });
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev, interests: prev.interests.includes(interest) ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest]
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() === '') return;
    setFormData(prev => ({ ...prev, skills: { ...prev.skills, [currentSkill]: currentRating } }));
    setCurrentSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => {
      const newSkills = { ...prev.skills };
      delete newSkills[skillToRemove];
      return { ...prev, skills: newSkills };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    setMessage({ type: '', text: 'Saving and updating AI Matcher...' });

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fullName: formData.fullName, country: formData.country, university: formData.university,
        profile: { degree: formData.degree, fieldOfStudy: formData.fieldOfStudy, university: formData.university, gradYear: formData.gradYear },
        interests: formData.interests, skills: formData.skills
      });
      
      // Update Matches based on manual input
      await fetch('https://opportunity-agent-backend.onrender.com/api/agent/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      
      setMessage({ type: 'success', text: 'Profile updated and opportunities matched!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.8rem', marginTop: '0.4rem', borderRadius: '8px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem' };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h3>Loading Profile...</h3></div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0 }}>Edit Your Profile</h2>
          {message.text && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: message.type === 'error' ? '#ef4444' : (message.type === 'success' ? '#10b981' : 'var(--accent-color)'), fontWeight: '600' }}>
              {message.text}
            </motion.span>
          )}
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Basic Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label>Full Name</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={inputStyle} /></div>
              <div><label>Country</label><input type="text" name="country" value={formData.country} onChange={handleChange} style={inputStyle} /></div>
            </div>
          </div>

          <div>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Education</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><label>University</label><input type="text" name="university" value={formData.university} onChange={handleChange} style={inputStyle} /></div>
              <div><label>Graduation Year</label><input type="number" name="gradYear" value={formData.gradYear} onChange={handleChange} style={inputStyle} /></div>
              <div><label>Degree</label><input type="text" name="degree" value={formData.degree} onChange={handleChange} style={inputStyle} /></div>
              <div><label>Field of Study</label><input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} style={inputStyle} /></div>
            </div>
          </div>

          <div>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Interests</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {availableInterests.map(interest => (
                <motion.div key={interest} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => toggleInterest(interest)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', border: `1px solid ${formData.interests.includes(interest) ? 'var(--accent-color)' : 'var(--glass-border)'}`, backgroundColor: formData.interests.includes(interest) ? 'var(--accent-color)' : 'transparent', color: formData.interests.includes(interest) ? '#fff' : 'var(--text-primary)', fontWeight: '500', transition: 'all 0.2s' }}>
                  {interest}
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Skills</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Add a skill (e.g. React)" value={currentSkill} onChange={e => setCurrentSkill(e.target.value)} style={{ ...inputStyle, marginTop: 0, flex: 2 }} />
              <select value={currentRating} onChange={e => setCurrentRating(e.target.value)} style={{ ...inputStyle, marginTop: 0, flex: 1 }}>
                <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option><option value="Expert">Expert</option>
              </select>
              <button type="button" onClick={addSkill} style={{ padding: '0 1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {Object.entries(formData.skills).map(([skill, rating]) => (
                <div key={skill} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{skill}</span>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><span style={{ color: 'var(--accent-color)', fontSize: '0.8rem' }}>{rating}</span><button type="button" onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>✕</button></div>
                </div>
              ))}
            </div>
          </div>

          {/* RESUME UPLOAD ADDED BACK HERE */}
          <ResumeUpload />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving} style={{ padding: '0.8rem 2rem', borderRadius: '8px', border: 'none', backgroundColor: saving ? 'var(--text-secondary)' : 'var(--accent-color)', color: '#fff', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: 'var(--glass-shadow)', fontSize: '1rem' }}>
              {saving ? 'Processing...' : 'Update Profile'}
            </motion.button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default Profile;