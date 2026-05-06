import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Pencil, Trash2, Send, Building2, Mail, Phone, Globe, User, DollarSign, Calendar, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

function fmt(v) { return v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${v}`; }

export default function LeadDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];

  useEffect(() => { fetchLead(); }, [id]);

  const fetchLead = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/leads/${id}`);
      setLead(res.data.lead);
      setNotes(res.data.notes);
      setActivities(res.data.activities);
    } catch { toast.error('Failed to load lead'); navigate('/leads'); }
    finally { setLoading(false); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/leads/${id}/notes`, { content: noteText });
      setNotes([res.data.note, ...notes]);
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await api.put(`/leads/${id}`, { status: newStatus });
      setLead({ ...lead, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchLead();
    } catch { toast.error('Failed to update status'); }
    finally { setStatusUpdating(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      navigate('/leads');
    } catch { toast.error('Failed to delete lead'); }
  };

  if (loading) return <div className="page-loader"><div className="loader-spinner"></div><p>Loading lead...</p></div>;
  if (!lead) return null;

  return (
    <div className="lead-detail-page">
      <div className="page-header">
        <div className="header-left">
          <Link to="/leads" className="back-link"><ArrowLeft size={18} /> Back to Leads</Link>
          <h2>{lead.name}</h2>
          <p className="lead-company-header"><Building2 size={16} /> {lead.company}</p>
        </div>
        <div className="header-actions">
          <Link to={`/leads/${id}/edit`} className="btn btn-outline" id="edit-lead-btn"><Pencil size={16} /> Edit</Link>
          <button className="btn btn-danger-outline" onClick={() => setShowDelete(true)} id="delete-lead-btn"><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="status-pipeline">
        {STATUSES.map(s => (
          <button key={s} className={`pipeline-stage ${lead.status === s ? 'active' : ''} ${STATUSES.indexOf(s) < STATUSES.indexOf(lead.status) ? 'completed' : ''}`}
            onClick={() => handleStatusChange(s)} disabled={statusUpdating} id={`status-${s.toLowerCase().replace(/\s+/g, '-')}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="detail-grid">
        {/* Lead Info Card */}
        <div className="detail-card info-card">
          <h3>Lead Information</h3>
          <div className="info-grid">
            <div className="info-item"><Mail size={16} /><div><label>Email</label><p>{lead.email || '—'}</p></div></div>
            <div className="info-item"><Phone size={16} /><div><label>Phone</label><p>{lead.phone || '—'}</p></div></div>
            <div className="info-item"><Globe size={16} /><div><label>Source</label><p>{lead.source}</p></div></div>
            <div className="info-item"><User size={16} /><div><label>Assigned To</label><p>{lead.assigned_name || 'Unassigned'}</p></div></div>
            <div className="info-item"><DollarSign size={16} /><div><label>Deal Value</label><p className="deal-highlight">{fmt(lead.deal_value)}</p></div></div>
            <div className="info-item"><Calendar size={16} /><div><label>Priority</label><p><span className={`priority-badge priority-${lead.priority?.toLowerCase()}`}>{lead.priority}</span></p></div></div>
            <div className="info-item"><Calendar size={16} /><div><label>Created</label><p>{new Date(lead.created_at).toLocaleString()}</p></div></div>
            <div className="info-item"><Clock size={16} /><div><label>Last Updated</label><p>{new Date(lead.updated_at).toLocaleString()}</p></div></div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="detail-card notes-card">
          <h3><MessageSquare size={18} /> Notes ({notes.length})</h3>
          <form onSubmit={handleAddNote} className="note-form" id="add-note-form">
            <textarea placeholder="Add a note about this lead..." value={noteText}
              onChange={e => setNoteText(e.target.value)} rows={3} id="note-textarea" />
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !noteText.trim()} id="submit-note-btn">
              <Send size={14} /> {submitting ? 'Adding...' : 'Add Note'}
            </button>
          </form>
          <div className="notes-list">
            {notes.length === 0 ? <p className="empty-notes">No notes yet. Add one above.</p> : notes.map(note => (
              <div className="note-item" key={note.id}>
                <div className="note-header">
                  <div className="note-author">
                    <div className="mini-avatar" style={{ backgroundColor: note.author_color }}>{note.author_name?.charAt(0)}</div>
                    <strong>{note.author_name}</strong>
                  </div>
                  <span className="note-date">{new Date(note.created_at).toLocaleString()}</span>
                </div>
                <p className="note-content">{note.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="detail-card activity-card">
          <h3><Clock size={18} /> Activity Timeline</h3>
          <div className="timeline">
            {activities.map(act => (
              <div className="timeline-item" key={act.id}>
                <div className={`timeline-dot dot-${act.action}`}></div>
                <div className="timeline-content">
                  <p><strong>{act.user_name}</strong> — {act.details || act.action}</p>
                  <span className="timeline-date">{new Date(act.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Lead</h3>
            <p>Delete <strong>{lead.name}</strong>? This removes all notes and activity history.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
