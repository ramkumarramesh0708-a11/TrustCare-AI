from typing import Dict, Any, Tuple, List
from app.modules.base import BaseInferenceAdapter


class LivestockHealthAdapter(BaseInferenceAdapter):
    module_id = "livestock_health"
    name = "Livestock Early Health Warning & Triage"
    domain = "Veterinary & Herd Health"
    model_name = "AEGIS-VetSyndrome-v1"
    model_version = "1.0.2-decision-support"
    validation_status = "synthetic_pipeline_only"
    explanation_method = "Syndromic Cluster Weighting"
    limitations = (
        "Preliminary syndromic decision-support tool for livestock producers and caretakers. "
        "Strictly NOT a veterinary diagnosis or prescription. "
        "Immediate on-site evaluation by a licensed veterinarian is required for confirmation, biosecurity containment, and treatment."
    )

    VALID_SPECIES = ["Cattle", "Sheep/Goat", "Swine", "Equine", "Poultry", "Other"]

    def validate_inputs(self, raw_inputs: Dict[str, Any]) -> Tuple[bool, List[str]]:
        errors = []
        species = raw_inputs.get("animal_species")
        if not species:
            errors.append("Animal species selection is required.")
        elif species not in self.VALID_SPECIES:
            errors.append(f"Invalid species. Must be one of: {', '.join(self.VALID_SPECIES)}")

        if "symptom_duration_days" not in raw_inputs:
            errors.append("Duration of observed symptoms (in days) is required.")

        return len(errors) == 0, errors

    def infer(self, raw_inputs: Dict[str, Any]) -> Dict[str, Any]:
        species = raw_inputs.get("animal_species", "Cattle")
        duration = float(raw_inputs.get("symptom_duration_days", 2))
        appetite = raw_inputs.get("appetite_status", "normal")  # normal, reduced, completely_off_feed
        fever = raw_inputs.get("fever_suspected_or_measured", False)
        respiratory_distress = raw_inputs.get("respiratory_distress", False)
        lethargy = raw_inputs.get("severe_lethargy_or_down", False)
        herd_affected_count = int(raw_inputs.get("herd_affected_count", 1))

        factor_contributions = []

        # Feature 1: Inappetence
        if appetite == "completely_off_feed":
            factor_contributions.append({
                "factor": "Complete Anorexia / Off Feed",
                "weight": 0.45,
                "direction": "increases_risk",
                "description": "Total refusal of feed indicates severe acute systemic illness or gastrointestinal/metabolic crisis."
            })
        elif appetite == "reduced":
            factor_contributions.append({
                "factor": "Reduced Feed Consumption",
                "weight": 0.25,
                "direction": "increases_risk",
                "description": "Decreased dry matter intake frequently precedes overt clinical manifestation."
            })

        # Feature 2: Fever / Systemic
        if fever:
            factor_contributions.append({
                "factor": "Pyrexia / Elevated Body Temperature",
                "weight": 0.38,
                "direction": "increases_risk",
                "description": "Fever response strongly points to infectious bacteriological or viral pathogenesis."
            })

        # Feature 3: Respiratory distress
        if respiratory_distress:
            factor_contributions.append({
                "factor": "Dyspnea / Respiratory Distress",
                "weight": 0.42,
                "direction": "increases_risk",
                "description": "Labored breathing, nasal discharge, or coughing suggests bovine/swine respiratory disease complex."
            })

        # Feature 4: Down animal / acute lethargy
        if lethargy:
            factor_contributions.append({
                "factor": "Recumbency / Inability to Stand",
                "weight": 0.50,
                "direction": "increases_risk",
                "description": "Down animal represents an acute veterinary emergency requiring immediate stabilization."
            })

        # Feature 5: Herd contagiousness
        if herd_affected_count > 1:
            factor_contributions.append({
                "factor": f"Multiple Herd Members Affected (n={herd_affected_count})",
                "weight": 0.35,
                "direction": "increases_risk",
                "description": "Cluster presentation raises significant concern for contagious transmission or shared toxicant/feed contamination."
            })

        # Calculate risk
        if lethargy or (respiratory_distress and fever) or herd_affected_count >= 5:
            risk_level = "urgent"
            outcome = (
                f"High-priority veterinary alert ({species}): Acute syndromic indicators detected. "
                "Immediate consultation with a licensed herd veterinarian and quarantine isolation of affected stock strongly advised."
            )
            confidence = 0.90
        elif fever or respiratory_distress or appetite == "completely_off_feed" or duration >= 3:
            risk_level = "high"
            outcome = (
                f"Elevated health alert ({species}): Clinical symptoms present for {duration} days. "
                "Veterinary examination recommended within 24 hours to prevent deterioration."
            )
            confidence = 0.85
        elif appetite == "reduced":
            risk_level = "moderate"
            outcome = (
                f"Moderate observation alert ({species}): Reduced intake noted. Isolate and monitor vitals (temperature, rumen motility, hydration) every 6 hours."
            )
            confidence = 0.82
        else:
            risk_level = "low"
            outcome = (
                f"Mild or routine observation ({species}): Symptoms do not currently indicate acute systemic distress. Continue standard husbandry and monitoring."
            )
            confidence = 0.88

        return {
            "outcome_summary": outcome,
            "risk_level": risk_level,
            "confidence_score": confidence,
            "factor_contributions": factor_contributions,
            "missing_inputs": ["Rectal temperature measurement (°F/°C)", "Auscultation of thoracic and abdominal quadrants", "Bacteriological/PCR swab panel"],
            "limitations": self.limitations,
            "human_review_recommended": risk_level in ["high", "urgent"],
            "validation_status": self.validation_status,
            "explanation_method": self.explanation_method
        }
