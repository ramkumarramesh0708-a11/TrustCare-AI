import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  Brain,
  ShieldCheck,
  Eye,
  Activity,
  Smile,
  HeartPulse,
  AlertCircle,
  Upload,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function AssessmentForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedModule, setSelectedModule] = useState(searchParams.get('module') || 'mental_wellness');
  const [subjectRef, setSubjectRef] = useState(`SUBJ-${Math.floor(1000 + Math.random() * 9000)}`);
  const [consentGiven, setConsentGiven] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form states per domain
  // A. Mental Wellness
  const [mwStress, setMwStress] = useState(6);
  const [mwSleep, setMwSleep] = useState(5.5);
  const [mwSleepQuality, setMwSleepQuality] = useState(3);
  const [mwMood, setMwMood] = useState(3);
  const [mwFunctioning, setMwFunctioning] = useState(3);
  const [mwSocial, setMwSocial] = useState(3);
  const [mwCrisis, setMwCrisis] = useState(false);

  // B. Trauma Support
  const [tsSafety, setTsSafety] = useState('safe_now');
  const [tsSupport, setTsSupport] = useState(['confidential_counseling']);
  const [tsIntrusive, setTsIntrusive] = useState(false);
  const [tsHyperarousal, setTsHyperarousal] = useState(false);
  const [tsSkippedCount, setTsSkippedCount] = useState(0);

  // C. Retinal Screening
  const [retinalEye, setRetinalEye] = useState('Right Eye (OD)');
  const [retinalDuration, setRetinalDuration] = useState(8);
  const [retinalLaser, setRetinalLaser] = useState(false);
  const [retinalFile, setRetinalFile] = useState(null);
  const [retinalPreview, setRetinalPreview] = useState(null);

  // D. Joint Health
  const [jointLocation, setJointLocation] = useState('Knee');
  const [jointPain, setJointPain] = useState(6);
  const [jointStiffness, setJointStiffness] = useState(35);
  const [jointCrepitus, setJointCrepitus] = useState(true);
  const [jointStairs, setJointStairs] = useState(3);
  const [jointSwelling, setJointSwelling] = useState(false);
  const [jointAge, setJointAge] = useState(58);

  // E. Cognitive Screening
  const [cogOrientation, setCogOrientation] = useState(3); // 0-4
  const [cogRecall, setCogRecall] = useState(2); // 0-3
  const [cogDailyMemory, setCogDailyMemory] = useState(true);
  const [cogFinanceChange, setCogFinanceChange] = useState(false);

  // F. Livestock Health
  const [vetSpecies, setVetSpecies] = useState('Cattle');
  const [vetDuration, setVetDuration] = useState(2);
  const [vetAppetite, setVetAppetite] = useState('reduced');
  const [vetFever, setVetFever] = useState(true);
  const [vetRespiratory, setVetRespiratory] = useState(false);
  const [vetDown, setVetDown] = useState(false);
  const [vetHerdCount, setVetHerdCount] = useState(1);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setErrorMessage('Only JPEG and PNG retinal fundus images are supported.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds 10MB limit.');
        return;
      }
      setErrorMessage(null);
      setRetinalFile(file);
      setRetinalPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentGiven) {
      setErrorMessage('Please acknowledge informed consent before proceeding.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    let raw_inputs = {};
    let attachment_data = null;

    if (selectedModule === 'mental_wellness') {
      raw_inputs = {
        stress_level: Number(mwStress),
        sleep_hours: Number(mwSleep),
        sleep_quality: Number(mwSleepQuality),
        mood_rating: Number(mwMood),
        functioning_difficulty: Number(mwFunctioning),
        social_connection: Number(mwSocial),
        crisis_thoughts: Boolean(mwCrisis)
      };
    } else if (selectedModule === 'trauma_support') {
      raw_inputs = {
        safety_status: tsSafety,
        support_preferences: tsSupport,
        intrusive_symptoms: tsIntrusive,
        hyperarousal_reported: tsHyperarousal,
        skipped_questions_count: tsSkippedCount
      };
    } else if (selectedModule === 'retinal_screening') {
      const fileName = retinalFile ? retinalFile.name : 'synthetic_fundus_demo.jpg';
      const fileSize = retinalFile ? retinalFile.size : 1420800;
      raw_inputs = {
        image_filename: fileName,
        image_size_bytes: fileSize,
        eye_side: retinalEye,
        diabetes_duration_years: Number(retinalDuration),
        prior_laser_treatment: Boolean(retinalLaser),
        run_demo_simulation: true
      };
      attachment_data = {
        filename: fileName,
        file_size_bytes: fileSize,
        preview_simulated: true
      };
    } else if (selectedModule === 'joint_health') {
      raw_inputs = {
        joint_location: jointLocation,
        pain_severity: Number(jointPain),
        morning_stiffness_minutes: Number(jointStiffness),
        crepitus_present: Boolean(jointCrepitus),
        difficulty_stairs: Number(jointStairs),
        joint_swelling: Boolean(jointSwelling),
        patient_age: Number(jointAge)
      };
    } else if (selectedModule === 'cognitive_screening') {
      raw_inputs = {
        orientation_score: Number(cogOrientation),
        word_recall_score: Number(cogRecall),
        daily_memory_strain: Boolean(cogDailyMemory),
        financial_management_change: Boolean(cogFinanceChange)
      };
    } else if (selectedModule === 'livestock_health') {
      raw_inputs = {
        animal_species: vetSpecies,
        symptom_duration_days: Number(vetDuration),
        appetite_status: vetAppetite,
        fever_suspected_or_measured: Boolean(vetFever),
        respiratory_distress: Boolean(vetRespiratory),
        severe_lethargy_or_down: Boolean(vetDown),
        herd_affected_count: Number(vetHerdCount)
      };
    }

    try {
      const payload = {
        subject_ref: subjectRef,
        module_id: selectedModule,
        raw_inputs,
        consent_given: consentGiven,
        attachment_data
      };

      const assessment = await api.submitAssessment(payload);
      navigate(`/assessments/${assessment.id}`);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Submission failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-navy-900)' }}>Initiate Risk Assessment</h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.92rem' }}>
          Standardized input protocol routed through explainable domain inference adapters.
        </p>
      </div>

      {errorMessage && (
        <div className="urgent-banner" style={{ marginBottom: '20px' }}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Module Selection */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div className="card-title">1. Select Assessment Domain</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { id: 'mental_wellness', name: 'Mental Wellness', icon: Brain },
              { id: 'trauma_support', name: 'Trauma Support', icon: ShieldCheck },
              { id: 'retinal_screening', name: 'Retinal Screening', icon: Eye },
              { id: 'joint_health', name: 'Joint Health (OA)', icon: Activity },
              { id: 'cognitive_screening', name: 'Cognitive Screening', icon: Smile },
              { id: 'livestock_health', name: 'Livestock Health', icon: HeartPulse }
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = selectedModule === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedModule(m.id)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--color-teal-600)' : '1px solid var(--color-slate-200)',
                    background: isSelected ? 'var(--color-teal-50)' : 'white',
                    color: isSelected ? 'var(--color-teal-700)' : 'var(--color-slate-700)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: isSelected ? '700' : '500',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={20} color={isSelected ? 'var(--color-teal-600)' : 'var(--color-slate-500)'} />
                  <span style={{ fontSize: '0.85rem' }}>{m.name}</span>
                </button>
              );
            })}
          </div>

          {/* Subject Reference & Pseudonym */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Pseudonymous Subject ID</label>
              <input
                type="text"
                className="form-control"
                value={subjectRef}
                onChange={(e) => setSubjectRef(e.target.value)}
                placeholder="e.g. SUBJ-8491"
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                Protected pseudonymous identifier. Do not use patient names or SSN.
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Domain Form Inputs */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div className="card-title">2. Assessment Inquiries & Observations</div>
          </div>

          {/* A. MENTAL WELLNESS */}
          {selectedModule === 'mental_wellness' && (
            <div>
              <div className="disclaimer-banner" style={{ margin: '0 0 20px 0' }}>
                <Info size={18} color="var(--color-teal-600)" />
                <span style={{ fontSize: '0.84rem' }}>
                  <strong>Confidential Screening:</strong> This self-report evaluates stress and burnout markers. It is strictly non-diagnostic and will never classify a respondent as mentally ill.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Perceived Daily Stress Level (1 = Minimal, 10 = Severe Overload): {mwStress}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="form-control"
                  value={mwStress}
                  onChange={(e) => setMwStress(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Average Sleep Hours / Night: {mwSleep}h</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="14"
                    className="form-control"
                    value={mwSleep}
                    onChange={(e) => setMwSleep(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sleep Restfulness Quality (1-5)</label>
                  <select className="form-control" value={mwSleepQuality} onChange={(e) => setMwSleepQuality(e.target.value)}>
                    <option value="1">1 - Very Poor / Fragmented</option>
                    <option value="2">2 - Restless</option>
                    <option value="3">3 - Moderate</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent / Fully Restorative</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Daily Functioning Strain (1 = Normal, 5 = Severe Strain)</label>
                  <select className="form-control" value={mwFunctioning} onChange={(e) => setMwFunctioning(e.target.value)}>
                    <option value="1">1 - Fully Manageable</option>
                    <option value="2">2 - Minor Fatigue</option>
                    <option value="3">3 - Moderate Strain on Duties</option>
                    <option value="4">4 - High Strain</option>
                    <option value="5">5 - Severe Impairment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Social & Peer Support Connection (1-5)</label>
                  <select className="form-control" value={mwSocial} onChange={(e) => setMwSocial(e.target.value)}>
                    <option value="1">1 - Isolated / No Support</option>
                    <option value="2">2 - Limited</option>
                    <option value="3">3 - Adequate</option>
                    <option value="4">4 - Strong Connection</option>
                    <option value="5">5 - Highly Connected / Solid Peer Support</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: '14px', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-navy-900)' }}>
                  <input
                    type="checkbox"
                    checked={mwCrisis}
                    onChange={(e) => setMwCrisis(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Are you experiencing acute thoughts of self-harm or overwhelming personal crisis?</span>
                </label>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '4px', marginLeft: '28px' }}>
                  Checking this immediately prioritizes urgent safety navigation and 24/7 confidential crisis line referrals.
                </div>
              </div>
            </div>
          )}

          {/* B. TRAUMA SUPPORT */}
          {selectedModule === 'trauma_support' && (
            <div>
              <div className="disclaimer-banner" style={{ margin: '0 0 20px 0' }}>
                <ShieldCheck size={18} color="var(--color-teal-600)" />
                <span style={{ fontSize: '0.84rem' }}>
                  <strong>Trauma-Informed Agency:</strong> All questions in this section are completely voluntary. You are never required to describe traumatic incidents in detail. Skip any question freely.
                </span>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Current Physical Safety Feeling</label>
                  <button type="button" onClick={() => setTsSkippedCount(c => c + 1)} className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                    Skip Question
                  </button>
                </div>
                <select className="form-control" value={tsSafety} onChange={(e) => setTsSafety(e.target.value)}>
                  <option value="safe_now">I feel physically safe at this moment</option>
                  <option value="partially_safe">I feel partially safe but have concerns</option>
                  <option value="immediate_danger">I feel in immediate physical danger</option>
                  <option value="not_specified">Prefer not to answer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Support Services You Wish to Explore (Select any):</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'confidential_counseling', label: 'Confidential Emotional Counseling' },
                    { id: 'crisis_shelter', label: 'Discreet Safe Housing / Shelter' },
                    { id: 'legal_advocacy', label: 'Victim Legal Rights & Advocacy' },
                    { id: 'medical_care', label: 'Medical Care & Forensic Navigation' }
                  ].map(item => (
                    <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-slate-200)', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={tsSupport.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) setTsSupport([...tsSupport, item.id]);
                          else setTsSupport(tsSupport.filter(x => x !== item.id));
                        }}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={tsIntrusive}
                    onChange={(e) => setTsIntrusive(e.target.checked)}
                  />
                  <span>Experiencing intrusive memories or nightmares</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={tsHyperarousal}
                    onChange={(e) => setTsHyperarousal(e.target.checked)}
                  />
                  <span>Feeling constantly on guard / hypervigilant</span>
                </label>
              </div>
            </div>
          )}

          {/* C. RETINAL SCREENING */}
          {selectedModule === 'retinal_screening' && (
            <div>
              <div className="disclaimer-banner" style={{ margin: '0 0 20px 0' }}>
                <Eye size={18} color="var(--color-teal-600)" />
                <span style={{ fontSize: '0.84rem' }}>
                  <strong>Medical Imaging Triage:</strong> Upload fundus photographs for microvascular feature localization. Specialist dilated ophthalmoscopy is strictly required for clinical verification.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Upload Fundus Photo (JPEG or PNG, Max 10MB)</label>
                <div style={{ border: '2px dashed var(--color-slate-300)', padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--color-slate-50)' }}>
                  <Upload size={32} color="var(--color-slate-400)" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: '600' }}>
                    {retinalFile ? retinalFile.name : 'Choose a fundus image or drag here'}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    style={{ marginTop: '10px' }}
                  />
                  {retinalPreview && (
                    <div style={{ marginTop: '14px' }}>
                      <img src={retinalPreview} alt="Fundus preview" style={{ maxHeight: '180px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-300)' }} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Examined Eye</label>
                  <select className="form-control" value={retinalEye} onChange={(e) => setRetinalEye(e.target.value)}>
                    <option value="Right Eye (OD)">Right Eye (OD)</option>
                    <option value="Left Eye (OS)">Left Eye (OS)</option>
                    <option value="Both Eyes (OU)">Both Eyes (OU)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Diabetes Duration (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    className="form-control"
                    value={retinalDuration}
                    onChange={(e) => setRetinalDuration(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* D. JOINT HEALTH */}
          {selectedModule === 'joint_health' && (
            <div>
              <div className="disclaimer-banner" style={{ margin: '0 0 20px 0' }}>
                <Activity size={18} color="var(--color-teal-600)" />
                <span style={{ fontSize: '0.84rem' }}>
                  <strong>ACR Orthopedic Criteria:</strong> Stratifies degenerative joint and osteoarthritis symptom severity to guide conservative vs specialist referrals.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Primary Symptomatic Joint</label>
                  <select className="form-control" value={jointLocation} onChange={(e) => setJointLocation(e.target.value)}>
                    <option value="Knee">Knee (Tibiofemoral / Patellofemoral)</option>
                    <option value="Hip">Hip (Coxofemoral)</option>
                    <option value="Hand">Hand / Fingers (DIP / PIP / CMC)</option>
                    <option value="Spine">Spine / Lower Back</option>
                    <option value="Other">Other Joint</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Patient Age: {jointAge}</label>
                  <input
                    type="number"
                    min="18"
                    max="105"
                    className="form-control"
                    value={jointAge}
                    onChange={(e) => setJointAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Joint Pain Severity Scale (0 = None, 10 = Severe Agony): {jointPain}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  className="form-control"
                  value={jointPain}
                  onChange={(e) => setJointPain(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Morning Stiffness Duration (Minutes): {jointStiffness} min</label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    step="5"
                    className="form-control"
                    value={jointStiffness}
                    onChange={(e) => setJointStiffness(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                    &gt; 30 minutes indicates higher inflammatory / ACR involvement.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Difficulty Ascending/Descending Stairs (1-5)</label>
                  <select className="form-control" value={jointStairs} onChange={(e) => setJointStairs(e.target.value)}>
                    <option value="1">1 - No Difficulty</option>
                    <option value="2">2 - Mild Discomfort</option>
                    <option value="3">3 - Moderate Strain / Handrail Required</option>
                    <option value="4">4 - Severe Pain</option>
                    <option value="5">5 - Unable Without Assistance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={jointCrepitus}
                    onChange={(e) => setJointCrepitus(e.target.checked)}
                  />
                  <span>Crepitus present (grating / cracking feeling on motion)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={jointSwelling}
                    onChange={(e) => setJointSwelling(e.target.checked)}
                  />
                  <span>Visible effusion, swelling, or localized heat</span>
                </label>
              </div>
            </div>
          )}

          {/* E. COGNITIVE SCREENING */}
          {selectedModule === 'cognitive_screening' && (
            <div>
              <div className="disclaimer-banner" style={{ margin: '0 0 20px 0' }}>
                <Smile size={18} color="var(--color-teal-600)" />
                <span style={{ fontSize: '0.84rem' }}>
                  <strong>Cognitive Screening Navigator:</strong> Modeled on standardized Mini-Cog screening tasks. Explicitly DOES NOT diagnose dementia or neurological disorder.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Delayed Word Recall Score (0 to 3 words recalled after delay)</label>
                  <select className="form-control" value={cogRecall} onChange={(e) => setCogRecall(e.target.value)}>
                    <option value="3">3 words recalled (Normal episodic retention)</option>
                    <option value="2">2 words recalled (Mild fluctuation)</option>
                    <option value="1">1 word recalled (Vulnerability flagged)</option>
                    <option value="0">0 words recalled (Significant deficit)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Temporal Orientation Score (0 to 4 correct)</label>
                  <select className="form-control" value={cogOrientation} onChange={(e) => setCogOrientation(e.target.value)}>
                    <option value="4">4/4 - Accurate (Year, Season, Month, Location)</option>
                    <option value="3">3/4 - One minor discrepancy</option>
                    <option value="2">2/4 - Moderate disorientation</option>
                    <option value="1">1/4 or 0/4 - Marked disorientation</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={cogDailyMemory}
                    onChange={(e) => setCogDailyMemory(e.target.checked)}
                  />
                  <span>Daily memory lapses reported by subject or family members</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={cogFinanceChange}
                    onChange={(e) => setCogFinanceChange(e.target.checked)}
                  />
                  <span>New difficulty with instrumental tasks (e.g. checkbook, medications, bills)</span>
                </label>
              </div>
            </div>
          )}

          {/* F. LIVESTOCK HEALTH */}
          {selectedModule === 'livestock_health' && (
            <div>
              <div className="disclaimer-banner" style={{ margin: '0 0 20px 0' }}>
                <HeartPulse size={18} color="var(--color-teal-600)" />
                <span style={{ fontSize: '0.84rem' }}>
                  <strong>Veterinary Syndromic Support:</strong> Early warning tool for livestock producers. Strictly NOT a prescription or diagnosis. Immediate contact with a licensed veterinarian is required.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Animal Species</label>
                  <select className="form-control" value={vetSpecies} onChange={(e) => setVetSpecies(e.target.value)}>
                    <option value="Cattle">Cattle (Bovine)</option>
                    <option value="Sheep/Goat">Sheep / Goat (Small Ruminant)</option>
                    <option value="Swine">Swine (Porcine)</option>
                    <option value="Equine">Equine (Horse / Donkey)</option>
                    <option value="Poultry">Poultry (Avian)</option>
                    <option value="Other">Other Livestock</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Symptom Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="form-control"
                    value={vetDuration}
                    onChange={(e) => setVetDuration(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Feed Intake & Appetite</label>
                  <select className="form-control" value={vetAppetite} onChange={(e) => setVetAppetite(e.target.value)}>
                    <option value="normal">Normal feed consumption</option>
                    <option value="reduced">Reduced dry matter intake</option>
                    <option value="completely_off_feed">Completely off feed / Anorexic</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Herd Animals Affected</label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    className="form-control"
                    value={vetHerdCount}
                    onChange={(e) => setVetHerdCount(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={vetFever}
                    onChange={(e) => setVetFever(e.target.checked)}
                  />
                  <span>Pyrexia / Fever suspected</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={vetRespiratory}
                    onChange={(e) => setVetRespiratory(e.target.checked)}
                  />
                  <span>Respiratory distress / cough</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={vetDown}
                    onChange={(e) => setVetDown(e.target.checked)}
                  />
                  <span>Recumbency / Down animal</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Informed Consent & Submission */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input
              type="checkbox"
              id="consentCheckbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }}
              required
            />
            <label htmlFor="consentCheckbox" style={{ fontSize: '0.88rem', color: 'var(--color-slate-700)', cursor: 'pointer' }}>
              <strong>Informed Consent Acknowledgment:</strong> I understand that this screening is powered by AEGIS AI for triage and decision-support purposes. It does not replace a comprehensive examination by a licensed medical, psychological, or veterinary professional. Pseudonymous records are handled under strict confidentiality protocols.
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--color-slate-100)', paddingTop: '16px' }}>
            <button type="button" onClick={() => navigate('/modules')} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ minWidth: '180px' }}>
              {submitting ? 'Analyzing & Routing...' : 'Submit & Analyze'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
