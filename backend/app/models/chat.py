import uuid
import json
from datetime import datetime, timezone
from backend.app.extensions import db


class ChatSession(db.Model):
    __tablename__ = "chat_sessions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False, default="New Conversation")
    
    # Optional single document context (or null for multi-document chat)
    document_id = db.Column(db.String(36), db.ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    is_multi_doc = db.Column(db.Boolean, default=False)
    selected_doc_ids_json = db.Column(db.Text, default="[]")
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    messages = db.relationship("ChatMessage", backref="session", lazy="dynamic", cascade="all, delete-orphan", order_by="ChatMessage.created_at.asc()")
    document = db.relationship("Document", foreign_keys=[document_id])

    def get_selected_doc_ids(self) -> list:
        try:
            return json.loads(self.selected_doc_ids_json) if self.selected_doc_ids_json else []
        except Exception:
            return []

    def set_selected_doc_ids(self, ids: list):
        self.selected_doc_ids_json = json.dumps(ids)

    def to_dict(self, include_messages=False) -> dict:
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "document_id": self.document_id,
            "document_title": self.document.title if self.document else None,
            "is_multi_doc": self.is_multi_doc,
            "selected_doc_ids": self.get_selected_doc_ids(),
            "message_count": self.messages.count(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_messages:
            data["messages"] = [m.to_dict() for m in self.messages.all()]
        return data


class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = db.Column(db.String(36), db.ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = db.Column(db.Text, nullable=False)
    
    # Sources / Citations: [{ "document_id": "...", "document_title": "...", "page_number": 3, "excerpt": "...", "score": 0.89 }]
    sources_json = db.Column(db.Text, default="[]")
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    def get_sources(self) -> list:
        try:
            return json.loads(self.sources_json) if self.sources_json else []
        except Exception:
            return []

    def set_sources(self, sources: list):
        self.sources_json = json.dumps(sources, ensure_ascii=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "role": self.role,
            "content": self.content,
            "sources": self.get_sources(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
