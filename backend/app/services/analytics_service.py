from datetime import datetime, timedelta, timezone
from collections import Counter
from backend.app.extensions import db
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.models.entity import DocumentEntity
from backend.app.models.chat import ChatSession
from backend.app.models.search_history import SearchHistory


class AnalyticsService:
    """Computes real-time analytical metrics and visualization datasets."""

    @classmethod
    def get_dashboard_metrics(cls, user: User) -> dict:
        doc_query = Document.query
        if not user.is_admin():
            doc_query = doc_query.filter_by(user_id=user.id)

        docs = doc_query.all()
        total_docs = len(docs)
        completed_docs = sum(1 for d in docs if d.status == "completed")
        processing_docs = sum(1 for d in docs if d.status == "processing")
        failed_docs = sum(1 for d in docs if d.status == "failed")
        total_chars = sum(d.total_characters or 0 for d in docs)
        total_words = sum(d.total_words or 0 for d in docs)
        total_storage_bytes = sum(d.file_size or 0 for d in docs)

        # Document type distribution
        type_counts = Counter(d.document_type or "Unknown" for d in docs)
        doc_types_data = [{"name": dtype, "value": count} for dtype, count in type_counts.most_common()]
        if not doc_types_data:
            doc_types_data = [{"name": "No Documents", "value": 0}]

        # Status distribution
        status_data = [
            {"name": "Completed", "value": completed_docs, "color": "#10B981"},
            {"name": "Processing", "value": processing_docs, "color": "#3B82F6"},
            {"name": "Failed", "value": failed_docs, "color": "#EF4444"},
            {"name": "Uploaded", "value": sum(1 for d in docs if d.status == "uploaded"), "color": "#F59E0B"},
        ]

        # 7-day upload trend
        now = datetime.now(timezone.utc)
        trends_7d = []
        for i in range(6, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            count = sum(1 for d in docs if d.created_at and day_start <= d.created_at.replace(tzinfo=timezone.utc if d.created_at.tzinfo is None else d.created_at.tzinfo) < day_end)
            trends_7d.append({
                "date": day_start.strftime("%b %d"),
                "uploads": count,
            })

        # Recent 5 documents
        recent_docs = [d.to_dict() for d in sorted(docs, key=lambda x: x.created_at, reverse=True)[:5]]

        # Chat & Search counts
        chat_count = ChatSession.query.filter_by(user_id=user.id).count() if not user.is_admin() else ChatSession.query.count()
        search_count = SearchHistory.query.filter_by(user_id=user.id).count() if not user.is_admin() else SearchHistory.query.count()

        return {
            "success": True,
            "data": {
                "summary": {
                    "total_documents": total_docs,
                    "completed_documents": completed_docs,
                    "processing_documents": processing_docs,
                    "failed_documents": failed_docs,
                    "total_characters": total_chars,
                    "total_words": total_words,
                    "storage_used_bytes": total_storage_bytes,
                    "storage_used_mb": round(total_storage_bytes / (1024 * 1024), 2),
                    "chat_sessions": chat_count,
                    "search_queries": search_count,
                },
                "document_types": doc_types_data,
                "status_distribution": status_data,
                "upload_trends": trends_7d,
                "recent_documents": recent_docs,
            }
        }
