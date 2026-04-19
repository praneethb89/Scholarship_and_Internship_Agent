// backend/controllers/agentController.js
const { spawn } = require('child_process');
const path = require('path');

const triggerResumeParser = async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: 'User UID is required' });

  const scriptPath = path.join(__dirname, '../../agent/resume_parser.py');
  const pythonProcess = spawn('python', [scriptPath, uid]);

  let pythonOutput = '';
  let pythonError = '';

  pythonProcess.stdout.on('data', (data) => { pythonOutput += data.toString(); });
  pythonProcess.stderr.on('data', (data) => { pythonError += data.toString(); });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Parser exited with code ${code}: ${pythonError}`);
      return res.status(500).json({ error: 'Failed to parse resume', details: pythonError });
    }
    res.status(200).json({ message: 'Resume parsed successfully', output: pythonOutput.trim() });
  });
};

const triggerMatcher = async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: 'User UID is required' });

  const scriptPath = path.join(__dirname, '../../agent/matcher.py');
  const pythonProcess = spawn('python', [scriptPath, uid]);

  let pythonOutput = '';
  let pythonError = '';

  pythonProcess.stdout.on('data', (data) => { pythonOutput += data.toString(); });
  pythonProcess.stderr.on('data', (data) => { pythonError += data.toString(); });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Matcher exited with code ${code}: ${pythonError}`);
      return res.status(500).json({ error: 'Failed to match opportunities', details: pythonError });
    }
    res.status(200).json({ message: 'Opportunities matched successfully', output: pythonOutput.trim() });
  });
};

module.exports = {
  triggerResumeParser,
  triggerMatcher
};