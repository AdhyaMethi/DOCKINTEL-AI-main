from typing import Dict, Any
from backend.app.models.audit import AuditLog
from backend.app.models.user import User


class AuditService:
    """Audit logging and security compliance tracking."""

    @classmethod
    def list_logs(
        cls,
        action: str = "",
        user_id: str = "",
        page: int = 1,
        per_page: int = 20,
    ) -> Dict[str, Any]:
        query = AuditLog.query.order_by(AuditLog.created_at.desc())

        if action and action != "all":
            query = query.filter_by(action=action)

        if user_id and user_id != "all":
            query = query.filter_by(user_id=user_id)

        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            "success": True,
            "data": {
                "items": [log.to_dict() for log in paginated.items],
                "total": paginated.total,
                "page": paginated.page,
                "per_page": paginated.per_page,
                "pages": paginated.pages,
            }
        }
