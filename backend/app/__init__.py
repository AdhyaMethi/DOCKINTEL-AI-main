import os
from flask import Flask, jsonify
from backend.app.config import config_by_name
from backend.app.extensions import db, jwt, bcrypt, cors, migrate
from backend.app.routes import (
    auth_bp,
    document_bp,
    search_bp,
    chat_bp,
    analytics_bp,
    admin_bp,
    health_bp,
)


def create_app(config_name: str = "development") -> Flask:
    """Application factory for the Intelligent Document Intelligence Platform."""
    app = Flask(__name__)
    
    # Load configuration
    env_config = config_by_name.get(config_name.lower(), config_by_name["development"])
    app.config.from_object(env_config)

    # Ensure storage directories exist
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["PROCESSED_FOLDER"], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, origins=app.config.get("CORS_ORIGINS", "*"), supports_credentials=True)
    migrate.init_app(app, db)

    # JWT Error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({
            "success": False,
            "message": "Missing authorization token in request header",
            "error_code": "UNAUTHORIZED",
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({
            "success": False,
            "message": "Invalid or malformed authorization token",
            "error_code": "INVALID_TOKEN",
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({
            "success": False,
            "message": "Authorization token has expired. Please log in again.",
            "error_code": "TOKEN_EXPIRED",
        }), 401

    # Global HTTP Error Handlers
    @app.errorhandler(400)
    def bad_request_error(error):
        return jsonify({"success": False, "message": "Bad request", "error_code": "BAD_REQUEST"}), 400

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"success": False, "message": "Resource not found", "error_code": "NOT_FOUND"}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"success": False, "message": "Method not allowed", "error_code": "METHOD_NOT_ALLOWED"}), 405

    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({"success": False, "message": "File exceeds maximum upload size limit (50MB)", "error_code": "FILE_TOO_LARGE"}), 413

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"success": False, "message": "An internal server error occurred", "error_code": "INTERNAL_SERVER_ERROR"}), 500

    # Register Blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(document_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(admin_bp)

    return app
