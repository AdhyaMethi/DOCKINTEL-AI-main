import uuid
import json
from datetime import datetime, timezone
from backend.app.extensions import db


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    stored_filename = db.Column(db.String(255), nullable=False, unique=True)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # in bytes
    mime_type = db.Column(db.String(100), nullable=False)
    file_extension = db.Column(db.String(20), nullable=False)
    
    # Status: 'uploaded', 'processing', 'completed', 'failed'
    status = db.Column(db.String(50), default="uploaded", nullable=False, index=True)
    
    # Classification: Resume, Invoice, Research Paper, Contract, Report, Certificate, Notes, Manual, General, Unknown
    document_type = db.Column(db.String(50), default="Unknown", nullable=False, index=True)
    classification_confidence = db.Column(db.Float, default=0.0)
    
    page_count = db.Column(db.Integer, default=0)
    total_characters = db.Column(db.Integer, default=0)
    total_words = db.Column(db.Integer, default=0)
    
    raw_text = db.Column(db.Text, nullable=True)
    cleaned_text = db.Column(db.Text, nullable=True)
    
    # Structured JSON metadata (e.g. author, dates, invoice items, resume skills)
    metadata_json = db.Column(db.Text, default="{}")
    
    # OCR flag
    ocr_applied = db.Column(db.Boolean, default=False)
    
    error_message = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    pages = db.relationship("DocumentPage", backref="document", lazy="dynamic", cascade="all, delete-orphan", order_by="DocumentPage.page_number")
    chunks = db.relationship("DocumentChunk", backref="document", lazy="dynamic", cascade="all, delete-orphan", order_by="DocumentChunk.chunk_index")
    entities = db.relationship("DocumentEntity", backref="document", lazy="dynamic", cascade="all, delete-orphan")
    keywords = db.relationship("DocumentKeyword", backref="document", lazy="dynamic", cascade="all, delete-orphan", order_by="DocumentKeyword.score.desc()")
    summary = db.relationship("DocumentSummary", backref="document", uselist=False, cascade="all, delete-orphan")
    jobs = db.relationship("ProcessingJob", backref="document", lazy="dynamic", cascade="all, delete-orphan", order_by="ProcessingJob.started_at.desc()")

    def get_metadata(self) -> dict:
        try:
            return json.loads(self.metadata_json) if self.metadata_json else {}
        except Exception:
            return {}

    def set_metadata(self, data: dict):
        self.metadata_json = json.dumps(data, ensure_ascii=False)

    def to_dict(self, include_text=False) -> dict:
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "original_filename": self.original_filename,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "file_extension": self.file_extension,
            "status": self.status,
            "document_type": self.document_type,
            "classification_confidence": round(self.classification_confidence or 0.0, 2),
            "page_count": self.page_count,
            "total_characters": self.total_characters,
            "total_words": self.total_words,
            "ocr_applied": self.ocr_applied,
            "error_message": self.error_message,
            "metadata": self.get_metadata(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_text:
            data["raw_text"] = self.raw_text
            data["cleaned_text"] = self.cleaned_text
        return data
