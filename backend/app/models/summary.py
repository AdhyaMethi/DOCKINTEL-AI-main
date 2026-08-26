import uuid
import json
from datetime import datetime, timezone
from backend.app.extensions import db


class DocumentSummary(db.Model):
    __tablename__ = "document_summaries"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = db.Column(db.String(36), db.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    short_summary = db.Column(db.Text, nullable=False)
    detailed_summary = db.Column(db.Text, nullable=False)
    key_points_json = db.Column(db.Text, nullable=False, default="[]")
    provider = db.Column(db.String(50), default="extractive_textrank")  # 'extractive_textrank', 'openai', 'ollama'
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def get_key_points(self) -> list:
        try:
            return json.loads(self.key_points_json) if self.key_points_json else []
        except Exception:
            return []

    def set_key_points(self, points: list):
        self.key_points_json = json.dumps(points, ensure_ascii=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "short_summary": self.short_summary,
            "detailed_summary": self.detailed_summary,
            "key_points": self.get_key_points(),
            "provider": self.provider,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
