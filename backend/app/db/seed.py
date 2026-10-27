from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.module import ScreeningModule
from app.models.model_registry import ModelRegistryEntry
from app.models.assessment import Assessment, AssessmentExplanation
from app.models.alert import Alert
from app.models.review import HumanReview, FollowUpRecord
from app.models.audit import AuditEvent


def seed_database(db: Session = None):
    close_db = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db = True

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains data. Skipping seed.")
            return

        print("Seeding initial TrustCare AI database...")

        # 1. Users
        users = [
            User(
                username="admin",
                email="admin@trustcare.ai",
                full_name="Chief Administrator",
                hashed_password=get_password_hash("admin123"),
                role="admin"
            ),
            User(
                username="dr.chen",
                email="evelyn.chen@trustcare.ai",
                full_name="Dr. Evelyn Chen, MD (Reviewer)",
                hashed_password=get_password_hash("doctor123"),
                role="reviewer"
            ),
            User(
                username="vet.marcus",
                email="marcus.vance@trustcare.ai",
                full_name="Dr. Marcus Vance, DVM (Veterinarian)",
                hashed_password=get_password_hash("vet123"),
                role="veterinarian"
            ),
            User(
                username="officer.john",
                email="john.miller@trustcare.ai",
                full_name="Officer John Miller",
                hashed_password=get_password_hash("user123"),
                role="user"
            ),
        ]
        db.add_all(users)
        db.commit()

        # 2. Modules
        modules = [
            ScreeningModule(
                id="mental_wellness",
                name="Mental Wellness & Stress Screener",
                category="Psychological Health",
                description="Confidential self-assessment measuring occupational stress, burnout, rest adequacy, and functional strain with non-stigmatizing decision support.",
                icon="Brain",
                version="1.2.0",
                requires_file_upload=False,
                disclaimer="Strictly non-diagnostic decision-support demonstration. Does NOT diagnose mental illness or establish fitness-for-duty."
            ),
            ScreeningModule(
                id="trauma_support",
                name="Confidential Trauma-Informed Navigation",
                category="Victim & Complainant Support",
                description="Discreet, agency-centered screening with completely optional questions, safety planning, and referral routing without detailed trauma recounting.",
                icon="ShieldCheck",
                version="1.0.0",
                requires_file_upload=False,
                disclaimer="Trauma-informed resource navigation only. Strictly non-investigative and never renders credibility, disciplinary, or legal judgments."
            ),
            ScreeningModule(
                id="retinal_screening",
                name="Diabetic Retinopathy Image Triage",
                category="Ophthalmology / Imaging",
                description="Upload and analyze retinal fundus images for microvascular indicators and Grad-CAM visual attention zones requiring specialist review.",
                icon="Eye",
                version="0.9.1",
                requires_file_upload=True,
                disclaimer="Experimental screening pipeline. Retinal findings require mandatory dilated examination by a licensed ophthalmologist."
            ),
            ScreeningModule(
                id="joint_health",
                name="Joint Symptom & Osteoarthritis Risk Triage",
                category="Orthopedics & Rheumatology",
                description="Structured assessment evaluating morning stiffness, crepitus, weight-bearing pain, and mobility restrictions for orthopedic triage.",
                icon="Activity",
                version="1.1.0",
                requires_file_upload=False,
                disclaimer="Decision-support tool based on clinical ACR criteria. Does not replace weight-bearing radiographs or formal physical examination."
            ),
            ScreeningModule(
                id="cognitive_screening",
                name="Cognitive Screening & Follow-Up Navigator",
                category="Neurology & Geriatrics",
                description="Sensitive screening workflow capturing recall, temporal orientation, and instrumental functional changes with scheduled follow-up tracking.",
                icon="Smile",
                version="1.0.4",
                requires_file_upload=False,
                disclaimer="Screening instrument modeled on validated cognitive screening tools. DOES NOT diagnose dementia or Alzheimer's disease."
            ),
            ScreeningModule(
                id="livestock_health",
                name="Livestock Early Health Warning & Triage",
                category="Veterinary Health",
                description="Syndromic early-warning system capturing species, appetite, pyrexia, respiratory distress, and herd transmission risks for veterinary triage.",
                icon="HeartPulse",
                version="1.0.2",
                requires_file_upload=False,
                disclaimer="Syndromic decision-support only. Strictly NOT a veterinary diagnosis or prescription. Contact a licensed veterinarian immediately."
            ),
        ]
        db.add_all(modules)
        db.commit()

        # 3. Model Registry Entries
        models = [
            ModelRegistryEntry(
                model_key="trustcare_mw_v1",
                name="TrustCare-MW-Tabular-v1",
                domain="Psychological Health",
                version="1.2.0-demo",
                status="active",
                validation_status="synthetic_pipeline_only",
                intended_use="Occupational stress and burnout triage for first responders and vulnerable personnel.",
                limitations="Self-reported questionnaire. Prone to reporting bias; strictly non-diagnostic.",
                metrics={"auroc": 0.84, "sensitivity": 0.82, "specificity": 0.81, "sample_size": "Synthetic n=1,200"}
            ),
            ModelRegistryEntry(
                model_key="trustcare_trauma_v1",
                name="TrustCare-TraumaTriage-v1",
                domain="Victim & Complainant Support",
                version="1.0.0-supportive",
                status="active",
                validation_status="synthetic_pipeline_only",
                intended_use="Supportive navigation and safety resource matching without intrusive inquiries.",
                limitations="Non-investigative; optional questions allow user omission.",
                metrics={"safety_recall": 0.96, "referral_alignment": 0.91}
            ),
            ModelRegistryEntry(
                model_key="trustcare_retinanet_v09",
                name="TrustCare-RetinaNet-ResNet50",
                domain="Ophthalmology / Medical Imaging",
                version="0.9.1-experimental",
                status="experimental",
                validation_status="synthetic_pipeline_only",
                intended_use="Retinal fundus image microaneurysm and exudate attention zone highlighting via Grad-CAM.",
                limitations="Requires clinical weights certification. Uncalibrated in low light or cataract conditions.",
                metrics={"experimental_sensitivity": 0.89, "experimental_specificity": 0.85}
            ),
            ModelRegistryEntry(
                model_key="trustcare_joint_v1",
                name="TrustCare-JointRisk-RandomForest",
                domain="Orthopedics & Rheumatology",
                version="1.1.0-tabular",
                status="active",
                validation_status="synthetic_pipeline_only",
                intended_use="Knee and hip degenerative symptom risk stratification and physical therapy referral triage.",
                limitations="Does not incorporate radiographic joint space narrowing measurements.",
                metrics={"f1_score": 0.84, "precision": 0.81, "recall": 0.87}
            ),
            ModelRegistryEntry(
                model_key="trustcare_cog_v1",
                name="TrustCare-CogTriage-v1",
                domain="Neurology & Geriatrics",
                version="1.0.4-screening",
                status="active",
                validation_status="synthetic_pipeline_only",
                intended_use="Early flag for memory and executive function changes warranting medical consultation.",
                limitations="Confounded by mood, sleep, acute infections, and sensory impairments.",
                metrics={"screening_sensitivity": 0.88, "screening_specificity": 0.83}
            ),
            ModelRegistryEntry(
                model_key="trustcare_vetsyndrome_v1",
                name="TrustCare-VetSyndrome-v1",
                domain="Veterinary & Herd Health",
                version="1.0.2-decision-support",
                status="active",
                validation_status="synthetic_pipeline_only",
                intended_use="Livestock syndromic cluster analysis to detect contagious respiratory or systemic outbreaks early.",
                limitations="Requires on-site physical vitals and pathology confirmation.",
                metrics={"outbreak_detection_rate": 0.92, "false_alert_rate": 0.08}
            ),
        ]
        db.add_all(models)
        db.commit()

        # 4. Realistic Seed Assessments across domains
        # Seed 1: Mental Wellness (High stress / pending review)
        a1 = Assessment(
            subject_ref="SUBJ-4819",
            module_id="mental_wellness",
            status="pending_review",
            risk_level="high",
            confidence_score=0.86,
            outcome_summary="Substantial stress and fatigue markers detected. Proactive confidential counseling referral advised.",
            raw_inputs={
                "stress_level": 8,
                "sleep_hours": 4.5,
                "sleep_quality": 2,
                "mood_rating": 2,
                "functioning_difficulty": 4,
                "social_connection": 2,
                "crisis_thoughts": False
            },
            created_at=datetime.utcnow() - timedelta(hours=6)
        )
        db.add(a1)
        db.flush()

        exp1 = AssessmentExplanation(
            assessment_id=a1.id,
            model_name="AEGIS-MW-Tabular-v1",
            model_version="1.2.0-demo",
            validation_status="synthetic_pipeline_only",
            explanation_method="SHAP-aligned Feature Contributions",
            factor_contributions=[
                {"factor": "Reported Stress Index", "weight": 0.24, "direction": "increases_risk", "description": "Reported level 8/10 represents elevated daily pressure."},
                {"factor": "Sleep Deficit", "weight": 0.18, "direction": "increases_risk", "description": "Sleep duration of 4.5h/night indicates chronic rest deprivation."},
                {"factor": "Daily Functioning Strain", "weight": 0.21, "direction": "increases_risk", "description": "Self-rated strain on day-to-day responsibilities: 4/5."}
            ],
            limitations="Demonstration screening instrument. Non-diagnostic.",
            missing_inputs=[],
            human_review_recommended=True
        )
        db.add(exp1)

        alert1 = Alert(
            assessment_id=a1.id,
            module_id="mental_wellness",
            alert_type="HIGH_RISK_REVIEW_REQUIRED",
            severity="warning",
            trigger_reason="Elevated stress index (8/10) and severe rest deficit flagged for confidential follow-up.",
            status="active",
            simulated=True,
            created_at=datetime.utcnow() - timedelta(hours=6)
        )
        db.add(alert1)

        # Seed 2: Trauma Support (Urgent safety navigation)
        a2 = Assessment(
            subject_ref="SUBJ-7291",
            module_id="trauma_support",
            status="pending_review",
            risk_level="urgent",
            confidence_score=0.98,
            outcome_summary="Priority safety resources flagged. Emergency confidential victim advocacy, safe housing, and crisis helpline connections provided.",
            raw_inputs={
                "safety_status": "immediate_danger",
                "support_preferences": ["crisis_shelter", "legal_advocacy"],
                "intrusive_symptoms": True,
                "hyperarousal_reported": True,
                "skipped_questions_count": 1
            },
            created_at=datetime.utcnow() - timedelta(hours=3)
        )
        db.add(a2)
        db.flush()

        exp2 = AssessmentExplanation(
            assessment_id=a2.id,
            model_name="AEGIS-TraumaTriage-v1",
            model_version="1.0.0-supportive",
            validation_status="synthetic_pipeline_only",
            explanation_method="Trauma-Informed Needs Assessment",
            factor_contributions=[
                {"factor": "Current Physical Safety Status", "weight": 0.95, "direction": "increases_risk", "description": "User reported immediate physical vulnerability requiring urgent discreet safety planning."},
                {"factor": "Symptomatic Stress Markers", "weight": 0.50, "direction": "increases_risk", "description": "Reported acute stress or hyperarousal reactions common after trauma."}
            ],
            limitations="Non-investigative; never renders legal or credibility determinations.",
            missing_inputs=["1 optional question skipped by user preference"],
            human_review_recommended=True
        )
        db.add(exp2)

        alert2 = Alert(
            assessment_id=a2.id,
            module_id="trauma_support",
            alert_type="CRITICAL_SAFETY_OR_CLINICAL_ALERT",
            severity="critical",
            trigger_reason="Urgent physical vulnerability reported; immediate safety coordination active.",
            status="active",
            simulated=True,
            created_at=datetime.utcnow() - timedelta(hours=3)
        )
        db.add(alert2)

        # Seed 3: Retinal Screening (Moderate with Grad-CAM demonstration)
        a3 = Assessment(
            subject_ref="SUBJ-6104",
            module_id="retinal_screening",
            status="reviewed",
            risk_level="moderate",
            confidence_score=0.79,
            outcome_summary="Demonstration Pipeline Result (Right Eye OD): Moderate non-proliferative changes highlighted by Grad-CAM attention zones. Specialist ophthalmologist examination required.",
            raw_inputs={
                "image_filename": "fundus_sample_OD.jpg",
                "image_size_bytes": 1420800,
                "eye_side": "Right Eye (OD)",
                "diabetes_duration_years": 12,
                "prior_laser_treatment": False
            },
            has_file_attachment=True,
            attachment_metadata={"filename": "fundus_sample_OD.jpg", "file_size_bytes": 1420800, "mime": "image/jpeg"},
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(a3)
        db.flush()

        exp3 = AssessmentExplanation(
            assessment_id=a3.id,
            model_name="AEGIS-RetinaNet-ResNet50",
            model_version="0.9.1-experimental",
            validation_status="synthetic_pipeline_only",
            explanation_method="Grad-CAM Attention Heatmap (Simulated Pipeline)",
            factor_contributions=[
                {"factor": "Foveal & Macular Area Attention", "weight": 0.42, "direction": "increases_risk", "description": "Grad-CAM focal activation observed near the superior-temporal arcade region."},
                {"factor": "Longitudinal Diabetes Duration (>10 yrs)", "weight": 0.28, "direction": "increases_risk", "description": "Long-term metabolic exposure significantly correlates with microvascular lesion risk."},
                {"factor": "Optic Disc Margins", "weight": 0.18, "direction": "neutral", "description": "Optic disc margins appear sharp with clear neuroretinal rim delineation."}
            ],
            limitations="Experimental prototype; not clinically certified by FDA/CE.",
            missing_inputs=["Fluorescein angiography", "Optical Coherence Tomography (OCT)"],
            human_review_recommended=True
        )
        db.add(exp3)

        # Clinician Review for a3
        rev3 = HumanReview(
            assessment_id=a3.id,
            reviewer_id=users[1].id,  # Dr. Chen
            reviewer_name="Dr. Evelyn Chen, MD (Reviewer)",
            reviewer_role="reviewer",
            decision="refer_specialist",
            notes="Grad-CAM highlights microaneurysms in right temporal macula. Patient has 12-year history of Type 2 Diabetes without dilated exam in past 18 months. Immediate referral initiated.",
            recommendations="Dilated ophthalmoscopy and OCT macula scan within 3 weeks.",
            referral_target="Metropolitan Retina Specialists"
        )
        db.add(rev3)

        # Seed 4: Livestock Health (Urgent herd alert)
        a4 = Assessment(
            subject_ref="HERD-B821",
            module_id="livestock_health",
            status="pending_review",
            risk_level="urgent",
            confidence_score=0.90,
            outcome_summary="High-priority veterinary alert (Cattle): Acute syndromic indicators detected. Immediate consultation with a licensed herd veterinarian and quarantine isolation advised.",
            raw_inputs={
                "animal_species": "Cattle",
                "symptom_duration_days": 3,
                "appetite_status": "completely_off_feed",
                "fever_suspected_or_measured": True,
                "respiratory_distress": True,
                "severe_lethargy_or_down": False,
                "herd_affected_count": 6
            },
            created_at=datetime.utcnow() - timedelta(hours=12)
        )
        db.add(a4)
        db.flush()

        exp4 = AssessmentExplanation(
            assessment_id=a4.id,
            model_name="AEGIS-VetSyndrome-v1",
            model_version="1.0.2-decision-support",
            validation_status="synthetic_pipeline_only",
            explanation_method="Syndromic Cluster Weighting",
            factor_contributions=[
                {"factor": "Complete Anorexia / Off Feed", "weight": 0.45, "direction": "increases_risk", "description": "Total refusal of feed indicates acute systemic illness."},
                {"factor": "Multiple Herd Members Affected (n=6)", "weight": 0.35, "direction": "increases_risk", "description": "Cluster presentation raises significant concern for contagious transmission."},
                {"factor": "Pyrexia / Elevated Temperature", "weight": 0.38, "direction": "increases_risk", "description": "Fever response strongly points to infectious bacteriological/viral pathogenesis."}
            ],
            limitations="Strictly NOT a veterinary diagnosis or prescription.",
            missing_inputs=["Rectal temperature (°C)", "Auscultation", "Bacteriological swab"],
            human_review_recommended=True
        )
        db.add(exp4)

        alert4 = Alert(
            assessment_id=a4.id,
            module_id="livestock_health",
            alert_type="CRITICAL_SAFETY_OR_CLINICAL_ALERT",
            severity="critical",
            trigger_reason="Multi-animal herd cluster (n=6) displaying acute respiratory distress and anorexia.",
            status="active",
            simulated=True,
            created_at=datetime.utcnow() - timedelta(hours=12)
        )
        db.add(alert4)

        # Follow-up for a4
        fu4 = FollowUpRecord(
            assessment_id=a4.id,
            due_date=datetime.utcnow() + timedelta(days=1),
            status="pending",
            note="Herd veterinary quarantine inspection and nasal swab PCR sampling.",
            contact_channel="veterinary_on_site"
        )
        db.add(fu4)

        # 5. Initial Audit events
        events = [
            AuditEvent(
                user_id=users[0].id,
                user_role="admin",
                action="SYSTEM_INITIALIZED",
                resource_type="System",
                details={"version": "1.0.0", "modules_count": 6},
                timestamp=datetime.utcnow() - timedelta(days=3)
            ),
            AuditEvent(
                user_id=users[1].id,
                user_role="reviewer",
                action="HUMAN_REVIEW_SUBMITTED",
                resource_type="Assessment",
                resource_id=a3.id,
                details={"decision": "refer_specialist", "target": "Metropolitan Retina Specialists"},
                timestamp=datetime.utcnow() - timedelta(days=2)
            ),
        ]
        db.add_all(events)

        db.commit()
        print("Database seeded successfully with users, modules, models, assessments, and alerts.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_database()
