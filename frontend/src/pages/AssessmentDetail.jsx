import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  ExternalLink,
  Info,
  ChevronRight,
  Eye,
  Activity,
  HeartPulse,
  Brain,
  ShieldCheck,
  Smile,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AssessmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assessment, setAssessment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [assessData, reviewsData] = await Promise.all([
          api.getAssessment(id),
          api.getReviews(id)
        ]);
        setAssessment(assessData);
        setReviews(reviewsData);
      } catch (err) {
        console.error(err);
        setError('Failed to load assessment record.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px 0' }}>Loading assessment explainability record...</div>;
  }

  if (error || !assessment) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <AlertTriangle size={36} color="var(--color-amber-600)" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>Record Not Found</div>
        <p style={{ color: 'var(--color-slate-600)', marginTop: '8px' }}>{error || 'Unable to load record.'}</p>
        <Link to="/assessments" className="btn btn-outline" style={{ marginTop: '16px' }}>
          Back to Assessments
        </Link>
      </div>
    );
  }

  const explanation = assessment.explanation;
  const isReviewerOrAdmin = user && (user.role === 'reviewer' || user.role === 'veterinarian' || user.role === 'admin');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Navigation header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ gap: '6px' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isReviewerOrAdmin && (
            <Link to={`/review-workspace?target=${assessment.id}`} className="btn btn-primary btn-sm">
              <UserCheck size={14} /> Review in Workspace
            </Link>
          )}
          <button onClick={() => window.print()} className="btn btn-outline btn-sm">
            Print Summary
          </button>
        </div>
      </div>

      {/* Main Assessment Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '1.6rem', color: 'var(--color-navy-900)' }}>
                Assessment {assessment.subject_ref}
              </h1>
              <span className={`badge badge-${assessment.risk_level}`}>
                {assessment.risk_level} RISK
              </span>
              <span className={`badge badge-${assessment.status === 'reviewed' ? 'success' : assessment.status === 'pending_review' ? 'warning' : 'gray'}`}>
                {assessment.status.replace('_', ' ')}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)' }}>
              Domain: <strong style={{ color: 'var(--color-slate-700)', textTransform: 'capitalize' }}>{assessment.module_id.replace('_', ' ')}</strong> | Submitted: {new Date(assessment.created_at).toLocaleString()}
            </div>
          </div>

          {/* Confidence Meter */}
          <div style={{ textAlign: 'right', background: 'var(--color-slate-50)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
              Decision Confidence
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-navy-900)' }}>
              {assessment.confidence_score ? `${(assessment.confidence_score * 100).toFixed(0)}%` : 'Pipeline Estimate'}
            </div>
            <div style={{ width: '120px', height: '6px', background: 'var(--color-slate-200)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
              <div
                style={{
                  width: `${(assessment.confidence_score || 0.8) * 100}%`,
                  height: '100%',
                  background: assessment.risk_level === 'urgent' ? 'var(--color-red-600)' : assessment.risk_level === 'high' ? 'var(--color-amber-500)' : 'var(--color-teal-600)'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Outcome Summary Box */}
        <div style={{ marginTop: '20px', padding: '16px', background: assessment.risk_level === 'urgent' ? 'var(--color-red-50)' : 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: assessment.risk_level === 'urgent' ? '1px solid var(--color-red-200)' : '1px solid var(--color-slate-200)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: assessment.risk_level === 'urgent' ? 'var(--color-red-700)' : 'var(--color-slate-600)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Outcome Triage Summary
          </div>
          <div style={{ fontSize: '0.98rem', fontWeight: '600', color: 'var(--color-navy-900)', lineHeight: '1.5' }}>
            {assessment.outcome_summary}
          </div>
        </div>
      </div>

      {/* Explainable AI (XAI) Breakdown */}
      {explanation ? (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Explainable AI (XAI) Attribution Factors</div>
              <div className="card-subtitle">
                Method: <strong>{explanation.explanation_method}</strong> | Model: {explanation.model_name} (v{explanation.model_version})
              </div>
            </div>
            <span className="badge badge-teal">
              {explanation.validation_status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Retinal Fundus Grad-CAM Heatmap Simulation Display */}
          {assessment.module_id === 'retinal_screening' && (
            <div style={{ background: 'var(--color-navy-950)', color: 'white', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                  <Eye size={18} color="var(--color-teal-500)" />
                  Grad-CAM Spatial Attention Map & Lesion Localization
                </div>
                <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                  Demonstration Heatmap
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ position: 'relative', background: '#0F172A', borderRadius: '8px', overflow: 'hidden', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Canvas Fundus Representation */}
                  <svg width="220" height="220" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="#B91C1C" opacity="0.6" />
                    <circle cx="65" cy="100" r="22" fill="#FDE047" opacity="0.8" />
                    <path d="M 65 100 Q 110 70 160 50 M 65 100 Q 120 130 170 150 M 65 100 Q 40 60 20 50" stroke="#7F1D1D" strokeWidth="4" fill="none" />
                    {/* Grad-CAM Heatmap Focal Attention Zones */}
                    <circle cx="130" cy="95" r="28" fill="#EF4444" opacity="0.6" filter="blur(6px)" />
                    <circle cx="135" cy="92" r="14" fill="#F59E0B" opacity="0.8" filter="blur(3px)" />
                  </svg>
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', color: 'white' }}>
                    Focal Activation (Macular Superior-Temporal)
                  </div>
                </div>
                <div style={{ fontSize: '0.84rem', lineHeight: '1.6', color: 'var(--color-slate-300)' }}>
                  <div style={{ fontWeight: '600', color: 'white', marginBottom: '6px' }}>Grad-CAM Interpretability Analysis:</div>
                  <ul style={{ paddingLeft: '18px' }}>
                    <li>Highest model activation concentrated at coordinates <code>(x: 130, y: 95)</code> surrounding foveal avascular zone.</li>
                    <li>Microaneurysm clustering density estimated in upper quartile.</li>
                    <li>Optic nerve cup-to-disc margin preserved without neovascularization.</li>
                    <li style={{ color: 'var(--color-amber-400)', marginTop: '6px' }}>
                      <strong>Clinical Protocol:</strong> Direct ophthalmoscopy required by board-certified retina specialist.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Factor Contribution Horizontal Waterfall List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {explanation.factor_contributions?.map((f, i) => {
              const isIncrease = f.direction === 'increases_risk';
              const isDecrease = f.direction === 'decreases_risk';
              const barColor = isIncrease ? 'var(--color-amber-500)' : isDecrease ? 'var(--color-teal-600)' : 'var(--color-slate-400)';
              const widthPct = Math.min(Math.round(f.weight * 100), 100);

              return (
                <div key={i} style={{ padding: '12px', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-navy-900)' }}>
                      {f.factor}
                    </div>
                    <span
                      className={`badge ${isIncrease ? 'badge-amber' : isDecrease ? 'badge-teal' : 'badge-gray'}`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {f.direction.replace('_', ' ')} (+{(f.weight * 100).toFixed(0)}%)
                    </span>
                  </div>

                  {/* Impact visual bar */}
                  <div style={{ height: '8px', background: 'var(--color-slate-200)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ width: `${widthPct}%`, height: '100%', background: barColor, borderRadius: '4px' }}></div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-600)' }}>
                    {f.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model Limitations Notice */}
          <div style={{ padding: '12px 16px', background: 'var(--color-amber-50)', border: '1px solid var(--color-amber-200)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--color-amber-800)' }}>
            <strong>Model Limitations & Context:</strong> {explanation.limitations}
          </div>

          {explanation.missing_inputs?.length > 0 && (
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
              <strong>Omitted / Missing Data Points:</strong> {explanation.missing_inputs.join(', ')}
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '24px', textAlign: 'center', padding: '24px' }}>
          <Info size={24} color="var(--color-slate-400)" style={{ margin: '0 auto 8px' }} />
          <div>Explanation generation is pending or model is unavailable for this domain.</div>
        </div>
      )}

      {/* Human Reviews History Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title">Human Clinical & Professional Reviews ({reviews.length})</div>
          {isReviewerOrAdmin && (
            <Link to={`/review-workspace?target=${assessment.id}`} className="btn btn-outline btn-sm">
              Add Professional Review
            </Link>
          )}
        </div>

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-slate-500)', fontSize: '0.88rem' }}>
            No clinical review notes recorded yet. {assessment.status === 'pending_review' ? 'This record is awaiting review in the clinical queue.' : 'No follow-up action currently required.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ padding: '16px', background: 'white', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <strong>{r.reviewer_name}</strong> <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>({r.reviewer_role})</span>
                  </div>
                  <span className="badge badge-teal">{r.decision.replace('_', ' ')}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-slate-700)', marginBottom: '8px' }}>
                  {r.notes}
                </div>
                {r.referral_target && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-teal-700)', fontWeight: '600' }}>
                    Referral Initiated: {r.referral_target}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginTop: '8px' }}>
                  Reviewed on: {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw Inputs Summary (Collapsed audit inspection) */}
      <div className="card">
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: '600', color: 'var(--color-slate-700)', fontSize: '0.88rem' }}>
            View Pseudonymous Raw Input Payload (Audit Record)
          </summary>
          <pre style={{ marginTop: '12px', background: 'var(--color-slate-100)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', overflowX: 'auto' }}>
            {JSON.stringify(assessment.raw_inputs, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
