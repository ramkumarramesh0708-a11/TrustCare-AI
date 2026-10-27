from typing import Dict, List, Optional
from app.modules.base import BaseInferenceAdapter
from app.modules.mental_wellness.adapter import MentalWellnessAdapter
from app.modules.trauma_support.adapter import TraumaSupportAdapter
from app.modules.retinal_screening.adapter import RetinalScreeningAdapter
from app.modules.joint_health.adapter import JointHealthAdapter
from app.modules.cognitive_screening.adapter import CognitiveScreeningAdapter
from app.modules.livestock_health.adapter import LivestockHealthAdapter


class ModuleRegistry:
    def __init__(self):
        self._adapters: Dict[str, BaseInferenceAdapter] = {}
        self._register_defaults()

    def _register_defaults(self):
        adapters = [
            MentalWellnessAdapter(),
            TraumaSupportAdapter(),
            RetinalScreeningAdapter(),
            JointHealthAdapter(),
            CognitiveScreeningAdapter(),
            LivestockHealthAdapter(),
        ]
        for adapter in adapters:
            self._adapters[adapter.module_id] = adapter

    def get(self, module_id: str) -> Optional[BaseInferenceAdapter]:
        return self._adapters.get(module_id)

    def list_all(self) -> List[BaseInferenceAdapter]:
        return list(self._adapters.values())


module_registry = ModuleRegistry()
