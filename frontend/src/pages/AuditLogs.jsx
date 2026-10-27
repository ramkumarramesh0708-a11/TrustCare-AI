import React, { useState, useEffect } from 'react';
import { FileText, Search, Shield, Filter } from 'lucide-react';
import { api } from '../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      const data = await api.getAuditLogs(params);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-navy-900)' }}>System Security & Audit Trail</h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.92rem' }}>
          Immutable chronological ledger recording all authentication, assessment submissions, explanations, and reviews.
        </p>
      </div>

      {/* Filter */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '220px' }}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Security Events</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="USER_REGISTERED">User Registrations</option>
            <option value="ASSESSMENT_SUBMITTED">Assessments Submitted</option>
            <option value="HUMAN_REVIEW_SUBMITTED">Human Reviews Submitted</option>
            <option value="ALERT_STATUS_UPDATED">Alert Status Changes</option>
            <option value="FOLLOW_UP_SCHEDULED">Follow-Ups Scheduled</option>
          </select>

          <button onClick={fetchLogs} className="btn btn-outline btn-sm">
            Refresh Ledger
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-slate-500)' }}>
            Loading audit records...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-slate-500)' }}>
            No audit records matching query.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>Actor Role</th>
                  <th>Target Resource</th>
                  <th>IP Address</th>
                  <th>Event Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                        {log.user_role}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {log.resource_type} {log.resource_id ? `(${log.resource_id.substring(0, 8)})` : ''}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                      <code>{log.ip_address}</code>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--color-slate-600)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {JSON.stringify(log.details)}
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
