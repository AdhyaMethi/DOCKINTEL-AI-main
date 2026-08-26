import uuid
import json
from datetime import datetime, timezone
from backend.app.extensions import db


class DocumentChunk(db.Model):
    __tablename__ = "document_chunks"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = db.Column(db.String(36), db.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = db.Column(db.Integer, nullable=True, default=1)
    chunk_index = db.Column(db.Integer, nullable=False)
    text_content = db.Column(db.Text, nullable=False)
    token_count = db.Column(db.Integer, default=0)
    embedding_json = db.Column(db.Text, nullable=True)  # JSON-serialized vector array for SQLite / fallback
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def get_embedding(self) -> list:
        try:
            return json.loads(self.embedding_json) if self.embedding_json else []
        except Exception:
            return []

    def set_embedding(self, embedding_list: list):
        self.embedding_json = json.dumps(embedding_list)

    def to_dict(self, include_embedding=False) -> dict:
        data = {
            "id": self.id,
            "document_id": self.document_id,
            "page_number": self.page_number,
            "chunk_index": self.chunk_index,
            "text_content": self.text_content,
            "token_count": self.token_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_embedding:
            data["embedding"] = self.get_embedding()
        return data
