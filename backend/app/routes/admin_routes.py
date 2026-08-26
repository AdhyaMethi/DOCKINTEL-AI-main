from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.security.permissions import admin_required, get_current_user
from backend.app.extensions import db
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.models.audit import AuditLog
from backend.app.services.audit_service import AuditService

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/stats", methods=["GET"])
@admin_required()
def get_admin_stats():
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    total_docs = Document.query.count()
    completed_docs = Document.query.filter_by(status="completed").count()
    failed_docs = Document.query.filter_by(status="failed").count()
    processing_docs = Document.query.filter_by(status="processing").count()
    
    total_bytes = db.session.query(db.func.sum(Document.file_size)).scalar() or 0

    return jsonify({
        "success": True,
        "data": {
            "total_users": total_users,
            "active_users": active_users,
            "total_documents": total_docs,
            "completed_documents": completed_docs,
            "failed_documents": failed_docs,
            "processing_documents": processing_docs,
            "total_storage_mb": round(total_bytes / (1024 * 1024), 2),
            "audit_logs_count": AuditLog.query.count(),
        }
    }), 200


@admin_bp.route("/users", methods=["GET"])
@admin_required()
def list_users():
    search = request.args.get("search", "")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 15))

    query = User.query
    if search:
        query = query.filter(User.username.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))

    paginated = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    user_items = []
    for u in paginated.items:
        u_dict = u.to_dict()
        u_dict["document_count"] = u.documents.count()
        user_items.append(u_dict)

    return jsonify({
        "success": True,
        "data": {
            "items": user_items,
            "total": paginated.total,
            "page": paginated.page,
            "per_page": paginated.per_page,
            "pages": paginated.pages,
        }
    }), 200


@admin_bp.route("/users/<user_id>/status", methods=["PATCH"])
@admin_required()
def toggle_user_status(user_id):
    current_admin = get_current_user()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found", "error_code": "NOT_FOUND"}), 404

    if user.id == current_admin.id:
        return jsonify({"success": False, "message": "Cannot deactivate your own administrator account", "error_code": "INVALID_ACTION"}), 400

    data = request.get_json() or {}
    new_status = data.get("is_active", not user.is_active)
    user.is_active = bool(new_status)

    audit = AuditLog(user_id=current_admin.id, action="ADMIN_ACTION", resource_type="USER", resource_id=user.id, ip_address=request.remote_addr)
    audit.set_details({"target_user": user.username, "action": "toggle_status", "is_active": user.is_active})
    db.session.add(audit)
    db.session.commit()

    return jsonify({"success": True, "message": f"User status set to {'Active' if user.is_active else 'Deactivated'}", "data": user.to_dict()}), 200


@admin_bp.route("/users/<user_id>/role", methods=["PATCH"])
@admin_required()
def change_user_role(user_id):
    current_admin = get_current_user()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found", "error_code": "NOT_FOUND"}), 404

    data = request.get_json() or {}
    role = data.get("role")
    if role not in ["user", "admin"]:
        return jsonify({"success": False, "message": "Invalid role. Allowed: 'user', 'admin'", "error_code": "INVALID_ROLE"}), 400

    user.role = role

    audit = AuditLog(user_id=current_admin.id, action="ADMIN_ACTION", resource_type="USER", resource_id=user.id, ip_address=request.remote_addr)
    audit.set_details({"target_user": user.username, "action": "change_role", "new_role": role})
    db.session.add(audit)
    db.session.commit()

    return jsonify({"success": True, "message": f"User role updated to {role}", "data": user.to_dict()}), 200


@admin_bp.route("/audit-logs", methods=["GET"])
@admin_required()
def get_audit_logs():
    action = request.args.get("action", "")
    user_id = request.args.get("user_id", "")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    resp = AuditService.list_logs(action=action, user_id=user_id, page=page, per_page=per_page)
    return jsonify(resp), 200
