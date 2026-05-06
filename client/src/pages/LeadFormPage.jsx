import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const SOURCES = ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function LeadFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [salespeople, setSalespeople] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    source: 'Website', assigned_to: '', status: 'New',
    deal_value: '', priority: 'Medium',
  });

  useEffect(() => {
    api.get('/users/salespeople').then(r => setSalespeople(r.data.salespeople)).catch(() => {});
    if (isEdit) {
      api.get(`/leads/${id}`).then(r => {
        const l = r.data.lead;
        setForm({
          name: l.name || '', company: l.company || '', email: l.email || '', phone: l.phone || '',
          source: l.source || 'Website', assigned_to: l.assigned_to || '', status: l.status || 'New',
          deal_value: l.deal_value || '', priority: l.priority || 'Medium',
        });
      }).catch(() => { toast.error('Lead not found'); navigate('/leads'); })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Lead name is required';
    if (!form.company.trim()) e.company = 'Company name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (form.deal_value && (isNaN(form.deal_value) || Number(form.deal_value) < 0)) e.deal_value = 'Must be a positive number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        deal_value: form.deal_value ? Number(form.deal_value) : 0,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      };
      if (isEdit) {
        await api.put(`/leads/${id}`, payload);
        toast.success('Lead updated successfully');
        navigate(`/leads/${id}`);
      } else {
        const res = await api.post('/leads', payload);
        toast.success('Lead created successfully');
        navigate(`/leads/${res.data.lead.id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Failed to save lead';
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  };

  if (loading) return <div className="page-loader"><div className="loader-spinner"></div></div>;

  return (
    <div className="lead-form-page">
      <div className="page-header">
        <div className="header-left">
          <Link to={isEdit ? `/leads/${id}` : '/leads'} className="back-link"><ArrowLeft size={18} /> Back</Link>
          <h2>{isEdit ? 'Edit Lead' : 'Create New Lead'}</h2>
          <p>{isEdit ? 'Update lead information' : 'Add a new lead to your pipeline'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="lead-form" id="lead-form">
        <div className="form-card">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lead-name">Lead Name *</label>
              <input id="lead-name" type="text" value={form.name} onChange={e => update('name', e.target.value)}
                placeholder="e.g. John Smith" className={errors.name ? 'input-error' : ''} />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lead-company">Company Name *</label>
              <input id="lead-company" type="text" value={form.company} onChange={e => update('company', e.target.value)}
                placeholder="e.g. Acme Corp" className={errors.company ? 'input-error' : ''} />
              {errors.company && <span className="field-error">{errors.company}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lead-email">Email</label>
              <input id="lead-email" type="email" value={form.email} onChange={e => update('email', e.target.value)}
                placeholder="john@acmecorp.com" className={errors.email ? 'input-error' : ''} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lead-phone">Phone Number</label>
              <input id="lead-phone" type="text" value={form.phone} onChange={e => update('phone', e.target.value)}
                placeholder="+1-555-0100" />
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3>Lead Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lead-source">Lead Source</label>
              <select id="lead-source" value={form.source} onChange={e => update('source', e.target.value)}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="lead-assigned">Assigned Salesperson</label>
              <select id="lead-assigned" value={form.assigned_to} onChange={e => update('assigned_to', e.target.value)}>
                <option value="">Select salesperson</option>
                {salespeople.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lead-status">Status</label>
              <select id="lead-status" value={form.status} onChange={e => update('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="lead-priority">Priority</label>
              <select id="lead-priority" value={form.priority} onChange={e => update('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lead-deal-value">Estimated Deal Value ($)</label>
              <input id="lead-deal-value" type="number" min="0" step="100" value={form.deal_value}
                onChange={e => update('deal_value', e.target.value)} placeholder="e.g. 25000"
                className={errors.deal_value ? 'input-error' : ''} />
              {errors.deal_value && <span className="field-error">{errors.deal_value}</span>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Link to={isEdit ? `/leads/${id}` : '/leads'} className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={submitting} id="save-lead-btn">
            {submitting ? <><Loader size={16} className="spin" /> Saving...</> : <><Save size={16} /> {isEdit ? 'Update Lead' : 'Create Lead'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
