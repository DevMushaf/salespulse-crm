const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/users/salespeople
 * Get list of salespeople for assignment dropdowns
 */
router.get('/salespeople', (req, res) => {
  try {
    const salespeople = db.prepare(
      "SELECT id, name, email, avatar_color FROM users WHERE role IN ('salesperson', 'admin') ORDER BY name"
    ).all();

    res.json({ salespeople });
  } catch (error) {
    console.error('Get salespeople error:', error);
    res.status(500).json({ error: 'Failed to fetch salespeople.' });
  }
});

module.exports = router;
