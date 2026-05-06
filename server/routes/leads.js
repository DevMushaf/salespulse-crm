const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/leads
 * List leads with optional filtering, searching, sorting, and pagination
 */
router.get('/', (req, res) => {
  try {
    let whereClauses = [];
    let params = [];

    // Filter by status
    if (req.query.status) {
      whereClauses.push('l.status = ?');
      params.push(req.query.status);
    }

    // Filter by source
    if (req.query.source) {
      whereClauses.push('l.source = ?');
      params.push(req.query.source);
    }

    // Filter by assigned salesperson
    if (req.query.assigned_to) {
      whereClauses.push('l.assigned_to = ?');
      params.push(parseInt(req.query.assigned_to));
    }

    // Filter by priority
    if (req.query.priority) {
      whereClauses.push('l.priority = ?');
      params.push(req.query.priority);
    }

    // Search by name, company, or email
    if (req.query.search) {
      whereClauses.push('(l.name LIKE ? OR l.company LIKE ? OR l.email LIKE ?)');
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Sorting
    const allowedSortFields = ['name', 'company', 'status', 'deal_value', 'created_at', 'updated_at', 'priority'];
    const sortField = allowedSortFields.includes(req.query.sort) ? req.query.sort : 'created_at';
    const sortOrder = req.query.order === 'asc' ? 'ASC' : 'DESC';

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = db.prepare(`SELECT COUNT(*) as total FROM leads l ${whereSQL}`).get(...params);

    // Get leads with assigned user name
    const leads = db.prepare(`
      SELECT l.*, u.name as assigned_name, u.avatar_color as assigned_color
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      ${whereSQL}
      ORDER BY l.${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
      leads,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit),
      },
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads.' });
  }
});

/**
 * GET /api/leads/:id
 * Get single lead with details
 */
router.get('/:id', (req, res) => {
  try {
    const lead = db.prepare(`
      SELECT l.*, u.name as assigned_name, u.email as assigned_email, u.avatar_color as assigned_color
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = ?
    `).get(req.params.id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    // Get notes for this lead
    const notes = db.prepare(`
      SELECT n.*, u.name as author_name, u.avatar_color as author_color
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.lead_id = ?
      ORDER BY n.created_at DESC
    `).all(req.params.id);

    // Get activity log for this lead
    const activities = db.prepare(`
      SELECT a.*, u.name as user_name
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.lead_id = ?
      ORDER BY a.created_at DESC
      LIMIT 20
    `).all(req.params.id);

    res.json({ lead, notes, activities });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead.' });
  }
});

/**
 * POST /api/leads
 * Create a new lead
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Lead name is required'),
    body('company').trim().notEmpty().withMessage('Company name is required'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format'),
    body('source').isIn(['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other']).withMessage('Invalid lead source'),
    body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost']).withMessage('Invalid status'),
    body('deal_value').optional().isFloat({ min: 0 }).withMessage('Deal value must be positive'),
    body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, company, email, phone, source, assigned_to, status, deal_value, priority } = req.body;

      const result = db.prepare(`
        INSERT INTO leads (name, company, email, phone, source, assigned_to, status, deal_value, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        name,
        company,
        email || null,
        phone || null,
        source || 'Website',
        assigned_to || req.user.id,
        status || 'New',
        deal_value || 0,
        priority || 'Medium'
      );

      // Log activity
      db.prepare(
        'INSERT INTO activity_log (lead_id, user_id, action, details) VALUES (?, ?, ?, ?)'
      ).run(result.lastInsertRowid, req.user.id, 'created', 'Lead created');

      // Fetch the created lead
      const lead = db.prepare(`
        SELECT l.*, u.name as assigned_name
        FROM leads l
        LEFT JOIN users u ON l.assigned_to = u.id
        WHERE l.id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json({ message: 'Lead created successfully', lead });
    } catch (error) {
      console.error('Create lead error:', error);
      res.status(500).json({ error: 'Failed to create lead.' });
    }
  }
);

/**
 * PUT /api/leads/:id
 * Update a lead
 */
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Lead name cannot be empty'),
    body('company').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format'),
    body('source').optional().isIn(['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other']).withMessage('Invalid lead source'),
    body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost']).withMessage('Invalid status'),
    body('deal_value').optional().isFloat({ min: 0 }).withMessage('Deal value must be positive'),
    body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if lead exists
      const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: 'Lead not found.' });
      }

      const { name, company, email, phone, source, assigned_to, status, deal_value, priority } = req.body;

      // Track status change for activity log
      if (status && status !== existing.status) {
        db.prepare(
          'INSERT INTO activity_log (lead_id, user_id, action, details) VALUES (?, ?, ?, ?)'
        ).run(req.params.id, req.user.id, 'status_change', `Status changed from ${existing.status} to ${status}`);
      }

      db.prepare(`
        UPDATE leads SET
          name = COALESCE(?, name),
          company = COALESCE(?, company),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          source = COALESCE(?, source),
          assigned_to = COALESCE(?, assigned_to),
          status = COALESCE(?, status),
          deal_value = COALESCE(?, deal_value),
          priority = COALESCE(?, priority),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        name || null,
        company || null,
        email !== undefined ? email : null,
        phone !== undefined ? phone : null,
        source || null,
        assigned_to || null,
        status || null,
        deal_value !== undefined ? deal_value : null,
        priority || null,
        req.params.id
      );

      // Log update activity
      db.prepare(
        'INSERT INTO activity_log (lead_id, user_id, action, details) VALUES (?, ?, ?, ?)'
      ).run(req.params.id, req.user.id, 'updated', 'Lead details updated');

      // Fetch updated lead
      const lead = db.prepare(`
        SELECT l.*, u.name as assigned_name
        FROM leads l
        LEFT JOIN users u ON l.assigned_to = u.id
        WHERE l.id = ?
      `).get(req.params.id);

      res.json({ message: 'Lead updated successfully', lead });
    } catch (error) {
      console.error('Update lead error:', error);
      res.status(500).json({ error: 'Failed to update lead.' });
    }
  }
);

/**
 * DELETE /api/leads/:id
 * Delete a lead
 */
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Failed to delete lead.' });
  }
});

