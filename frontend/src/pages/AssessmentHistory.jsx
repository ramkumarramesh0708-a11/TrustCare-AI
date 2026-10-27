import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Search, Filter, ArrowRight, Download, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function AssessmentHistory() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (moduleFilter) params.module_id = moduleFilter;
      if (statusFilter) params.status = statusFilter;
      if (riskFilter) params.risk_level = riskFilter;
      if (searchTerm) params.search = searchTerm;
      const data = await api.getAssessments(params);
      setAssessments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [moduleFilter, statusFilter, riskFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAssessments();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-navy-900)' }}>Assessment History</h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.92rem' }}>
            Comprehensive longitudinal audit trail of submitted risk evaluations.
          </p>
        </div>
        <Link to="/assessments/new" className="btn btn-primary btn-sm">
          New Assessment
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', background: 'var(--color-slate-50)', border: '1px solid var(--color-slate-300)', borderRadius: 'var(--radius-md)', padding: '0 10px' }}>
            <Search size={16} color="var(--color-slate-400)" />
            <input
              type="text"
              placeholder="Search Subject ID (e.g. SUBJ-4819)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', padding: '9px 10px', width: '100%', fontSize: '0.88rem' }}
            />
          </div>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '160px' }}
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="">All Domains</option>
            <option value="mental_wellness">Mental Wellness</option>
            <option value="trauma_support">Trauma Support</option>
            <option value="retinal_screening">Retinal Screening</option>
            <option value="joint_health">Joint Health</option>
            <option value="cognitive_screening">Cognitive Screening</option>
            <option value="livestock_health">Livestock Health</option>
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '140px' }}
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="">All Risk Tiers</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="pending_review">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="follow_up_required">Follow-Up Required</option>
            <option value="closed">Closed</option>
          </select>

          <button type="submit" className="btn btn-navy btn-sm">
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-slate-500)' }}>
            Loading records...
          </div>
        ) : assessments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-slate-500)' }}>
            No assessments found matching specified filter criteria.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject ID</th>
                  <th>Domain</th>
                  <th>Risk Tier</th>
                  <th>Review Status</th>
                  <th>Confidence</th>
                  <th>Outcome Summary</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: '700', color: 'var(--color-navy-900)' }}>
                      {a.subject_ref}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {a.module_id.replace('_', ' ')}
                    </td>
                    <td>
                      <span className={`badge badge-${a.risk_level}`}>
                        {a.risk_level}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${a.status === 'reviewed' ? 'success' : a.status === 'pending_review' ? 'warning' : 'gray'}`}>
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {a.confidence_score ? `${(a.confidence_score * 100).toFixed(0)}%` : 'Pipeline Estimate'}
                    </td>
                    <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.82rem' }}>
                      {a.outcome_summary}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                      {new Date(a.created_at).toLocaleDateString()} {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <Link to={`/assessments/${a.id}`} className="btn btn-outline btn-sm">
                        View XAI
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
