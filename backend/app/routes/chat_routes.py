from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.security.permissions import get_current_user
from backend.app.services.chat_service import ChatService

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")


@chat_bp.route("/sessions", methods=["POST"])
@jwt_required()
def create_session():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    data = request.get_json() or {}
    title = data.get("title", "")
    document_id = data.get("document_id")
    is_multi_doc = data.get("is_multi_doc", False)
    selected_doc_ids = data.get("selected_doc_ids", [])

    resp, status_code = ChatService.create_session(
        user=user,
        title=title,
        document_id=document_id,
        is_multi_doc=is_multi_doc,
        selected_doc_ids=selected_doc_ids,
    )
    return jsonify(resp), status_code


@chat_bp.route("/sessions", methods=["GET"])
@jwt_required()
def list_sessions():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    resp = ChatService.list_sessions(user)
    return jsonify(resp), 200


@chat_bp.route("/sessions/<session_id>", methods=["GET"])
@jwt_required()
def get_session(session_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    resp, status_code = ChatService.get_session(user, session_id)
    return jsonify(resp), status_code


@chat_bp.route("/sessions/<session_id>/messages", methods=["POST"])
@jwt_required()
def send_message(session_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    data = request.get_json() or {}
    content = data.get("content", "")

    resp, status_code = ChatService.send_message(user, session_id, content)
    return jsonify(resp), status_code


@chat_bp.route("/sessions/<session_id>", methods=["DELETE"])
@jwt_required()
def delete_session(session_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    resp, status_code = ChatService.delete_session(user, session_id)
    return jsonify(resp), status_code
