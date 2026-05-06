import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, UserPlus, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const SOURCES = ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'];

function fmt(v) {
  if (v >= 1e6) return `$${(v/1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v/1e3).toFixed(0)}K`;
  return `$${v}`;
}

export default function LeadsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [salespeople, setSalespeople] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    source: searchParams.get('source') || '',
    assigned_to: searchParams.get('assigned_to') || '',
    sort: searchParams.get('sort') || 'created_at',
    order: searchParams.get('order') || 'desc',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    api.get('/users/salespeople').then(r => setSalespeople(r.data.salespeople)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchLeads();
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== '' && !(k === 'page' && v === 1)) params[k] = v; });
    setSearchParams(params, { replace: true });
  }, [filters]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.source) params.source = filters.source;
      if (filters.assigned_to) params.assigned_to = filters.assigned_to;
      params.sort = filters.sort;
      params.order = filters.order;
      params.page = filters.page;
      params.limit = 10;

      const res = await api.get('/leads', { params });
      setLeads(res.data.leads);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/leads/${deleteId}`);
      toast.success('Lead deleted');
      setDeleteId(null);
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', source: '', assigned_to: '', sort: 'created_at', order: 'desc', page: 1 });
  };

  const hasActiveFilters = filters.status || filters.source || filters.assigned_to;

  return (
    <div className="leads-page">
      <div className="page-header">
        <div><h2>Leads</h2><p>{pagination.total} total leads</p></div>
        <Link to="/leads/new" className="btn btn-primary" id="leads-new-btn"><UserPlus size={18} /><span>New Lead</span></Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text" placeholder="Search leads by name, company, or email..."
            value={filters.search} id="leads-search-input"
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          />
          {filters.search && <button className="clear-search" onClick={() => setFilters(f => ({ ...f, search: '', page: 1 }))}><X size={16} /></button>}
        </div>
        <button className={`btn btn-outline filter-toggle ${hasActiveFilters ? 'has-filters' : ''}`} onClick={() => setShowFilters(!showFilters)} id="filter-toggle-btn">
          <Filter size={18} /><span>Filters</span>{hasActiveFilters && <span className="filter-count">{[filters.status, filters.source, filters.assigned_to].filter(Boolean).length}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Status</label>
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))} id="filter-status">
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Source</label>
            <select value={filters.source} onChange={e => setFilters(f => ({ ...f, source: e.target.value, page: 1 }))} id="filter-source">
              <option value="">All Sources</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Salesperson</label>
            <select value={filters.assigned_to} onChange={e => setFilters(f => ({ ...f, assigned_to: e.target.value, page: 1 }))} id="filter-salesperson">
              <option value="">All Salespeople</option>
              {salespeople.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))} id="filter-sort">
              <option value="created_at">Created Date</option>
              <option value="updated_at">Last Updated</option>
              <option value="name">Name</option>
              <option value="deal_value">Deal Value</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All</button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      {loading ? (
        <div className="page-loader"><div className="loader-spinner"></div></div>
      ) : leads.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No leads found</p>
          <p className="empty-sub">{hasActiveFilters || filters.search ? 'Try adjusting your filters' : 'Create your first lead to get started'}</p>
          {!hasActiveFilters && <Link to="/leads/new" className="btn btn-primary">Create Lead</Link>}
        </div>
      ) : (
        <>
          <div className="leads-table-wrapper">
            <table className="leads-table" id="leads-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Assigned To</th>
                  <th>Deal Value</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <div className="lead-cell">
                        <Link to={`/leads/${lead.id}`} className="lead-name-link">{lead.name}</Link>
                        <span className="lead-company-cell">{lead.company}</span>
                      </div>
                    </td>
                    <td><span className={`status-badge status-${lead.status.toLowerCase().replace(/\s+/g, '-')}`}>{lead.status}</span></td>
                    <td><span className="source-tag">{lead.source}</span></td>
                    <td>
                      {lead.assigned_name ? (
                        <div className="assigned-cell">
                          <div className="mini-avatar" style={{ backgroundColor: lead.assigned_color }}>{lead.assigned_name.charAt(0)}</div>
                          <span>{lead.assigned_name}</span>
                        </div>
                      ) : <span className="text-muted">Unassigned</span>}
                    </td>
                    <td className="deal-value-cell">{fmt(lead.deal_value)}</td>
                    <td className="date-cell">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btns">
                        <Link to={`/leads/${lead.id}`} className="action-btn view" title="View"><Eye size={16} /></Link>
                        <Link to={`/leads/${lead.id}/edit`} className="action-btn edit" title="Edit"><Pencil size={16} /></Link>
                        <button className="action-btn delete" title="Delete" onClick={() => setDeleteId(lead.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm" disabled={pagination.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="page-info">Page {pagination.page} of {pagination.totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Lead</h3>
            <p>Are you sure? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} id="confirm-delete-btn">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
