import os
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required
from backend.app.security.permissions import get_current_user
from backend.app.services.document_service import DocumentService
from backend.app.services.comparison_service import ComparisonService
from backend.app.models.document import Document

document_bp = Blueprint("documents", __name__, url_prefix="/api/documents")


@document_bp.route("", methods=["POST"])
@jwt_required()
def upload_document():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file part in request", "error_code": "NO_FILE"}), 400

    file_obj = request.files["file"]
    title = request.form.get("title", "")
    ip_addr = request.remote_addr

    resp, status_code = DocumentService.upload_document(user, file_obj, title=title, ip_address=ip_addr)
    return jsonify(resp), status_code


@document_bp.route("", methods=["GET"])
@jwt_required()
def list_documents():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    query_text = request.args.get("q", "")
    doc_type = request.args.get("type", "")
    status = request.args.get("status", "")
    sort_by = request.args.get("sort_by", "created_at")
    sort_order = request.args.get("order", "desc")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 12))

    resp = DocumentService.list_documents(
        user=user,
        query_text=query_text,
        document_type=doc_type,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        per_page=per_page,
    )
    return jsonify(resp), 200


@document_bp.route("/<document_id>", methods=["GET"])
@jwt_required()
def get_document(document_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    resp, status_code = DocumentService.get_document_details(user, document_id)
    return jsonify(resp), status_code


@document_bp.route("/<document_id>/pages", methods=["GET"])
@jwt_required()
def get_document_pages(document_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    resp, status_code = DocumentService.get_document_pages(user, document_id)
    return jsonify(resp), status_code


@document_bp.route("/<document_id>/download", methods=["GET"])
@jwt_required()
def download_document(document_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    doc = Document.query.get(document_id)
    if not doc:
        return jsonify({"success": False, "message": "Document not found", "error_code": "NOT_FOUND"}), 404

    if not user.is_admin() and doc.user_id != user.id:
        return jsonify({"success": False, "message": "Forbidden", "error_code": "FORBIDDEN"}), 403

    if not doc.file_path or not os.path.exists(doc.file_path):
        return jsonify({"success": False, "message": "File not found on storage", "error_code": "FILE_NOT_FOUND"}), 404

    return send_file(
        doc.file_path,
        as_attachment=True,
        download_name=doc.original_filename,
        mimetype=doc.mime_type,
    )


@document_bp.route("/<document_id>", methods=["PATCH"])
@jwt_required()
def rename_document(document_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    data = request.get_json() or {}
    new_title = data.get("title", "")
    ip_addr = request.remote_addr

    resp, status_code = DocumentService.rename_document(user, document_id, new_title, ip_address=ip_addr)
    return jsonify(resp), status_code


@document_bp.route("/<document_id>", methods=["DELETE"])
@jwt_required()
def delete_document(document_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    ip_addr = request.remote_addr
    resp, status_code = DocumentService.delete_document(user, document_id, ip_address=ip_addr)
    return jsonify(resp), status_code


@document_bp.route("/<document_id>/process", methods=["POST"])
@jwt_required()
def process_document(document_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    ip_addr = request.remote_addr
    resp, status_code = DocumentService.reprocess_document(user, document_id, ip_address=ip_addr)
    return jsonify(resp), status_code


@document_bp.route("/<document_id>/status", methods=["GET"])
@jwt_required()
def get_document_status(document_id):
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    doc = Document.query.get(document_id)
    if not doc:
        return jsonify({"success": False, "message": "Document not found", "error_code": "NOT_FOUND"}), 404

    latest_job = doc.jobs.first()
    return jsonify({
        "success": True,
        "data": {
            "document_id": doc.id,
            "status": doc.status,
            "error_message": doc.error_message,
            "job": latest_job.to_dict() if latest_job else None,
        }
    }), 200


@document_bp.route("/compare", methods=["POST"])
@jwt_required()
def compare_documents():
    user = get_current_user()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized", "error_code": "UNAUTHORIZED"}), 401

    data = request.get_json() or {}
    doc_id_a = data.get("document_id_a")
    doc_id_b = data.get("document_id_b")

    if not doc_id_a or not doc_id_b:
        return jsonify({"success": False, "message": "Both document_id_a and document_id_b are required", "error_code": "VALIDATION_ERROR"}), 400

    resp, status_code = ComparisonService.compare_documents(user, doc_id_a, doc_id_b)
    return jsonify(resp), status_code
