from typing import Dict, Any, Tuple, List
from app.modules.base import BaseInferenceAdapter


class CognitiveScreeningAdapter(BaseInferenceAdapter):
    module_id = "cognitive_screening"
    name = "Cognitive Screening & Follow-Up Navigator"
    domain = "Neurology & Geriatric Care"
    model_name = "AEGIS-CogTriage-v1"
    model_version = "1.0.4-screening"
    validation_status = "synthetic_pipeline_only"
    explanation_method = "Domain Score Attribution"
    limitations = (
        "Preliminary cognitive screening questionnaire modeled on standardized Mini-Cog / AD8 screening instruments. "
        "Explicitly DOES NOT diagnose dementia, Alzheimer's disease, or any neurological condition. "
        "Transient factors such as acute illness, fatigue, medications, and stress can influence cognitive scores."
    )

    def validate_inputs(self, raw_inputs: Dict[str, Any]) -> Tuple[bool, List[str]]:
        errors = []
        if "word_recall_score" not in raw_inputs:
            errors.append("Delayed 3-word recall score (0-3) is required.")
        if "orientation_score" not in raw_inputs:
            errors.append("Temporal orientation score (0-4) is required.")
        return len(errors) == 0, errors

    def infer(self, raw_inputs: Dict[str, Any]) -> Dict[str, Any]:
        recall = int(raw_inputs.get("word_recall_score", 3))  # 0 to 3
        orientation = int(raw_inputs.get("orientation_score", 4))  # 0 to 4
        daily_memory_strain = raw_inputs.get("daily_memory_strain", False)
        word_finding_difficulty = raw_inputs.get("word_finding_difficulty", False)
        financial_management_change = raw_inputs.get("financial_management_change", False)

        factor_contributions = []

        # Recall evaluation
        if recall <= 1:
            factor_contributions.append({
                "factor": f"Delayed Word Recall Deficit ({recall}/3)",
                "weight": 0.44,
                "direction": "increases_risk",
                "description": f"Recall of {recall} out of 3 standard target words shows short-term retention vulnerability."
            })
        else:
            factor_contributions.append({
                "factor": f"Preserved Word Recall ({recall}/3)",
                "weight": 0.30,
                "direction": "decreases_risk",
                "description": "Intact delayed recall reflects preserved episodic memory consolidation."
            })

        # Orientation
        if orientation < 3:
            factor_contributions.append({
                "factor": f"Temporal Disorientation ({orientation}/4)",
                "weight": 0.35,
                "direction": "increases_risk",
                "description": "Inexact reporting of date, year, or current location warrants clinical attention."
            })

        # Functional daily tasks
        if financial_management_change:
            factor_contributions.append({
                "factor": "Changes in Complex Instrumental Tasks",
                "weight": 0.38,
                "direction": "increases_risk",
                "description": "New difficulty balancing checkbook, paying bills, or organizing medications reported."
            })

        # Score assessment
        if recall == 0 or (recall <= 1 and orientation <= 2) or financial_management_change:
            risk_level = "high"
            outcome = (
                "Screening scores suggest potential cognitive vulnerability requiring comprehensive clinical review. "
                "Referral for formal neuropsychological assessment, metabolic lab workup (B12, TSH), and specialist consultation advised."
            )
            confidence = 0.85
        elif recall == 2 or orientation == 3 or daily_memory_strain:
            risk_level = "moderate"
            outcome = (
                "Mild self-reported memory fluctuations noted. Longitudinal tracking and a 6-month repeat screening recommended."
            )
            confidence = 0.82
        else:
            risk_level = "low"
            outcome = (
                "Cognitive screening indicators fall within expected normative ranges. Continue engaging in regular mental, physical, and social activities."
            )
            confidence = 0.92

        return {
            "outcome_summary": outcome,
            "risk_level": risk_level,
            "confidence_score": confidence,
            "factor_contributions": factor_contributions,
            "missing_inputs": ["Montreal Cognitive Assessment (MoCA) in-person test", "Serum Vitamin B12 and TSH levels", "Brain MRI/CT"],
            "limitations": self.limitations,
            "human_review_recommended": risk_level in ["high", "moderate"],
            "validation_status": self.validation_status,
            "explanation_method": self.explanation_method
        }
