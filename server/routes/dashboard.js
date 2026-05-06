const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/dashboard
 * Returns aggregated dashboard statistics
 */
router.get('/', (req, res) => {
  try {
    // Total leads count
    const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;

    // Leads by status
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM leads
      GROUP BY status
    `).all();

    const statusMap = {};
    statusCounts.forEach((row) => {
      statusMap[row.status] = row.count;
    });

    // Total estimated deal value
    const totalDealValue = db.prepare('SELECT COALESCE(SUM(deal_value), 0) as total FROM leads').get().total;

    // Won deals value
    const wonDealValue = db.prepare("SELECT COALESCE(SUM(deal_value), 0) as total FROM leads WHERE status = 'Won'").get().total;

    // Lost deals value
    const lostDealValue = db.prepare("SELECT COALESCE(SUM(deal_value), 0) as total FROM leads WHERE status = 'Lost'").get().total;

    // Pipeline value (excluding Won and Lost)
    const pipelineValue = db.prepare("SELECT COALESCE(SUM(deal_value), 0) as total FROM leads WHERE status NOT IN ('Won', 'Lost')").get().total;

    // Leads by source
    const sourceBreakdown = db.prepare(`
      SELECT source, COUNT(*) as count
      FROM leads
      GROUP BY source
      ORDER BY count DESC
    `).all();

    // Leads by priority
    const priorityBreakdown = db.prepare(`
      SELECT priority, COUNT(*) as count
      FROM leads
      GROUP BY priority
      ORDER BY 
        CASE priority
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
        END
    `).all();

    // Win rate
    const closedDeals = (statusMap['Won'] || 0) + (statusMap['Lost'] || 0);
    const winRate = closedDeals > 0 ? ((statusMap['Won'] || 0) / closedDeals * 100).toFixed(1) : 0;

    // Conversion rate (Won / Total)
    const conversionRate = totalLeads > 0 ? ((statusMap['Won'] || 0) / totalLeads * 100).toFixed(1) : 0;

    // Average deal value
    const avgDealValue = totalLeads > 0 ? (totalDealValue / totalLeads).toFixed(0) : 0;

    // Recent leads (last 5)
    const recentLeads = db.prepare(`
      SELECT l.id, l.name, l.company, l.status, l.deal_value, l.created_at, u.name as assigned_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      ORDER BY l.created_at DESC
      LIMIT 5
    `).all();

    // Recent activity (last 10)
    const recentActivity = db.prepare(`
      SELECT a.*, u.name as user_name, l.name as lead_name
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN leads l ON a.lead_id = l.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `).all();

    // Leads by assigned salesperson
    const salesPersonStats = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.avatar_color,
        COUNT(l.id) as total_leads,
        COALESCE(SUM(l.deal_value), 0) as total_value,
        SUM(CASE WHEN l.status = 'Won' THEN 1 ELSE 0 END) as won_count,
        COALESCE(SUM(CASE WHEN l.status = 'Won' THEN l.deal_value ELSE 0 END), 0) as won_value
      FROM users u
      LEFT JOIN leads l ON l.assigned_to = u.id
      WHERE u.role = 'salesperson'
      GROUP BY u.id
      ORDER BY won_value DESC
    `).all();

    res.json({
      overview: {
        totalLeads,
        newLeads: statusMap['New'] || 0,
        contactedLeads: statusMap['Contacted'] || 0,
        qualifiedLeads: statusMap['Qualified'] || 0,
        proposalSent: statusMap['Proposal Sent'] || 0,
        wonLeads: statusMap['Won'] || 0,
        lostLeads: statusMap['Lost'] || 0,
        totalDealValue,
        wonDealValue,
        lostDealValue,
        pipelineValue,
        winRate: parseFloat(winRate),
        conversionRate: parseFloat(conversionRate),
        avgDealValue: parseFloat(avgDealValue),
      },
      sourceBreakdown,
      priorityBreakdown,
      recentLeads,
      recentActivity,
      salesPersonStats,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

/**
 * GET /api/dashboard/pipeline
 * Returns pipeline-specific data for funnel visualization
 */
router.get('/pipeline', (req, res) => {
  try {
    const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

    const pipeline = stages.map((stage) => {
      const data = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(deal_value), 0) as value
        FROM leads WHERE status = ?
      `).get(stage);

      return { stage, count: data.count, value: data.value };
    });

    res.json({ pipeline });
  } catch (error) {
    console.error('Pipeline error:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline data.' });
  }
});

module.exports = router;
