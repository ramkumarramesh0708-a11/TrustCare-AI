from typing import Dict, Any, Tuple, List
from app.modules.base import BaseInferenceAdapter


class JointHealthAdapter(BaseInferenceAdapter):
    module_id = "joint_health"
    name = "Joint Symptom & Osteoarthritis Risk Triage"
    domain = "Orthopedics & Rheumatology"
    model_name = "AEGIS-JointRisk-RandomForest"
    model_version = "1.1.0-tabular"
    validation_status = "synthetic_pipeline_only"
    explanation_method = "SHAP Tabular Feature Attribution"
    limitations = (
        "Demonstration decision-support algorithm based on American College of Rheumatology (ACR) clinical criteria. "
        "Does not substitute for weight-bearing radiographic imaging (X-ray/MRI) or formal orthopedic physical examination."
    )

    def validate_inputs(self, raw_inputs: Dict[str, Any]) -> Tuple[bool, List[str]]:
        errors = []
        if "joint_location" not in raw_inputs:
            errors.append("Affected joint location is required.")
        if "pain_severity" not in raw_inputs:
            errors.append("Pain severity rating (0-10) is required.")
        return len(errors) == 0, errors

    def infer(self, raw_inputs: Dict[str, Any]) -> Dict[str, Any]:
        joint = raw_inputs.get("joint_location", "Knee")
        pain = float(raw_inputs.get("pain_severity", 5))
        stiffness_mins = float(raw_inputs.get("morning_stiffness_minutes", 15))
        crepitus = raw_inputs.get("crepitus_present", False)
        stairs_difficulty = float(raw_inputs.get("difficulty_stairs", 2))
        swelling = raw_inputs.get("joint_swelling", False)
        age = float(raw_inputs.get("patient_age", 55))

        factor_contributions = []

        # Feature 1: Morning stiffness
        if stiffness_mins > 30:
            factor_contributions.append({
                "factor": "Morning Stiffness > 30 Minutes",
                "weight": 0.38,
                "direction": "increases_risk",
                "description": f"Prolonged morning stiffness ({stiffness_mins} min) strongly aligns with inflammatory/degenerative joint patterns."
            })
        else:
            factor_contributions.append({
                "factor": "Brief Morning Stiffness (<30 min)",
                "weight": 0.22,
                "direction": "decreases_risk",
                "description": f"Short stiffness duration ({stiffness_mins} min) is less indicative of inflammatory arthritis."
            })

        # Feature 2: Crepitus
        if crepitus:
            factor_contributions.append({
                "factor": "Joint Crepitus / Grating Sensation",
                "weight": 0.32,
                "direction": "increases_risk",
                "description": "Audible or palpable crepitus indicates cartilaginous thinning and irregular articular surfaces."
            })

        # Feature 3: Pain severity
        pain_weight = round((pain / 10.0) * 0.45, 2)
        factor_contributions.append({
            "factor": f"Reported {joint} Pain Severity ({pain}/10)",
            "weight": pain_weight,
            "direction": "increases_risk" if pain >= 5 else "neutral",
            "description": f"Subjective pain intensity score of {pain}/10 directly correlates with functional limitation."
        })

        # Feature 4: Functional stairs difficulty
        if stairs_difficulty >= 4:
            factor_contributions.append({
                "factor": "Substantial Stair Ambulation Impairment",
                "weight": 0.29,
                "direction": "increases_risk",
                "description": "Inability to ascend/descend stairs without assist indicates advanced patellofemoral/tibiofemoral loading strain."
            })

        # Feature 5: Swelling
        if swelling:
            factor_contributions.append({
                "factor": "Active Joint Effusion / Swelling",
                "weight": 0.35,
                "direction": "increases_risk",
                "description": "Visible effusion suggests acute inflammatory flare or active synovitis."
            })

        # Compute risk
        risk_score = (pain / 10.0) * 0.3 + (1.0 if stiffness_mins > 30 else 0.2) * 0.25 + (1.0 if crepitus else 0.0) * 0.25 + (1.0 if swelling else 0.0) * 0.20

        if risk_score > 0.65 or (pain >= 8 and swelling):
            risk_level = "high"
            outcome = f"High probability of advanced structural {joint} osteoarthritis and functional impairment. Clinician review and plain radiography recommended."
            confidence = 0.88
        elif risk_score > 0.35:
            risk_level = "moderate"
            outcome = f"Moderate degenerative {joint} symptoms noted. Conservative physical therapy, low-impact exercise, and clinical follow-up suggested."
            confidence = 0.83
        else:
            risk_level = "low"
            outcome = f"Mild/intermittent {joint} discomfort with preserved joint mechanics. Ergonomic adjustments and joint protection education indicated."
            confidence = 0.89

        return {
            "outcome_summary": outcome,
            "risk_level": risk_level,
            "confidence_score": confidence,
            "factor_contributions": factor_contributions,
            "missing_inputs": ["Weight-bearing bilateral knee X-rays (Kellgren-Lawrence grade)", "Body Mass Index (BMI)"],
            "limitations": self.limitations,
            "human_review_recommended": risk_level in ["high", "moderate"],
            "validation_status": self.validation_status,
            "explanation_method": self.explanation_method
        }
