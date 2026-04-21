from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path


@dataclass(slots=True)
class AppConfig:
    base_dir: Path = field(default_factory=lambda: Path(__file__).resolve().parents[2])
    storage_dir: Path = field(init=False)
    uploads_dir: Path = field(init=False)
    outputs_dir: Path = field(init=False)
    history_path: Path = field(init=False)
    source_notebook_path: Path = field(init=False)
    secret_key: str = field(default_factory=lambda: os.getenv("SECRET_KEY", "change-me"))
    cors_origins: str = field(default_factory=lambda: os.getenv("CORS_ORIGINS", "*"))
    max_content_length: int = field(default_factory=lambda: int(os.getenv("MAX_CONTENT_LENGTH", 1024 * 1024 * 1024)))
    default_threshold: float = field(default_factory=lambda: float(os.getenv("DEFAULT_THRESHOLD", "0.5")))
    default_device: str = field(default_factory=lambda: os.getenv("DEFAULT_DEVICE", "auto"))
    llm_model_name: str = field(default_factory=lambda: os.getenv("LLM_MODEL_NAME", "mistralai/Mistral-7B-Instruct-v0.2"))

    def __post_init__(self) -> None:
        self.storage_dir = self.base_dir / "storage"
        self.uploads_dir = self.storage_dir / "uploads"
        self.outputs_dir = self.storage_dir / "outputs"
        self.history_path = self.storage_dir / "history.json"
        self.source_notebook_path = self.storage_dir / "source" / "minorproject2.py"
        self.uploads_dir.mkdir(parents=True, exist_ok=True)
        self.outputs_dir.mkdir(parents=True, exist_ok=True)
        self.history_path.parent.mkdir(parents=True, exist_ok=True)


config = AppConfig()

