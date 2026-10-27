import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, FileText, Activity } from 'lucide-react';
import { api } from '../services/api';

export default function ModelRegistryPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await api.getModels();
        setModels(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-navy-900)' }}>Model Governance & Evaluation Registry</h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.92rem' }}>
          Transparent repository documenting model versions, clinical validation statuses, intended operational scopes, and known limitations.
        </p>
      </div>

      <div className="disclaimer-banner">
        <ShieldCheck size={20} color="var(--color-teal-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Responsible AI Transparency Commitment</strong>
          <div style={{ fontSize: '0.82rem', marginTop: '2px', color: 'var(--color-slate-600)' }}>
            AEGIS AI maintains strict decoupling between inference software pipelines and clinical certification. Models marked <code>synthetic_pipeline_only</code> serve as software architecture demonstrators and are not certified for independent diagnostic use.
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-slate-500)' }}>
          Loading registered model cards...
        </div>
      ) : (
        <div className="grid-2">
          {models.map((model) => (
            <div key={model.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={20} color="var(--color-navy-700)" />
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--color-navy-900)' }}>{model.name}</h2>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                    Domain: <strong style={{ color: 'var(--color-slate-700)' }}>{model.domain}</strong> | Version: <code>{model.version}</code>
                  </div>
                </div>
                <span className={`badge ${model.status === 'active' ? 'badge-teal' : 'badge-amber'}`}>
                  {model.status}
                </span>
              </div>

              {/* Validation Status Badge Tag */}
              <div style={{ marginBottom: '16px' }}>
                <span className="badge badge-gray" style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
                  Validation Status: <strong style={{ textTransform: 'uppercase', marginLeft: '4px', color: 'var(--color-teal-700)' }}>{model.validation_status.replace(/_/g, ' ')}</strong>
                </span>
              </div>

              {/* Intended Use & Limitations */}
              <div style={{ marginBottom: '16px', flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-navy-900)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Intended Operational Scope:
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '12px' }}>
                  {model.intended_use}
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-amber-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Documented Limitations & Boundaries:
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-600)', background: 'var(--color-amber-50)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-amber-200)' }}>
                  {model.limitations}
                </div>
              </div>

              {/* Metrics */}
              {model.metrics && Object.keys(model.metrics).length > 0 && (
                <div style={{ borderTop: '1px solid var(--color-slate-100)', paddingTop: '12px', marginTop: 'auto' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-slate-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Evaluation Metrics
                  </div>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    {Object.entries(model.metrics).map(([key, val]) => (
                      <div key={key} style={{ background: 'var(--color-slate-100)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--color-slate-500)', textTransform: 'capitalize' }}>{key.replace('_', ' ')}:</span> <strong>{String(val)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
