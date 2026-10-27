import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('dr.chen');
  const [password, setPassword] = useState('doctor123');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setSubmitting(true);
    setError(null);
    try {
      await switchDemoRole(role);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Quick login failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--color-navy-950) 0%, var(--color-navy-900) 50%, var(--color-navy-800) 100%)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo and Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--color-teal-600) 0%, var(--color-teal-500) 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: 'var(--shadow-glow)', marginBottom: '14px' }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: 'white', letterSpacing: '0.02em' }}>AEGIS AI</h1>
          <p style={{ color: 'var(--color-teal-500)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
            Multi-Domain Risk Assessment Platform
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px', boxShadow: 'var(--shadow-xl)' }}>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-navy-900)', marginBottom: '8px' }}>Sign In</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-500)', marginBottom: '20px' }}>
            Access authorized decision-support workflows and screening triage.
          </p>

          {error && (
            <div className="urgent-banner" style={{ padding: '10px 14px', fontSize: '0.85rem', marginBottom: '18px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
                <User size={16} color="var(--color-slate-400)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <Lock size={16} color="var(--color-slate-400)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
              {submitting ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--color-slate-100)', paddingTop: '18px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-slate-500)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center' }}>
              1-Click Instant Demo Login
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('reviewer')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Clinician (Dr. Chen)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Administrator
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('veterinarian')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Veterinarian (Dr. Marcus)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('user')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Uniformed Officer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
