from typing import Dict, Any, Tuple, List
from app.modules.base import BaseInferenceAdapter


class TraumaSupportAdapter(BaseInferenceAdapter):
    module_id = "trauma_support"
    name = "Confidential Trauma-Informed Screening & Navigation"
    domain = "Victim & Complainant Support"
    model_name = "AEGIS-TraumaTriage-v1"
    model_version = "1.0.0-supportive"
    validation_status = "synthetic_pipeline_only"
    explanation_method = "Trauma-Informed Needs Assessment"
    limitations = (
        "Trauma-informed navigation system designed to identify supportive resources and safety priorities. "
        "Strictly non-investigative. Never makes credibility, legal, disciplinary, or evidentiary determinations."
    )

    def validate_inputs(self, raw_inputs: Dict[str, Any]) -> Tuple[bool, List[str]]:
        # In trauma-informed care, no question is strictly mandatory, allowing complete user agency
        return True, []

    def infer(self, raw_inputs: Dict[str, Any]) -> Dict[str, Any]:
        safety_status = raw_inputs.get("safety_status", "not_specified")
        support_preferences = raw_inputs.get("support_preferences", [])
        intrusive_symptoms = raw_inputs.get("intrusive_symptoms", False)
        hyperarousal = raw_inputs.get("hyperarousal_reported", False)
        skipped_count = int(raw_inputs.get("skipped_questions_count", 0))

        factor_contributions = []

        if safety_status == "immediate_danger":
            risk_level = "urgent"
            outcome = (
                "Priority safety resources flagged. Emergency confidential victim advocacy, safe housing, "
                "and crisis helpline connections provided."
            )
            confidence = 0.98
            factor_contributions.append({
                "factor": "Current Physical Safety Status",
                "weight": 0.95,
                "direction": "increases_risk",
                "description": "User reported immediate physical vulnerability requiring urgent discreet safety planning."
            })
        elif safety_status == "partially_safe" or intrusive_symptoms or hyperarousal:
            risk_level = "moderate"
            outcome = (
                "Supportive recovery resources and confidential advocacy options matched to indicated needs."
            )
            confidence = 0.88
            factor_contributions.append({
                "factor": "Symptomatic Stress Markers",
                "weight": 0.50,
                "direction": "increases_risk",
                "description": "Reported acute stress or hyperarousal reactions common after difficult life experiences."
            })
        else:
            risk_level = "low"
            outcome = (
                "General information and self-paced trauma resilience resources available."
            )
            confidence = 0.85
            factor_contributions.append({
                "factor": "Current Stability Indicators",
                "weight": 0.25,
                "direction": "decreases_risk",
                "description": "Immediate acute crisis markers not present; educational and support navigation available."
            })

        if skipped_count > 0:
            factor_contributions.append({
                "factor": "User-Directed Boundaries Preserved",
                "weight": 0.0,
                "direction": "neutral",
                "description": f"User exercised agency by skipping {skipped_count} optional inquiry areas."
            })

        return {
            "outcome_summary": outcome,
            "risk_level": risk_level,
            "confidence_score": confidence,
            "factor_contributions": factor_contributions,
            "missing_inputs": [f"{skipped_count} optional questions skipped by user preference"] if skipped_count else [],
            "limitations": self.limitations,
            "human_review_recommended": risk_level == "urgent",
            "validation_status": self.validation_status,
            "explanation_method": self.explanation_method
        }
