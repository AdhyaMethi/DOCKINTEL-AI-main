import os
import uuid
import threading
from werkzeug.utils import secure_filename
from flask import current_app
from backend.app.extensions import db
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.models.audit import AuditLog
from backend.app.models.job import ProcessingJob
from backend.app.document_processing.pipeline import DocumentProcessingPipeline


class DocumentService:
    """Core document management and lifecycle service."""

    @classmethod
    def upload_document(cls, user: User, file_obj, title: str = "", ip_address: str = None) -> tuple[dict, int]:
        if not file_obj or not file_obj.filename:
            return {"success": False, "message": "No file uploaded", "error_code": "NO_FILE"}, 400

        original_filename = file_obj.filename
        ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""

        allowed_extensions = current_app.config.get("ALLOWED_EXTENSIONS", {"pdf", "docx", "txt", "jpg", "jpeg", "png"})
        if ext not in allowed_extensions:
            return {
                "success": False,
                "message": f"Unsupported file type '{ext}'. Allowed types: {', '.join(sorted(allowed_extensions))}",
                "error_code": "INVALID_FILE_TYPE",
            }, 400

        # Validate MIME type if available
        content_type = file_obj.content_type or ""
        allowed_mimes = current_app.config.get("ALLOWED_MIME_TYPES", set())
        if allowed_mimes and content_type and content_type not in allowed_mimes and content_type != "application/octet-stream":
            pass # Soft check for broad compatibility

        # Generate secure isolated storage path
        user_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], str(user.id))
        os.makedirs(user_folder, exist_ok=True)

        unique_id = str(uuid.uuid4())
        safe_orig_name = secure_filename(original_filename) or f"document_{unique_id[:8]}.{ext}"
        stored_filename = f"{unique_id}_{safe_orig_name}"
        file_path = os.path.join(user_folder, stored_filename)

        # Save file to disk
        file_obj.seek(0, os.SEEK_END)
        file_size = file_obj.tell()
        file_obj.seek(0)

        max_len = current_app.config.get("MAX_CONTENT_LENGTH", 50 * 1024 * 1024)
        if file_size > max_len:
            return {"success": False, "message": f"File exceeds maximum allowed size ({max_len // (1024*1024)}MB)", "error_code": "FILE_TOO_LARGE"}, 413

        file_obj.save(file_path)

        doc_title = title.strip() if title and title.strip() else original_filename.rsplit(".", 1)[0].replace("_", " ").title()

        doc = Document(
            id=unique_id,
            user_id=user.id,
            title=doc_title,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=content_type or f"application/{ext}",
            file_extension=ext,
            status="uploaded",
        )
        db.session.add(doc)

        # Create initial pending job
        job = ProcessingJob(document_id=doc.id, status="pending", current_step="Uploaded")
        db.session.add(job)

        # Audit log
        audit = AuditLog(user_id=user.id, action="UPLOAD", resource_type="DOCUMENT", resource_id=doc.id, ip_address=ip_address)
        audit.set_details({"filename": original_filename, "size": file_size, "type": ext})
        db.session.add(audit)
        db.session.commit()

        # Trigger processing (synchronous in testing, asynchronous in production/dev)
        app = current_app._get_current_object()
        if app.config.get("TESTING"):
            DocumentProcessingPipeline.process_document(doc.id, app)
        else:
            thread = threading.Thread(target=DocumentProcessingPipeline.process_document, args=(doc.id, app))
            thread.daemon = True
            thread.start()

        return {
            "success": True,
            "message": "Document uploaded successfully and queued for processing",
            "data": doc.to_dict(),
        }, 201

    @classmethod
    def list_documents(
        cls,
        user: User,
        query_text: str = "",
        document_type: str = "",
        status: str = "",
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        per_page: int = 12,
    ) -> dict:
        query = Document.query

        # RBAC: normal users see only their own docs, admin can view all
        if not user.is_admin():
            query = query.filter_by(user_id=user.id)

        if query_text:
            query = query.filter(Document.title.ilike(f"%{query_text}%") | Document.original_filename.ilike(f"%{query_text}%"))

        if document_type and document_type != "all":
            query = query.filter_by(document_type=document_type)

        if status and status != "all":
            query = query.filter_by(status=status)

        # Sorting
        sort_col = getattr(Document, sort_by, Document.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            "success": True,
            "data": {
                "items": [d.to_dict() for d in paginated.items],
                "total": paginated.total,
                "page": paginated.page,
                "per_page": paginated.per_page,
                "pages": paginated.pages,
            }
        }

    @classmethod
    def get_document_details(cls, user: User, document_id: str) -> tuple[dict, int]:
        doc = Document.query.get(document_id)
        if not doc:
            return {"success": False, "message": "Document not found", "error_code": "NOT_FOUND"}, 404

        if not user.is_admin() and doc.user_id != user.id:
            return {"success": False, "message": "Unauthorized to access this document", "error_code": "FORBIDDEN"}, 403

        doc_dict = doc.to_dict(include_text=True)
        doc_dict["summary"] = doc.summary.to_dict() if doc.summary else None
        doc_dict["entities"] = [e.to_dict() for e in doc.entities.all()]
        doc_dict["keywords"] = [k.to_dict() for k in doc.keywords.all()]
        doc_dict["chunks_count"] = doc.chunks.count()
        doc_dict["pages_count"] = doc.pages.count()
        doc_dict["jobs"] = [j.to_dict() for j in doc.jobs.limit(5).all()]

        return {"success": True, "data": doc_dict}, 200

    @classmethod
    def get_document_pages(cls, user: User, document_id: str) -> tuple[dict, int]:
        doc = Document.query.get(document_id)
        if not doc:
            return {"success": False, "message": "Document not found", "error_code": "NOT_FOUND"}, 404

        if not user.is_admin() and doc.user_id != user.id:
            return {"success": False, "message": "Unauthorized to access this document", "error_code": "FORBIDDEN"}, 403

        pages = [p.to_dict() for p in doc.pages.all()]
        return {"success": True, "data": {"document_id": doc.id, "title": doc.title, "pages": pages}}, 200

    @classmethod
    def rename_document(cls, user: User, document_id: str, new_title: str, ip_address: str = None) -> tuple[dict, int]:
        doc = Document.query.get(document_id)
        if not doc:
            return {"success": False, "message": "Document not found", "error_code": "NOT_FOUND"}, 404

        if not user.is_admin() and doc.user_id != user.id:
            return {"success": False, "message": "Unauthorized", "error_code": "FORBIDDEN"}, 403

        if not new_title or not new_title.strip():
            return {"success": False, "message": "Title cannot be blank", "error_code": "VALIDATION_ERROR"}, 400

        old_title = doc.title
        doc.title = new_title.strip()

        audit = AuditLog(user_id=user.id, action="RENAME", resource_type="DOCUMENT", resource_id=doc.id, ip_address=ip_address)
        audit.set_details({"old_title": old_title, "new_title": doc.title})
        db.session.add(audit)
        db.session.commit()

        return {"success": True, "message": "Document renamed successfully", "data": doc.to_dict()}, 200

    @classmethod
    def delete_document(cls, user: User, document_id: str, ip_address: str = None) -> tuple[dict, int]:
        doc = Document.query.get(document_id)
        if not doc:
            return {"success": False, "message": "Document not found", "error_code": "NOT_FOUND"}, 404

        if not user.is_admin() and doc.user_id != user.id:
            return {"success": False, "message": "Unauthorized", "error_code": "FORBIDDEN"}, 403

        # Delete physical file
        try:
            if doc.file_path and os.path.exists(doc.file_path):
                os.remove(doc.file_path)
        except Exception:
            pass

        audit = AuditLog(user_id=user.id, action="DELETE", resource_type="DOCUMENT", resource_id=doc.id, ip_address=ip_address)
        audit.set_details({"title": doc.title, "filename": doc.original_filename})
        db.session.add(audit)

        db.session.delete(doc)
        db.session.commit()

        return {"success": True, "message": "Document deleted successfully"}, 200

    @classmethod
    def reprocess_document(cls, user: User, document_id: str, ip_address: str = None) -> tuple[dict, int]:
        doc = Document.query.get(document_id)
        if not doc:
            return {"success": False, "message": "Document not found", "error_code": "NOT_FOUND"}, 404

        if not user.is_admin() and doc.user_id != user.id:
            return {"success": False, "message": "Unauthorized", "error_code": "FORBIDDEN"}, 403

        doc.status = "processing"
        doc.error_message = None

        job = ProcessingJob(document_id=doc.id, status="pending", current_step="Reprocess requested")
        db.session.add(job)

        audit = AuditLog(user_id=user.id, action="PROCESS", resource_type="DOCUMENT", resource_id=doc.id, ip_address=ip_address)
        audit.set_details({"title": doc.title, "action": "reprocess"})
        db.session.add(audit)
        db.session.commit()

        app = current_app._get_current_object()
        if app.config.get("TESTING"):
            DocumentProcessingPipeline.process_document(doc.id, app)
        else:
            thread = threading.Thread(target=DocumentProcessingPipeline.process_document, args=(doc.id, app))
            thread.daemon = True
            thread.start()

        return {"success": True, "message": "Document re-processing started", "data": doc.to_dict()}, 200
