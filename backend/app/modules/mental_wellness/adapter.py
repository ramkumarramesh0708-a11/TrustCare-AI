from typing import Dict, Any, Tuple, List
from app.modules.base import BaseInferenceAdapter


class MentalWellnessAdapter(BaseInferenceAdapter):
    module_id = "mental_wellness"
    name = "Mental Wellness & Stress Screener"
    domain = "Psychological Health"
    model_name = "AEGIS-MW-Tabular-v1"
    model_version = "1.2.0-demo"
    validation_status = "synthetic_pipeline_only"
    explanation_method = "SHAP-aligned Feature Contributions"
    limitations = (
        "Demonstration screening instrument based on validated PHQ/GAD-style self-report domains. "
        "Strictly non-diagnostic. Does not diagnose psychological illness or determine fitness for duty."
    )

    def validate_inputs(self, raw_inputs: Dict[str, Any]) -> Tuple[bool, List[str]]:
        errors = []
        if "stress_level" not in raw_inputs:
            errors.append("Stress level (1-10) is required.")
        if "sleep_hours" not in raw_inputs:
            errors.append("Average sleep hours is required.")
        if "functioning_difficulty" not in raw_inputs:
            errors.append("Daily functioning rating is required.")
        return len(errors) == 0, errors

    def infer(self, raw_inputs: Dict[str, Any]) -> Dict[str, Any]:
        stress = float(raw_inputs.get("stress_level", 5))
        sleep_hrs = float(raw_inputs.get("sleep_hours", 7))
        sleep_quality = float(raw_inputs.get("sleep_quality", 3))
        mood = float(raw_inputs.get("mood_rating", 3))
        functioning = float(raw_inputs.get("functioning_difficulty", 2))
        social = float(raw_inputs.get("social_connection", 3))
        crisis_flag = raw_inputs.get("crisis_thoughts", False)

        missing = []
        for key in ["sleep_quality", "mood_rating", "social_connection"]:
            if key not in raw_inputs:
                missing.append(key)

        factor_contributions = []

        # Calculate stress score
        score = 0.0

        # Stress factor
        stress_weight = round((stress - 5) * 0.08, 2)
        score += stress_weight
        factor_contributions.append({
            "factor": "Reported Stress Index",
            "weight": abs(stress_weight),
            "direction": "increases_risk" if stress_weight > 0 else "decreases_risk",
            "description": f"Reported level {stress}/10 represents {'elevated daily pressure' if stress > 5 else 'manageable daily load'}."
        })

        # Sleep factor
        if sleep_hrs < 6.0:
            sleep_weight = round((6.0 - sleep_hrs) * 0.12, 2)
            score += sleep_weight
            factor_contributions.append({
                "factor": "Sleep Deficit",
                "weight": sleep_weight,
                "direction": "increases_risk",
                "description": f"Sleep duration of {sleep_hrs}h/night indicates chronic rest deprivation."
            })
        else:
            factor_contributions.append({
                "factor": "Sleep Adequacy",
                "weight": 0.15,
                "direction": "decreases_risk",
                "description": f"Restorative sleep duration ({sleep_hrs}h) acts as a protective buffer."
            })

        # Functioning difficulty
        func_weight = round((functioning - 1) * 0.07, 2)
        score += func_weight
        factor_contributions.append({
            "factor": "Daily Functioning Strain",
            "weight": abs(func_weight),
            "direction": "increases_risk" if func_weight > 0 else "neutral",
            "description": f"Self-rated strain on day-to-day responsibilities: {functioning}/5."
        })

        # Social support buffer
        if social >= 4:
            factor_contributions.append({
                "factor": "Social Support Protective Factor",
                "weight": 0.20,
                "direction": "decreases_risk",
                "description": "High perceived social connection provides resilience against burnout."
            })

        # Urgency override
        if crisis_flag:
            risk_level = "urgent"
            outcome = "Critical emotional distress flagged. Immediate confidential support and professional connection recommended."
            confidence = 0.94
        elif score > 0.45 or stress >= 8 or functioning >= 4:
            risk_level = "high"
            outcome = "Substantial stress and fatigue markers detected. Proactive confidential counseling referral advised."
            confidence = 0.86
        elif score > 0.15 or stress >= 6:
            risk_level = "moderate"
            outcome = "Moderate occupational and stress strain indicators noted. Self-care and peer check-in suggested."
            confidence = 0.82
        else:
            risk_level = "low"
            outcome = "Indicators currently within balanced resilience ranges. Maintain positive wellness routines."
            confidence = 0.91

        return {
            "outcome_summary": outcome,
            "risk_level": risk_level,
            "confidence_score": confidence,
            "factor_contributions": factor_contributions,
            "missing_inputs": missing,
            "limitations": self.limitations,
            "human_review_recommended": risk_level in ["high", "urgent"],
            "validation_status": self.validation_status,
            "explanation_method": self.explanation_method
        }
