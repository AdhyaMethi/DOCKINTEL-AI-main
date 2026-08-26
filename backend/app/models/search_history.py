import uuid
import json
from datetime import datetime, timezone
from backend.app.extensions import db


class SearchHistory(db.Model):
    __tablename__ = "search_history"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query = db.Column(db.String(500), nullable=False)
    search_type = db.Column(db.String(20), default="semantic", nullable=False)  # 'semantic', 'keyword', 'hybrid'
    filters_json = db.Column(db.Text, default="{}")
    result_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    def get_filters(self) -> dict:
        try:
            return json.loads(self.filters_json) if self.filters_json else {}
        except Exception:
            return {}

    def set_filters(self, filters: dict):
        self.filters_json = json.dumps(filters)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "query": self.query,
            "search_type": self.search_type,
            "filters": self.get_filters(),
            "result_count": self.result_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