/**
 * GET /api/leads/:id/notes
 * Get notes for a lead
 */
router.get('/:id/notes', (req, res) => {
  try {
    const lead = db.prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const notes = db.prepare(`
      SELECT n.*, u.name as author_name, u.avatar_color as author_color
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.lead_id = ?
      ORDER BY n.created_at DESC
    `).all(req.params.id);

    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes.' });
  }
});

/**
 * POST /api/leads/:id/notes
 * Add a note to a lead
 */
router.post(
  '/:id/notes',
  [body('content').trim().notEmpty().withMessage('Note content is required')],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const lead = db.prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found.' });
      }

      const { content } = req.body;

      const result = db.prepare(
        'INSERT INTO notes (lead_id, content, created_by) VALUES (?, ?, ?)'
      ).run(req.params.id, content, req.user.id);

      // Update lead's updated_at timestamp
      db.prepare('UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);

      // Log activity
      db.prepare(
        'INSERT INTO activity_log (lead_id, user_id, action, details) VALUES (?, ?, ?, ?)'
      ).run(req.params.id, req.user.id, 'note_added', 'Note added to lead');

      // Fetch the created note
      const note = db.prepare(`
        SELECT n.*, u.name as author_name, u.avatar_color as author_color
        FROM notes n
        LEFT JOIN users u ON n.created_by = u.id
        WHERE n.id = ?
      `).get(result.lastInsertRowid);

      res.status(201).json({ message: 'Note added successfully', note });
    } catch (error) {
      console.error('Add note error:', error);
      res.status(500).json({ error: 'Failed to add note.' });
    }
  }
);

module.exports = router;
