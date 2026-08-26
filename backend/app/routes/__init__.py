from backend.app.routes.auth_routes import auth_bp
from backend.app.routes.document_routes import document_bp
from backend.app.routes.search_routes import search_bp
from backend.app.routes.chat_routes import chat_bp
from backend.app.routes.analytics_routes import analytics_bp
from backend.app.routes.admin_routes import admin_bp
from backend.app.routes.health_routes import health_bp

__all__ = [
    "auth_bp",
    "document_bp",
    "search_bp",
    "chat_bp",
    "analytics_bp",
    "admin_bp",
    "health_bp",
]
