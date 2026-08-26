from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from backend.app.security.permissions import get_current_user
from backend.app.services.analytics_service import AnalyticsService

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


@analytics_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_data():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    data = AnalyticsService.get_dashboard_metrics(user)
    return jsonify(data), 200
