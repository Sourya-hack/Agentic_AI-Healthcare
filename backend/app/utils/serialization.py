from __future__ import annotations

import math
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


def make_json_safe(value: Any) -> Any:
    if isinstance(value, (str, int, bool)) or value is None:
        return value
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return value
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, dict):
        return {str(k): make_json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [make_json_safe(item) for item in value]
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, pd.DataFrame):
        return {
            "type": "table",
            "columns": list(value.columns),
            "rows": value.fillna("").to_dict(orient="records"),
        }
    if isinstance(value, pd.Series):
        return value.to_dict()
    return str(value)


def artifact_payload(path: Path, label: str, kind: str) -> dict[str, Any]:
    return {
        "label": label,
        "kind": kind,
        "path": str(path),
        "name": path.name,
    }

