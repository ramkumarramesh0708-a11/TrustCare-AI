import React from 'react';
import { Shield, PhoneCall, AlertTriangle, CheckCircle, Info, HeartHandshake, Eye } from 'lucide-react';

export default function HelpAndPrivacy() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-navy-900)' }}>Help, Ethical Governance & Clinical Disclaimers</h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.92rem' }}>
          Commitments to transparent, explainable, and privacy-preserving decision support.
        </p>
      </div>

      {/* Emergency Crisis Contact Numbers Banner */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-red-600)', background: 'linear-gradient(180deg, #FFF 0%, var(--color-red-50) 100%)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <PhoneCall size={22} color="var(--color-red-600)" />
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-red-700)' }}>
            Immediate 24/7 Crisis & Emergency Resources
          </h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-700)', marginBottom: '16px' }}>
          If you or someone in your care is experiencing an acute life-threatening emergency, acute psychological distress, or immediate danger, contact these free, confidential 24/7 lifelines immediately:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          <div style={{ background: 'white', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
            <div style={{ fontWeight: '700', color: 'var(--color-navy-900)', fontSize: '0.95rem' }}>
              988 Suicide & Crisis Lifeline
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-600)', marginTop: '2px' }}>
              Call or Text <strong>988</strong> (Available 24/7, English & Spanish)
            </div>
          </div>

          <div style={{ background: 'white', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
            <div style={{ fontWeight: '700', color: 'var(--color-navy-900)', fontSize: '0.95rem' }}>
              Crisis Text Line
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-600)', marginTop: '2px' }}>
              Text <strong>HOME</strong> to <strong>741741</strong> for free confidential support
            </div>
          </div>

          <div style={{ background: 'white', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
            <div style={{ fontWeight: '700', color: 'var(--color-navy-900)', fontSize: '0.95rem' }}>
              National Domestic Violence Hotline
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-600)', marginTop: '2px' }}>
              Call <strong>1-800-799-SAFE (7233)</strong> or text "START" to 88788
            </div>
          </div>

          <div style={{ background: 'white', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
            <div style={{ fontWeight: '700', color: 'var(--color-navy-900)', fontSize: '0.95rem' }}>
              Veterinary Emergency Triage / ASPCA
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-600)', marginTop: '2px' }}>
              Call <strong>(888) 426-4435</strong> or contact your nearest 24/7 emergency clinic
            </div>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div className="card-title">Core Architectural & Ethical Principles</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            {
              title: '1. Decision-Support, Never Autonomous Diagnosis',
              desc: 'AEGIS AI is engineered strictly as an early warning triage and risk prioritization framework. It does not replace clinical judgment, physical examinations, laboratory diagnostics, or definitive professional diagnoses.'
            },
            {
              title: '2. Human-in-the-Loop Review Architecture',
              desc: 'High-risk and critical alert cases are automatically routed to dedicated review queues where licensed medical, psychological, or veterinary reviewers inspect the evidence, add clinical notes, and confirm next steps.'
            },
            {
              title: '3. Transparent Explainability (XAI)',
              desc: 'Every model output is accompanied by concrete, factor-level attributions (such as SHAP feature contributions and Grad-CAM spatial heatmaps). The platform rejects opaque black-box scoring.'
            },
            {
              title: '4. Non-Stigmatizing & Trauma-Informed Safeguards',
              desc: 'Mental wellness screeners avoid diagnostic psychiatric labeling, and trauma-informed modules permit users to skip questions at will without having to describe traumatic incidents in intrusive detail.'
            },
            {
              title: '5. Pseudonymous Privacy By Design',
              desc: 'Data payloads utilize pseudonymous Subject IDs (e.g. SUBJ-XXXX). Personally identifiable health markers are not stored in browser storage or application server logs.'
            }
          ].map((p, i) => (
            <div key={i} style={{ padding: '14px', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-navy-900)', marginBottom: '4px' }}>
                {p.title}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--color-slate-600)', lineHeight: '1.5' }}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
