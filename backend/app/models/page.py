import uuid
from datetime import datetime, timezone
from backend.app.extensions import db


class DocumentPage(db.Model):
    __tablename__ = "document_pages"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = db.Column(db.String(36), db.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = db.Column(db.Integer, nullable=False)
    text_content = db.Column(db.Text, nullable=False)
    char_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "page_number": self.page_number,
            "text_content": self.text_content,
            "char_count": self.char_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
