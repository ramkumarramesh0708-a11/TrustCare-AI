import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wifi, WifiOff, User, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const { user, switchDemoRole } = useAuth();
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleRoleSwitch = async (role) => {
    setSwitching(true);
    try {
      await switchDemoRole(role);
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-teal-500)', display: 'inline-block' }}></span>
          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-slate-600)' }}>
            Decision-Support Prototype v1.0
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Fast Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-slate-100)', padding: '4px 6px', borderRadius: 'var(--radius-md)', gap: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)', fontWeight: '600', padding: '0 6px' }}>
            TEST AS:
          </span>
          <button
            onClick={() => handleRoleSwitch('admin')}
            disabled={switching}
            className={`btn btn-sm ${user?.role === 'admin' ? 'btn-navy' : 'btn-outline'}`}
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          >
            Admin
          </button>
          <button
            onClick={() => handleRoleSwitch('reviewer')}
            disabled={switching}
            className={`btn btn-sm ${user?.role === 'reviewer' ? 'btn-navy' : 'btn-outline'}`}
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          >
            Clinician (MD)
          </button>
          <button
            onClick={() => handleRoleSwitch('veterinarian')}
            disabled={switching}
            className={`btn btn-sm ${user?.role === 'veterinarian' ? 'btn-navy' : 'btn-outline'}`}
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          >
            Vet (DVM)
          </button>
          <button
            onClick={() => handleRoleSwitch('user')}
            disabled={switching}
            className={`btn btn-sm ${user?.role === 'user' ? 'btn-navy' : 'btn-outline'}`}
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          >
            Officer / User
          </button>
        </div>

        {/* Low bandwidth toggle */}
        <button
          onClick={() => setLowBandwidth(!lowBandwidth)}
          className="btn btn-outline btn-sm"
          title="Toggle Low Bandwidth Mode"
          style={{ gap: '6px' }}
        >
          {lowBandwidth ? <WifiOff size={14} color="var(--color-amber-600)" /> : <Wifi size={14} color="var(--color-teal-600)" />}
          <span style={{ fontSize: '0.78rem' }}>{lowBandwidth ? 'Low-BW Mode ON' : 'Standard'}</span>
        </button>

        {/* Current User */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--color-slate-200)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-navy-800)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div style={{ lineHeight: '1.2' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-slate-800)' }}>{user.username}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-slate-500)', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
