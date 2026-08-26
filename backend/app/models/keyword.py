import uuid
from datetime import datetime, timezone
from backend.app.extensions import db


class DocumentKeyword(db.Model):
    __tablename__ = "document_keywords"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = db.Column(db.String(36), db.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    keyword = db.Column(db.String(100), nullable=False, index=True)
    frequency = db.Column(db.Integer, default=1)
    score = db.Column(db.Float, default=1.0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "keyword": self.keyword,
            "frequency": self.frequency,
            "score": round(self.score or 0.0, 4),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
