from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from flask import Blueprint, current_app, jsonify, request, send_file
from werkzeug.utils import secure_filename

from app.services.registry import FUNCTION_REGISTRY
from app.utils.serialization import make_json_safe

api = Blueprint("api", __name__)


def _service():
    return current_app.config["service"]


def _jobs():
    return current_app.config["jobs"]


def _state():
    return current_app.config["state"]


def _save_uploads() -> dict[str, str]:
    saved: dict[str, str] = {}
    upload_dir = Path(current_app.config["APP_CONFIG"].uploads_dir)
    for field_name, storage in request.files.items():
        filename = secure_filename(storage.filename or field_name)
        target = upload_dir / filename
        storage.save(target)
        saved[field_name] = str(target)
    return saved


def _coerce_args(tool_meta: dict[str, Any], form_payload: dict[str, Any]) -> dict[str, Any]:
    coerced: dict[str, Any] = {}
<<<<<<< HEAD
    missing_required: list[str] = []
    for param in tool_meta.get("params", []):
        name = param["name"]
        if name not in form_payload or form_payload[name] in ("", None):
            if param.get("required"):
                missing_required.append(name)
=======
    for param in tool_meta.get("params", []):
        name = param["name"]
        if name not in form_payload or form_payload[name] in ("", None):
>>>>>>> b7690b0 (url problem fixed)
            if "default" in param:
                coerced[name] = param["default"]
            continue
        value = form_payload[name]
        param_type = param["type"]
        if param_type == "number":
            coerced[name] = float(value) if "." in str(value) else int(value)
        elif param_type == "boolean":
            coerced[name] = str(value).lower() in {"true", "1", "yes", "on"}
        elif param_type == "json":
            coerced[name] = value if isinstance(value, dict) else json.loads(value)
        else:
            coerced[name] = value
<<<<<<< HEAD
    if missing_required:
        raise ValueError(f"Missing required parameter(s): {', '.join(missing_required)}")
=======
>>>>>>> b7690b0 (url problem fixed)
    return coerced


@api.get("/health")
def health():
    return jsonify(_service().health())


@api.get("/tools")
def tools():
    return jsonify({"tools": FUNCTION_REGISTRY})


@api.get("/history")
def history():
    return jsonify({"items": _state().history.list_entries()})


@api.get("/jobs/<job_id>")
def job_status(job_id: str):
    job = _state().jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(make_json_safe(job))


@api.get("/artifacts")
def artifacts():
    output_dir = Path(current_app.config["APP_CONFIG"].outputs_dir)
    items = []
    for path in sorted(output_dir.glob("*")):
        items.append({"name": path.name, "path": str(path), "size": path.stat().st_size})
    return jsonify({"items": items})


@api.get("/download")
def download():
    path = request.args.get("path")
    if not path:
        return jsonify({"error": "Missing artifact path"}), 400
    return send_file(path, as_attachment=True)


@api.post("/upload")
def upload():
    saved = _save_uploads()
    return jsonify({"files": saved})


@api.post("/execute/<tool_id>")
def execute(tool_id: str):
    tool_meta = next((tool for tool in FUNCTION_REGISTRY if tool["id"] == tool_id), None)
    if tool_meta is None:
        return jsonify({"error": "Tool not found"}), 404
    payload = request.get_json(silent=True) or {}
    uploads = _save_uploads() if request.files else {}
    merged_payload = {**payload, **uploads}
    if request.form:
        merged_payload.update(request.form.to_dict())
<<<<<<< HEAD
    try:
        args = _coerce_args(tool_meta, merged_payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
=======
    args = _coerce_args(tool_meta, merged_payload)
>>>>>>> b7690b0 (url problem fixed)
    handler = getattr(_service(), tool_meta["handler"], None)
    if handler is None:
        # Utility functions live at module level on service object fallback.
        from app.services import notebook_adapter

        handler = getattr(notebook_adapter, tool_meta["handler"])
    if tool_meta.get("async"):
        job_id = _jobs().submit(name=tool_meta["name"], payload=args, func=handler, **args)
        return jsonify({"job_id": job_id, "status": "queued"})
    try:
        result = handler(**args)
        history_item = {
            "tool_id": tool_id,
            "tool_name": tool_meta["name"],
            "payload": args,
            "result": make_json_safe(result),
        }
        _state().history.append(history_item)
        return jsonify({"result": make_json_safe(result)})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400

