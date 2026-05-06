import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, UserPlus, Award, XCircle, DollarSign, TrendingUp, Target, BarChart3, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const STATUS_COLORS = { New: '#6366f1', Contacted: '#3b82f6', Qualified: '#14b8a6', 'Proposal Sent': '#f59e0b', Won: '#22c55e', Lost: '#ef4444' };
const SOURCE_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6', '#8b5cf6'];

function fmt(val) {
  if (val >= 1e6) return `$${(val/1e6).toFixed(1)}M`;
  if (val >= 1e3) return `$${(val/1e3).toFixed(0)}K`;
  return `$${val}`;
}

function timeAgo(d) {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms/6e4), h = Math.floor(ms/36e5), dy = Math.floor(ms/864e5);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (dy < 30) return `${dy}d ago`;
  return new Date(d).toLocaleDateString();
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard'), api.get('/dashboard/pipeline')])
      .then(([d, p]) => { setData(d.data); setPipeline(p.data.pipeline); })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="loader-spinner"></div><p>Loading dashboard...</p></div>;
  if (!data) return null;

  const { overview, sourceBreakdown, recentLeads, recentActivity, salesPersonStats } = data;
  const stats = [
    { label: 'Total Leads', value: overview.totalLeads, icon: Users, color: '#6366f1' },
    { label: 'New Leads', value: overview.newLeads, icon: UserPlus, color: '#3b82f6' },
    { label: 'Qualified', value: overview.qualifiedLeads, icon: Target, color: '#14b8a6' },
    { label: 'Won Deals', value: overview.wonLeads, icon: Award, color: '#22c55e', sub: fmt(overview.wonDealValue) },
    { label: 'Lost Deals', value: overview.lostLeads, icon: XCircle, color: '#ef4444' },
    { label: 'Pipeline Value', value: fmt(overview.pipelineValue), icon: DollarSign, color: '#f59e0b' },
    { label: 'Win Rate', value: `${overview.winRate}%`, icon: TrendingUp, color: '#8b5cf6' },
    { label: 'Avg Deal', value: fmt(overview.avgDealValue), icon: BarChart3, color: '#ec4899' },
  ];
  const pipeData = pipeline.filter(p => p.stage !== 'Lost');

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div><h2>Dashboard</h2><p>Sales pipeline overview and key metrics</p></div>
        <Link to="/leads/new" className="btn btn-primary" id="dashboard-new-lead-btn"><UserPlus size={18} /><span>New Lead</span></Link>
      </div>
      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <div className="stat-card" key={label} id={`stat-${label.toLowerCase().replace(/\s+/g,'-')}`}>
            <div className="stat-icon" style={{ backgroundColor: `${color}15`, color }}><Icon size={22} /></div>
            <div className="stat-content">
              <p className="stat-value">{value}</p>
              <p className="stat-label">{label}</p>
              {sub && <p className="stat-sub">{sub}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="charts-row">
        <div className="chart-card"><h3>Sales Pipeline</h3><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pipeData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis type="category" dataKey="stage" tick={{ fill: '#cbd5e1', fontSize: 13 }} width={100} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {pipeData.map(e => <Cell key={e.stage} fill={STATUS_COLORS[e.stage]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div></div>
        <div className="chart-card"><h3>Lead Sources</h3><div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart><Pie data={sourceBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="count" nameKey="source">
              {sourceBreakdown.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
            </Pie><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} /></PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {sourceBreakdown.map((item, i) => (
              <div key={item.source} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }}></span>
                <span className="legend-label">{item.source}</span>
                <span className="legend-value">{item.count}</span>
              </div>
            ))}
          </div>
        </div></div>
      </div>
      <div className="dashboard-bottom">
        <div className="chart-card"><h3>Team Performance</h3><div className="team-table">
          {salesPersonStats.map(sp => (
            <div className="team-row" key={sp.id}>
              <div className="team-member">
                <div className="team-avatar" style={{ backgroundColor: sp.avatar_color }}>{sp.name.charAt(0)}</div>
                <div><p className="team-name">{sp.name}</p><p className="team-stat">{sp.total_leads} leads · {sp.won_count} won</p></div>
              </div>
              <div className="team-value"><span className="won-badge">{fmt(sp.won_value)}</span></div>
            </div>
          ))}
        </div></div>
        <div className="chart-card"><h3>Recent Activity</h3><div className="activity-list">
          {recentActivity.map(act => (
            <div className="activity-item" key={act.id}>
              <div className={`activity-dot activity-${act.action}`}></div>
              <div className="activity-content">
                <p><strong>{act.user_name}</strong>{' '}
                  {act.action === 'created' && 'created lead'}
                  {act.action === 'updated' && 'updated'}
                  {act.action === 'status_change' && 'changed status of'}
                  {act.action === 'note_added' && 'added note to'}
                  {' '}<Link to={`/leads/${act.lead_id}`} className="activity-link">{act.lead_name}</Link>
                </p>
                <p className="activity-time"><Clock size={12} /> {timeAgo(act.created_at)}</p>
              </div>
            </div>
          ))}
        </div></div>
        <div className="chart-card"><h3>Recent Leads</h3><div className="recent-leads-list">
          {recentLeads.map(lead => (
            <Link to={`/leads/${lead.id}`} className="recent-lead-item" key={lead.id}>
              <div><p className="lead-title">{lead.name}</p><p className="lead-company">{lead.company}</p></div>
              <div className="recent-lead-right">
                <span className={`status-badge status-${lead.status.toLowerCase().replace(/\s+/g,'-')}`}>{lead.status}</span>
                <span className="deal-val">{fmt(lead.deal_value)}</span>
              </div>
            </Link>
          ))}
        </div></div>
      </div>
    </div>
  );
}
