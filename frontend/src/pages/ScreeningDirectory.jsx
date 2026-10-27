import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  ShieldCheck,
  Eye,
  Activity,
  Smile,
  HeartPulse,
  ArrowRight,
  Clock,
  Lock,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';

const MODULE_ICONS = {
  mental_wellness: Brain,
  trauma_support: ShieldCheck,
  retinal_screening: Eye,
  joint_health: Activity,
  cognitive_screening: Smile,
  livestock_health: HeartPulse
};

const MODULE_DETAILS = {
  mental_wellness: {
    duration: '3–5 mins',
    privacy: 'High Privacy / Non-Stigmatizing',
    highlights: ['Occupational stress index', 'Rest adequacy buffer', 'Confidential referral options']
  },
  trauma_support: {
    duration: '2–4 mins',
    privacy: 'Agency-Centered / All Optional',
    highlights: ['Completely optional questions', 'Skip without penalty', 'Emergency safety navigation']
  },
  retinal_screening: {
    duration: '2 mins (Upload)',
    privacy: 'Encrypted Fundus Upload',
    highlights: ['Grad-CAM attention heatmap', 'Vascular tortuosity check', 'Specialist review mandatory']
  },
  joint_health: {
    duration: '3–5 mins',
    privacy: 'Standard Orthopedic Triage',
    highlights: ['ACR clinical criteria', 'Morning stiffness tracker', 'SHAP feature attribution']
  },
  cognitive_screening: {
    duration: '5–7 mins',
    privacy: 'Strictly Non-Diagnostic',
    highlights: ['Mini-Cog word recall test', 'Orientation assessment', 'Longitudinal follow-up tracking']
  },
  livestock_health: {
    duration: '3 mins',
    privacy: 'Veterinary Syndromic Support',
    highlights: ['Multi-species support', 'Herd contagion early warning', 'Licensed vet referral alerts']
  }
};

export default function ScreeningDirectory() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await api.getModules();
        setModules(data);
      } catch (err) {
        console.error('Failed to load modules:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px 0' }}>Loading screening directory...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-navy-900)' }}>Screening & Risk Assessment Directory</h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', marginTop: '4px' }}>
          Select an independent domain-specific assessment module. Each module utilizes dedicated explainability adapters and shared routing.
        </p>
      </div>

      <div className="grid-3">
        {modules.map((m) => {
          const IconComponent = MODULE_ICONS[m.id] || Activity;
          const meta = MODULE_DETAILS[m.id] || { duration: '3-5 mins', privacy: 'Confidential', highlights: [] };

          return (
            <div key={m.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-slate-100)', color: 'var(--color-teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComponent size={26} />
                </div>
                <span className="badge badge-teal">{m.category}</span>
              </div>

              <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{m.name}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '16px', flex: 1 }}>
                {m.description}
              </p>

              {/* Highlights */}
              <div style={{ background: 'var(--color-slate-50)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-slate-600)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Capabilities & Safeguards
                </div>
                <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.8rem', color: 'var(--color-slate-700)' }}>
                  {meta.highlights.map((h, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <FileCheck size={14} color="var(--color-teal-600)" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-slate-100)', paddingTop: '14px', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {meta.duration}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={13} /> {meta.privacy}
                  </span>
                </div>
                <Link to={`/assessments/new?module=${m.id}`} className="btn btn-primary btn-sm">
                  Start <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
