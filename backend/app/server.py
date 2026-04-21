from __future__ import annotations

from flask import Flask
from flask_cors import CORS

from app.api.routes import api
from app.core.config import config
from app.core.jobs import JobRunner
from app.core.state import AppState, HistoryStore
from app.services.notebook_adapter import NotebookService


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.secret_key
    app.config["MAX_CONTENT_LENGTH"] = config.max_content_length
    app.config["APP_CONFIG"] = config
    state = AppState(history=HistoryStore(config.history_path))
    service = NotebookService(state=state)
    jobs = JobRunner(state=state)
    app.config["state"] = state
    app.config["service"] = service
    app.config["jobs"] = jobs
    CORS(app, resources={r"/api/*": {"origins": config.cors_origins.split(",")}})
    app.register_blueprint(api, url_prefix="/api")
    return app

