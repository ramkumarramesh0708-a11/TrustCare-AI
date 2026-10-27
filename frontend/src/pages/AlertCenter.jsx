import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle, Clock, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AlertCenter() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const { user } = useAuth();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      const data = await api.getAlerts(params);
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter]);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      await api.updateAlert(alertId, { status: newStatus });
      fetchAlerts();
    } catch (err) {
      console.error(err);
      alert('Failed to update alert: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-navy-900)' }}>Alert & Triage Center</h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.92rem' }}>
            Automated threshold routing events requiring clinical or safety attention.
          </p>
        </div>
      </div>

      {/* Simulated dispatch notice */}
      <div className="disclaimer-banner">
        <Bell size={20} color="var(--color-teal-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Simulated Multi-Channel Notification Dispatch</strong>
          <div style={{ fontSize: '0.82rem', marginTop: '2px', color: 'var(--color-slate-600)' }}>
            System generated alerts represent internal routing events. Automated SMS/Email gateway interfaces remain decoupled until external telecommunications compliance verification.
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active Triage</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '160px' }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="critical">Critical / Urgent</option>
            <option value="warning">Warning / Elevated</option>
            <option value="info">Informational</option>
          </select>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-slate-500)' }}>
            Loading alert stream...
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-slate-500)' }}>
            No alerts found matching filter criteria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  border: alert.severity === 'critical' ? '1px solid var(--color-red-300)' : '1px solid var(--color-slate-200)',
                  background: alert.status === 'resolved' ? 'var(--color-slate-50)' : alert.severity === 'critical' ? 'var(--color-red-50)' : 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className={`badge badge-${alert.severity}`}>
                      {alert.severity}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-slate-600)', textTransform: 'capitalize' }}>
                      {alert.module_id.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
                      • {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ fontWeight: '700', fontSize: '0.98rem', color: 'var(--color-navy-900)', marginBottom: '4px' }}>
                    {alert.trigger_reason}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                    Alert ID: <code>{alert.id.substring(0, 8)}</code> | Mode: Simulated Dispatch | Status: <strong style={{ textTransform: 'capitalize' }}>{alert.status}</strong>
                    {alert.resolved_by && ` (Resolved by ${alert.resolved_by})`}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {alert.status === 'active' && (
                    <button
                      onClick={() => handleUpdateStatus(alert.id, 'acknowledged')}
                      className="btn btn-outline btn-sm"
                    >
                      <Clock size={14} /> Acknowledge
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                      className="btn btn-primary btn-sm"
                    >
                      <Check size={14} /> Mark Resolved
                    </button>
                  )}
                  <Link to={`/assessments/${alert.assessment_id}`} className="btn btn-navy btn-sm">
                    Inspect Assessment <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
