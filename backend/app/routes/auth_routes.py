from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app.services.auth_service import AuthService
from backend.app.models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "user")
    ip_addr = request.remote_addr

    resp, status_code = AuthService.register(email, username, password, role=role, ip_address=ip_addr)
    return jsonify(resp), status_code


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    login_identifier = data.get("email") or data.get("username")
    password = data.get("password")
    ip_addr = request.remote_addr

    resp, status_code = AuthService.login(login_identifier, password, ip_address=ip_addr)
    return jsonify(resp), status_code


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    # Client removes JWT token from storage
    return jsonify({"success": True, "message": "Logged out successfully"}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found", "error_code": "NOT_FOUND"}), 404

    return jsonify({"success": True, "data": user.to_dict(include_private=True)}), 200


@auth_bp.route("/profile", methods=["PATCH"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found", "error_code": "NOT_FOUND"}), 404

    data = request.get_json() or {}
    resp, status_code = AuthService.update_profile(user, data)
    return jsonify(resp), status_code
