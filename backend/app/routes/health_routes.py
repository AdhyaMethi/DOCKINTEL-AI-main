import os
from flask import Blueprint, jsonify, current_app
from backend.app.extensions import db
from backend.app.document_processing.ocr_service import OCRExtractor

health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.route("/health", methods=["GET"])
def health_check():
    # Check DB
    db_status = "healthy"
    try:
        db.session.execute(db.text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # Check Storage
    upload_dir = current_app.config.get("UPLOAD_FOLDER", "")
    storage_status = "available" if os.path.exists(upload_dir) else "created_on_demand"

    # Check OCR
    ocr_available = OCRExtractor.is_ocr_available()

    # AI Provider
    ai_provider = current_app.config.get("AI_PROVIDER", "fallback")
    has_openai_key = bool(current_app.config.get("OPENAI_API_KEY", ""))

    return jsonify({
        "status": "online",
        "service": "Intelligent Document Intelligence Platform API",
        "version": "1.0.0",
        "database": db_status,
        "storage": storage_status,
        "ocr_engine": "installed" if ocr_available else "fallback_mode",
        "ai_engine": {
            "mode": ai_provider,
            "external_llm_ready": has_openai_key,
            "fallback_summarizer": "active",
            "fallback_vectorizer": "active",
        }
    }), 200
