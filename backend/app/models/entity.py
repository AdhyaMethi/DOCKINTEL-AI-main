import uuid
from datetime import datetime, timezone
from backend.app.extensions import db


class DocumentEntity(db.Model):
    __tablename__ = "document_entities"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = db.Column(db.String(36), db.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    # Types: PERSON, ORGANIZATION, DATE, LOCATION, MONEY, EMAIL, PHONE, PRODUCT, TECHNOLOGY
    entity_type = db.Column(db.String(50), nullable=False, index=True)
    entity_value = db.Column(db.String(255), nullable=False, index=True)
    count = db.Column(db.Integer, default=1)
    confidence = db.Column(db.Float, default=1.0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "entity_type": self.entity_type,
            "entity_value": self.entity_value,
            "count": self.count,
            "confidence": round(self.confidence or 1.0, 2),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
