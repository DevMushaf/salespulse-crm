const bcrypt = require('bcryptjs');
const db = require('./database');

function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  db.exec('DELETE FROM activity_log');
  db.exec('DELETE FROM notes');
  db.exec('DELETE FROM leads');
  db.exec('DELETE FROM users');

  // Reset auto-increment
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users','leads','notes','activity_log')");

  // Create users
  const passwordHash = bcrypt.hashSync('password123', 10);

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password_hash, role, avatar_color) VALUES (?, ?, ?, ?, ?)'
  );

  insertUser.run('Admin User', 'admin@example.com', passwordHash, 'admin', '#6366f1');
  insertUser.run('Sarah Johnson', 'sarah@example.com', passwordHash, 'salesperson', '#ec4899');
  insertUser.run('Mike Chen', 'mike@example.com', passwordHash, 'salesperson', '#14b8a6');
  insertUser.run('Emily Davis', 'emily@example.com', passwordHash, 'salesperson', '#f59e0b');

  console.log('✅ Created 4 users');

  // Create leads
  const insertLead = db.prepare(`
    INSERT INTO leads (name, company, email, phone, source, assigned_to, status, deal_value, priority, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const leads = [
    ['John Smith', 'Acme Corp', 'john@acmecorp.com', '+1-555-0101', 'Website', 2, 'New', 15000, 'High', '2026-04-20 10:00:00', '2026-04-20 10:00:00'],
    ['Lisa Wang', 'TechStart Inc', 'lisa@techstart.io', '+1-555-0102', 'LinkedIn', 2, 'Contacted', 25000, 'High', '2026-04-18 14:30:00', '2026-04-22 09:00:00'],
    ['Robert Brown', 'Global Solutions', 'robert@globalsol.com', '+1-555-0103', 'Referral', 3, 'Qualified', 50000, 'Critical', '2026-04-15 08:00:00', '2026-04-25 16:00:00'],
    ['Amanda Green', 'StartUp Labs', 'amanda@startuplabs.co', '+1-555-0104', 'Cold Email', 3, 'Proposal Sent', 35000, 'Medium', '2026-04-10 11:00:00', '2026-04-28 10:00:00'],
    ['David Lee', 'Enterprise Co', 'david@enterprise.com', '+1-555-0105', 'Event', 4, 'Won', 75000, 'High', '2026-03-25 09:00:00', '2026-05-01 14:00:00'],
    ['Karen Miller', 'Digital Wave', 'karen@digitalwave.io', '+1-555-0106', 'Website', 4, 'Lost', 20000, 'Low', '2026-03-20 13:00:00', '2026-04-15 11:00:00'],
    ['James Wilson', 'CloudNet', 'james@cloudnet.com', '+1-555-0107', 'LinkedIn', 2, 'New', 30000, 'Medium', '2026-05-01 10:00:00', '2026-05-01 10:00:00'],
    ['Sophie Turner', 'DataFlow Inc', 'sophie@dataflow.com', '+1-555-0108', 'Referral', 3, 'Contacted', 45000, 'High', '2026-04-28 15:00:00', '2026-05-02 09:00:00'],
    ['Mark Johnson', 'InfoSys Ltd', 'mark@infosys.com', '+1-555-0109', 'Website', 4, 'Qualified', 60000, 'Critical', '2026-04-22 08:30:00', '2026-05-03 14:00:00'],
    ['Rachel Adams', 'BrightTech', 'rachel@brighttech.io', '+1-555-0110', 'Cold Email', 2, 'New', 18000, 'Low', '2026-05-03 16:00:00', '2026-05-03 16:00:00'],
    ['Tom Harris', 'MegaCorp', 'tom@megacorp.com', '+1-555-0111', 'Event', 3, 'Proposal Sent', 90000, 'Critical', '2026-04-05 10:00:00', '2026-05-02 11:00:00'],
    ['Nina Patel', 'Swift Solutions', 'nina@swiftsol.com', '+1-555-0112', 'LinkedIn', 4, 'Won', 42000, 'Medium', '2026-03-15 09:00:00', '2026-04-20 16:00:00'],
  ];

  for (const lead of leads) {
    insertLead.run(...lead);
  }

  console.log('✅ Created 12 leads');

  // Create notes
  const insertNote = db.prepare(
    'INSERT INTO notes (lead_id, content, created_by, created_at) VALUES (?, ?, ?, ?)'
  );

  const notes = [
    [1, 'Initial inquiry from website contact form. Interested in our enterprise plan.', 2, '2026-04-20 10:30:00'],
    [2, 'Connected on LinkedIn. She is looking for a CRM solution for her 50-person team.', 2, '2026-04-19 09:00:00'],
    [2, 'Had a 30-min discovery call. Very interested, wants a demo next week.', 2, '2026-04-22 09:00:00'],
    [3, 'Referred by David Lee from Enterprise Co. Large budget, needs custom integrations.', 3, '2026-04-16 10:00:00'],
    [3, 'Completed qualification call. Confirmed budget of $50k+ and Q2 timeline.', 3, '2026-04-25 16:00:00'],
    [4, 'Sent initial proposal with 3 pricing tiers. Awaiting feedback.', 3, '2026-04-28 10:00:00'],
    [5, 'Closed the deal! Annual contract signed for $75k. Onboarding starts next week.', 4, '2026-05-01 14:00:00'],
    [6, 'Lost to competitor. They went with a cheaper solution. Follow up in 6 months.', 4, '2026-04-15 11:00:00'],
    [7, 'New lead from website. Seems promising — mid-market company with 200 employees.', 2, '2026-05-01 10:30:00'],
    [8, 'First contact via email. Booked a call for next Tuesday.', 3, '2026-05-02 09:00:00'],
    [9, 'Very strong prospect. VP of Sales is the decision maker. Budget approved internally.', 4, '2026-05-03 14:00:00'],
    [11, 'Sent comprehensive proposal with ROI analysis. Decision expected by end of month.', 3, '2026-05-02 11:00:00'],
  ];

  for (const note of notes) {
    insertNote.run(...note);
  }

  console.log('✅ Created 12 notes');

  // Create activity log entries
  const insertActivity = db.prepare(
    'INSERT INTO activity_log (lead_id, user_id, action, details, created_at) VALUES (?, ?, ?, ?, ?)'
  );

  const activities = [
    [1, 2, 'created', 'Lead created', '2026-04-20 10:00:00'],
    [2, 2, 'created', 'Lead created', '2026-04-18 14:30:00'],
    [2, 2, 'status_change', 'Status changed from New to Contacted', '2026-04-22 09:00:00'],
    [3, 3, 'created', 'Lead created', '2026-04-15 08:00:00'],
    [3, 3, 'status_change', 'Status changed from New to Qualified', '2026-04-25 16:00:00'],
    [5, 4, 'status_change', 'Status changed to Won', '2026-05-01 14:00:00'],
    [6, 4, 'status_change', 'Status changed to Lost', '2026-04-15 11:00:00'],
  ];

  for (const activity of activities) {
    insertActivity.run(...activity);
  }

  console.log('✅ Created 7 activity log entries');
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Test credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: password123');
}

if (require.main === module) {
  seed();
}

module.exports = seed;

