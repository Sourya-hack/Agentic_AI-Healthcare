from __future__ import annotations

import json
import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class HistoryStore:
    path: Path
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def _read(self) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []

    def list_entries(self) -> list[dict[str, Any]]:
        with self._lock:
            return list(reversed(self._read()))

    def append(self, item: dict[str, Any]) -> None:
        with self._lock:
            data = self._read()
            data.append(item)
            self.path.write_text(json.dumps(data, indent=2), encoding="utf-8")


@dataclass
class AppState:
    history: HistoryStore
    runtime: dict[str, Any] = field(default_factory=dict)
    jobs: dict[str, dict[str, Any]] = field(default_factory=dict)
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            return {
                "loaded_keys": sorted(self.runtime.keys()),
                "jobs": list(self.jobs.values()),
            }

    def set_runtime(self, key: str, value: Any) -> None:
        with self._lock:
            self.runtime[key] = value

    def get_runtime(self, key: str, default: Any = None) -> Any:
        with self._lock:
            return self.runtime.get(key, default)

    def create_job(self, name: str, payload: dict[str, Any]) -> str:
        job_id = str(uuid.uuid4())
        with self._lock:
            self.jobs[job_id] = {
                "id": job_id,
                "name": name,
                "status": "queued",
                "created_at": utc_now(),
                "updated_at": utc_now(),
                "progress": 0,
                "payload": payload,
            }
        return job_id

    def update_job(self, job_id: str, **updates: Any) -> None:
        with self._lock:
            job = self.jobs[job_id]
            job.update(updates)
            job["updated_at"] = utc_now()

