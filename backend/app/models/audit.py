import uuid
import json
from datetime import datetime, timezone
from backend.app.extensions import db


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    # Actions: 'LOGIN', 'LOGOUT', 'REGISTER', 'UPLOAD', 'DELETE', 'RENAME', 'DOWNLOAD', 'PROCESS', 'ADMIN_ACTION', 'SEARCH', 'CHAT'
    action = db.Column(db.String(50), nullable=False, index=True)
    resource_type = db.Column(db.String(50), nullable=True)  # 'DOCUMENT', 'USER', 'CHAT', 'SYSTEM'
    resource_id = db.Column(db.String(100), nullable=True)
    details_json = db.Column(db.Text, default="{}")
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    def get_details(self) -> dict:
        try:
            return json.loads(self.details_json) if self.details_json else {}
        except Exception:
            return {}

    def set_details(self, details: dict):
        self.details_json = json.dumps(details, ensure_ascii=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.user.username if self.user else "System",
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "details": self.get_details(),
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
