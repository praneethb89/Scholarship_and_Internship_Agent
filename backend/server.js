// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const serviceAccount = require('./config/firebaseServiceAccount.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// Import Routes
const agentRoutes = require('./routes/agentRoutes');

// Use Routes
app.use('/api/agent', agentRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Backend system online and connected to Firebase, boss!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server actively running on port ${PORT}`);
});