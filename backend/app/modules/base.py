from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, List, Optional


class BaseInferenceAdapter(ABC):
    module_id: str
    name: str
    domain: str
    model_name: str
    model_version: str
    validation_status: str  # clinical_validated, pilot_study, synthetic_pipeline_only, not_validated, unavailable
    explanation_method: str  # SHAP, Grad-CAM, Feature Contribution, Rule Weighting, Unavailable
    limitations: str

    @abstractmethod
    def validate_inputs(self, raw_inputs: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate input payload and return (is_valid, error_messages)."""
        pass

    @abstractmethod
    def infer(self, raw_inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run inference or structured rule-evaluation.
        Returns:
        {
            "outcome_summary": str,
            "risk_level": str,  # low, moderate, high, urgent, indeterminate
            "confidence_score": Optional[float],
            "factor_contributions": List[Dict[str, Any]],
            "missing_inputs": List[str],
            "limitations": str,
            "human_review_recommended": bool,
            "validation_status": str,
            "explanation_method": str
        }
        """
        pass
