from __future__ import annotations

from concurrent.futures import Future, ThreadPoolExecutor
from typing import Any, Callable

from .state import AppState
from app.utils.serialization import make_json_safe


class JobRunner:
    def __init__(self, state: AppState) -> None:
        self.state = state
        self.executor = ThreadPoolExecutor(max_workers=2)
        self.futures: dict[str, Future[Any]] = {}

    def submit(self, name: str, payload: dict[str, Any], func: Callable[..., dict[str, Any]], **kwargs: Any) -> str:
        job_id = self.state.create_job(name=name, payload=payload)

        def wrapped() -> dict[str, Any]:
            self.state.update_job(job_id, status="running", progress=10)
            try:
                result = func(progress_callback=lambda progress, message=None: self.state.update_job(job_id, progress=progress, message=message), **kwargs)
                self.state.update_job(job_id, status="completed", progress=100, result=result)
                self.state.history.append(
                    {
                        "tool_id": name,
                        "tool_name": name,
                        "payload": payload,
                        "result": make_json_safe(result),
                    }
                )
                return result
            except Exception as exc:  # pragma: no cover - defensive
                self.state.update_job(job_id, status="failed", error=str(exc))
                raise

        self.futures[job_id] = self.executor.submit(wrapped)
        return job_id
