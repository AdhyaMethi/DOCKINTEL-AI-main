from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.security.permissions import get_current_user
from backend.app.services.search_service import SearchService
from backend.app.models.search_history import SearchHistory

search_bp = Blueprint("search", __name__, url_prefix="/api/search")


@search_bp.route("", methods=["GET"])
@jwt_required()
def keyword_search():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    query_str = request.args.get("q", "")
    doc_type = request.args.get("type", "")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    res = SearchService.keyword_search(user, query_str, document_type=doc_type, page=page, per_page=per_page)
    return jsonify({"success": True, "data": res}), 200


@search_bp.route("/semantic", methods=["POST"])
@jwt_required()
def semantic_search():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    data = request.get_json() or {}
    query_str = data.get("query", "")
    document_ids = data.get("document_ids", [])
    document_type = data.get("document_type")
    top_k = int(data.get("top_k", 8))
    min_score = float(data.get("min_score", 0.05))

    res = SearchService.semantic_search(
        user=user,
        query=query_str,
        document_ids=document_ids,
        document_type=document_type,
        top_k=top_k,
        min_score=min_score,
    )
    return jsonify({"success": True, "data": res}), 200


@search_bp.route("/history", methods=["GET"])
@jwt_required()
def get_search_history():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    history = SearchHistory.query.filter_by(user_id=user.id).order_by(SearchHistory.created_at.desc()).limit(20).all()
    return jsonify({"success": True, "data": [h.to_dict() for h in history]}), 200
