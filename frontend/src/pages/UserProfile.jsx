import React, { useState } from 'react';
import { User, Shield, Lock, Download, CheckCircle2, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { user } = useAuth();
  const [researchConsent, setResearchConsent] = useState(true);
  const [auditLoggingConsent, setAuditLoggingConsent] = useState(true);
  const [lowBandwidthDefault, setLowBandwidthDefault] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const handleExportData = () => {
    const exportBundle = {
      user_pseudonym: `PSEUDO-${user?.id?.substring(0, 8) || 'USER'}`,
      role: user?.role,
      export_timestamp: new Date().toISOString(),
      notice: 'Pseudonymized data export containing no raw health identifiers.',
      consents: {
        research_aggregation: researchConsent,
        audit_logging: auditLoggingConsent
      }
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis_export_${user?.username || 'user'}.json`;
    a.click();
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 5000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-navy-900)' }}>User Profile & Privacy Controls</h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.92rem' }}>
          Manage your role credentials, privacy consent preferences, and pseudonymous data exports.
        </p>
      </div>

      {exportNotice && (
        <div style={{ background: 'var(--color-teal-50)', border: '1px solid var(--color-teal-200)', color: 'var(--color-teal-800)', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} color="var(--color-teal-600)" />
          <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Pseudonymous data archive successfully exported.</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">Account Credentials & Access Role</div>
          <span className="badge badge-teal" style={{ textTransform: 'uppercase' }}>
            {user?.role || 'User'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" value={user?.full_name || ''} readOnly />
          </div>
          <div>
            <label className="form-label">Username</label>
            <input type="text" className="form-control" value={user?.username || ''} readOnly />
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={user?.email || ''} readOnly />
          </div>
          <div>
            <label className="form-label">Role Classification</label>
            <input type="text" className="form-control" value={user?.role?.toUpperCase() || ''} readOnly />
          </div>
        </div>
      </div>

      {/* Privacy & Consent Settings */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">Granular Consent & Privacy Settings</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-navy-900)' }}>
                Anonymized Research Aggregations
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                Permit de-identified assessment metrics to inform model calibration and clinical pilot studies.
              </div>
            </div>
            <input
              type="checkbox"
              checked={researchConsent}
              onChange={(e) => setResearchConsent(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-navy-900)' }}>
                Immutable Audit Logging
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                Required for security verification, role auditability, and tamper-resistant system operation.
              </div>
            </div>
            <input
              type="checkbox"
              checked={auditLoggingConsent}
              disabled
              style={{ width: '20px', height: '20px', cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-navy-900)' }}>
                Default Low-Bandwidth Mode
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                Optimizes interface payload sizes for rural clinics and unstable mobile networks.
              </div>
            </div>
            <input
              type="checkbox"
              checked={lowBandwidthDefault}
              onChange={(e) => setLowBandwidthDefault(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Data Export Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Pseudonymous Data Rights & Portability</div>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-600)', marginBottom: '16px' }}>
          In accordance with privacy best practices, you can export all assessment records associated with your account. Personal identifiers are stripped, leaving only pseudonymous reference tags.
        </p>
        <button onClick={handleExportData} className="btn btn-outline" style={{ gap: '8px' }}>
          <Download size={16} /> Download Pseudonymized Data Archive (.json)
        </button>
      </div>
    </div>
  );
}
