import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { UserCheck, Clock, CheckCircle, AlertTriangle, ArrowRight, FileText, Send, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReviewWorkspace() {
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('target');
  const { user } = useAuth();

  const [queue, setQueue] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Review Form
  const [decision, setDecision] = useState('concur');
  const [notes, setNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [referralTarget, setReferralTarget] = useState('');

  const fetchQueue = async () => {
    setLoadingQueue(true);
    try {
      const pending = await api.getAssessments({ status: 'pending_review', limit: 30 });
      setQueue(pending);

      // Select target or first in queue
      if (targetId) {
        const full = await api.getAssessment(targetId);
        setSelectedAssessment(full);
      } else if (pending.length > 0) {
        const full = await api.getAssessment(pending[0].id);
        setSelectedAssessment(full);
      } else {
        // Fallback to recent assessments if queue is empty
        const allRecent = await api.getAssessments({ limit: 10 });
        if (allRecent.length > 0) {
          const full = await api.getAssessment(allRecent[0].id);
          setSelectedAssessment(full);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [targetId]);

  const handleSelectAssessment = async (id) => {
    try {
      const full = await api.getAssessment(id);
      setSelectedAssessment(full);
      setSuccessMessage(null);
      setNotes('');
      setRecommendations('');
      setReferralTarget('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    if (!notes.trim()) {
      alert('Professional review notes are required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitReview({
        assessment_id: selectedAssessment.id,
        decision,
        notes,
        recommendations,
        referral_target: referralTarget
      });

      setSuccessMessage(`Professional review successfully recorded for ${selectedAssessment.subject_ref}. Assessment status updated.`);
      // Refresh assessment and queue
      const updated = await api.getAssessment(selectedAssessment.id);
      setSelectedAssessment(updated);
      fetchQueue();
    } catch (err) {
      console.error(err);
      alert('Review submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-navy-900)' }}>Human Review Workspace</h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.92rem' }}>
          Authorized clinical and specialist review desk for verifying AI-assisted triage decisions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left Column: Review Queue */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-navy-900)' }}>
              Queue ({queue.length})
            </span>
            <button onClick={fetchQueue} className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
              Refresh
            </button>
          </div>

          {loadingQueue ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-slate-500)', fontSize: '0.85rem' }}>
              Loading queue...
            </div>
          ) : queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-slate-500)', fontSize: '0.85rem' }}>
              No pending reviews in queue! All high-priority assessments verified.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
              {queue.map((item) => {
                const isSelected = selectedAssessment?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectAssessment(item.id)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-teal-600)' : '1px solid var(--color-slate-200)',
                      background: isSelected ? 'var(--color-teal-50)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--color-navy-900)' }}>{item.subject_ref}</strong>
                      <span className={`badge badge-${item.risk_level}`} style={{ fontSize: '0.68rem' }}>
                        {item.risk_level}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)', textTransform: 'capitalize' }}>
                      {item.module_id.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-slate-400)', marginTop: '4px' }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Workbench */}
        {selectedAssessment ? (
          <div>
            {successMessage && (
              <div style={{ background: 'var(--color-teal-50)', border: '1px solid var(--color-teal-200)', color: 'var(--color-teal-800)', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} color="var(--color-teal-600)" />
                <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{successMessage}</span>
              </div>
            )}

            {/* Assessment Details & AI Factors Card */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', color: 'var(--color-navy-900)' }}>
                    {selectedAssessment.subject_ref} — {selectedAssessment.module_id.replace('_', ' ').toUpperCase()}
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                    Current Status: <strong style={{ textTransform: 'capitalize' }}>{selectedAssessment.status.replace('_', ' ')}</strong> | Risk: <strong style={{ textTransform: 'uppercase' }}>{selectedAssessment.risk_level}</strong>
                  </div>
                </div>
                <Link to={`/assessments/${selectedAssessment.id}`} className="btn btn-outline btn-sm">
                  View Full Record <ArrowRight size={14} />
                </Link>
              </div>

              <div style={{ padding: '14px', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.88rem', color: 'var(--color-slate-800)' }}>
                <strong>Automated Triage Outcome:</strong> {selectedAssessment.outcome_summary}
              </div>

              {/* Attribution Factors Preview */}
              {selectedAssessment.explanation?.factor_contributions && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-slate-600)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Top Influencing Factors (Explainable AI Engine)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedAssessment.explanation.factor_contributions.slice(0, 3).map((f, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-slate-200)', fontSize: '0.82rem' }}>
                        <span>{f.factor}: {f.description}</span>
                        <span className={`badge ${f.direction === 'increases_risk' ? 'badge-amber' : 'badge-teal'}`}>
                          {f.direction.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clinical Decision & Note Editor */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Record Qualified Review & Action Plan</div>
                <span className="badge badge-teal">
                  Reviewer: {user?.full_name || 'Authorized Reviewer'}
                </span>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Review Decision</label>
                  <select className="form-control" value={decision} onChange={(e) => setDecision(e.target.value)}>
                    <option value="concur">Concur with AI Triage Classification</option>
                    <option value="modify">Modify Risk Stratification / Divergent Clinical Finding</option>
                    <option value="refer_specialist">Refer to Specialist (Ophthalmology, Ortho, Psych, Vet)</option>
                    <option value="request_followup">Schedule Mandatory Follow-Up Check-In</option>
                    <option value="closed">Close Case (No Further Action Required)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Professional Clinical Notes (Required)</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Enter objective clinical rationale, observations, and assessment concurrence/deviation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Care Recommendations / Instructions</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Low-impact physical therapy, sleep hygiene protocol"
                      value={recommendations}
                      onChange={(e) => setRecommendations(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Referral Target / Facility</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. St. Jude Eye Institute, County Vet Lab"
                      value={referralTarget}
                      onChange={(e) => setReferralTarget(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-slate-100)', paddingTop: '16px', marginTop: '16px' }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary" style={{ minWidth: '180px' }}>
                    <Send size={16} /> {submitting ? 'Submitting Review...' : 'Submit Professional Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-slate-500)' }}>
            Select an assessment from the queue on the left to review.
          </div>
        )}
      </div>
    </div>
  );
}
