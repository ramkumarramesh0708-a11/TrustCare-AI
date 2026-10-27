import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Shield,
  ArrowRight,
  Brain,
  Eye,
  HeartPulse,
  Smile,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../services/api';

const RISK_COLORS = {
  low: '#0D9488',
  moderate: '#2563EB',
  high: '#F59E0B',
  urgent: '#DC2626',
  indeterminate: '#64748B'
};

export default function OverviewDashboard() {
  const [stats, setStats] = useState(null);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [overviewStats, assessmentsList, alertsList] = await Promise.all([
          api.getOverviewStats(),
          api.getAssessments({ limit: 5 }),
          api.getAlerts({ status: 'active', limit: 3 })
        ]);
        setStats(overviewStats);
        setRecentAssessments(assessmentsList);
        setAlerts(alertsList);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: '1.1rem', color: 'var(--color-slate-600)' }}>Loading operational metrics...</div>
      </div>
    );
  }

  const pieData = stats?.risk_distribution?.map(r => ({
    name: r.risk_level.charAt(0).toUpperCase() + r.risk_level.slice(1),
    value: r.count,
    color: RISK_COLORS[r.risk_level] || '#64748B'
  })) || [];

  const barData = stats?.module_distribution?.map(m => ({
    name: m.name.split(' ')[0],
    assessments: m.count
  })) || [];

  return (
    <div>
      {/* Top Banner */}
      <div className="disclaimer-banner">
        <Shield size={20} color="var(--color-teal-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>AEGIS AI Multi-Domain Clinical & Safety Decision-Support System</strong>
          <div style={{ fontSize: '0.82rem', marginTop: '2px', color: 'var(--color-slate-600)' }}>
            Operating in validated prototype mode. All machine learning predictions represent decision-support estimates and require qualified professional review before actionable decisions.
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--color-teal-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="card-subtitle">TOTAL ASSESSMENTS</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-navy-900)', marginTop: '4px' }}>
                {stats?.total_assessments || 0}
              </div>
            </div>
            <div style={{ padding: '10px', background: 'var(--color-teal-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-teal-600)' }}>
              <FileText size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '8px' }}>
            Across 6 independent health domains
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-amber-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="card-subtitle">AWAITING REVIEW</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-amber-600)', marginTop: '4px' }}>
                {stats?.pending_review || 0}
              </div>
            </div>
            <div style={{ padding: '10px', background: 'var(--color-amber-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-amber-600)' }}>
              <Clock size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '8px' }}>
            Human triage required
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-red-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="card-subtitle">ACTIVE ALERTS</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-red-600)', marginTop: '4px' }}>
                {stats?.active_alerts || 0}
              </div>
            </div>
            <div style={{ padding: '10px', background: 'var(--color-red-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-red-600)' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '8px' }}>
            {stats?.critical_alerts || 0} critical priority
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-navy-700)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="card-subtitle">REGISTERED MODELS</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-navy-900)', marginTop: '4px' }}>
                {stats?.models_active || 6}
              </div>
            </div>
            <div style={{ padding: '10px', background: 'var(--color-slate-100)', borderRadius: 'var(--radius-md)', color: 'var(--color-navy-700)' }}>
              <Cpu size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '8px' }}>
            {stats?.models_experimental_or_demo || 0} non-clinical demo models
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Assessment Volume by Domain</div>
              <div className="card-subtitle">Screening volume across active specialized modules</div>
            </div>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0F172A', color: 'white', borderRadius: '8px', border: 'none' }}
                />
                <Bar dataKey="assessments" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Risk Categorization Distribution</div>
              <div className="card-subtitle">Triage level breakdown across submitted records</div>
            </div>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0F172A', color: 'white', borderRadius: '8px', border: 'none' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {alerts.length > 0 && (
        <div className="card" style={{ marginBottom: '28px', border: '1px solid var(--color-red-200)', background: 'linear-gradient(180deg, #FFF 0%, var(--color-red-50) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle color="var(--color-red-600)" size={20} />
              <span style={{ fontWeight: '700', color: 'var(--color-red-700)' }}>
                Active Priority Alerts ({alerts.length})
              </span>
            </div>
            <Link to="/alerts" className="btn btn-outline btn-sm">
              View All Alerts
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
                <div>
                  <span className={`badge badge-${a.severity}`} style={{ marginRight: '10px' }}>
                    {a.severity}
                  </span>
                  <span style={{ fontWeight: '600', color: 'var(--color-slate-800)', fontSize: '0.88rem' }}>
                    {a.trigger_reason}
                  </span>
                </div>
                <Link to={`/assessments/${a.assessment_id}`} className="btn btn-primary btn-sm">
                  Review <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Assessments Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Assessments</div>
            <div className="card-subtitle">Latest risk evaluations across all domains</div>
          </div>
          <Link to="/assessments" className="btn btn-outline btn-sm">
            View All History
          </Link>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject ID</th>
                <th>Domain Module</th>
                <th>Risk Category</th>
                <th>Status</th>
                <th>Confidence</th>
                <th>Date & Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentAssessments.map(a => (
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
                    {a.confidence_score ? `${(a.confidence_score * 100).toFixed(0)}%` : 'N/A (Demo)'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                  <td>
                    <Link to={`/assessments/${a.id}`} className="btn btn-outline btn-sm">
                      Inspect XAI
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
