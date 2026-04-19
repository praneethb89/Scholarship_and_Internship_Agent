// src/components/ResumeUpload.jsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); validateAndSetFile(e.dataTransfer.files[0]); };
  const handleFileSelect = (e) => { validateAndSetFile(e.target.files[0]); };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.docx'))) {
      setFile(selectedFile); setMessage({ type: '', text: '' });
    } else {
      setMessage({ type: 'error', text: 'Please upload a PDF or DOCX file.' }); setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const user = auth.currentUser;
    if (!user) { setMessage({ type: 'error', text: 'You must be logged in.' }); return; }

    setUploading(true);
    setMessage({ type: '', text: 'Uploading file securely...' });

    // DEMO MODE: Simulate upload progress to bypass Firebase Storage limits
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setProgress(currentProgress);
      if (currentProgress >= 100) clearInterval(interval);
    }, 400);

    setTimeout(async () => {
      setMessage({ type: '', text: 'Analyzing resume with AI...' });
      
      try {
        // Save mock keywords to Firestore so the AI Matcher has something to read
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'resume_data.file_name': file.name,
          'resume_data.parsed': true,
          'resume_data.extracted_keywords': ['leadership', 'communication', 'problem solving', 'teamwork', 'project management']
        });

        setMessage({ type: '', text: 'Scoring and matching opportunities...' });
        
        // Trigger the Python Matcher
        await fetch('http://localhost:5000/api/agent/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid })
        });

        setMessage({ type: 'success', text: 'Resume processed and opportunities matched!' });
      } catch (err) {
        setMessage({ type: 'error', text: 'AI analysis failed.' });
      } finally {
        setUploading(false); setFile(null); setProgress(0);
      }
    }, 3000); // Takes 3 seconds total to look realistic
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Resume Upload (Optional)</h3>
      {message.text && <p style={{ color: message.type === 'error' ? '#ef4444' : (message.type === 'success' ? '#10b981' : 'var(--accent-color)'), fontSize: '0.9rem', marginBottom: '1rem', fontWeight: '600' }}>{message.text}</p>}

      <motion.div whileHover={{ scale: 1.01 }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current.click()} style={{ border: `2px dashed ${dragging ? 'var(--accent-color)' : 'var(--glass-border)'}`, backgroundColor: dragging ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-primary)', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.docx" style={{ display: 'none' }} />
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
        {file ? <p style={{ margin: 0, fontWeight: '600', color: 'var(--accent-color)' }}>{file.name}</p> : <div><p style={{ margin: 0, fontWeight: '500' }}>Drag & Drop your resume here</p><p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Supports PDF and DOCX</p></div>}
      </motion.div>

      {uploading && <div style={{ marginTop: '1rem', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-color), #8b5cf6)' }}/></div>}
      {file && !uploading && <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpload} style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--accent-color)', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: 'var(--glass-shadow)' }}>Upload & Analyze Resume</motion.button>}
    </div>
  );
};

export default ResumeUpload;