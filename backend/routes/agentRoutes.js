// backend/routes/agentRoutes.js
const express = require('express');
const router = express.Router();
const { triggerResumeParser, triggerMatcher } = require('../controllers/agentController');

router.post('/parse-resume', triggerResumeParser);
router.post('/match', triggerMatcher);

module.exports = router;