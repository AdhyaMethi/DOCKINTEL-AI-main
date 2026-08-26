from typing import List, Dict, Any
from backend.app.extensions import db
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.models.chat import ChatSession, ChatMessage
from backend.app.ai.rag_service import RAGService


class ChatService:
    """Conversational RAG Chat service for single-document and multi-document intelligence."""

    @classmethod
    def create_session(
        cls,
        user: User,
        title: str = "",
        document_id: str = None,
        is_multi_doc: bool = False,
        selected_doc_ids: List[str] = None,
    ) -> tuple[dict, int]:
        doc_title = "Document"
        if document_id:
            doc = Document.query.get(document_id)
            if not doc:
                return {"success": False, "message": "Document not found", "error_code": "NOT_FOUND"}, 404
            if not user.is_admin() and doc.user_id != user.id:
                return {"success": False, "message": "Unauthorized to access this document", "error_code": "FORBIDDEN"}, 403
            doc_title = doc.title

        session_title = title.strip() if title and title.strip() else (
            f"Chat with {doc_title}" if document_id else ("Multi-Document Research" if is_multi_doc else "New Conversation")
        )

        session = ChatSession(
            user_id=user.id,
            title=session_title,
            document_id=document_id,
            is_multi_doc=is_multi_doc,
        )
        if selected_doc_ids:
            session.set_selected_doc_ids(selected_doc_ids)

        db.session.add(session)
        db.session.commit()

        return {"success": True, "message": "Chat session created", "data": session.to_dict()}, 201

    @classmethod
    def list_sessions(cls, user: User) -> dict:
        sessions = ChatSession.query.filter_by(user_id=user.id).order_by(ChatSession.updated_at.desc()).all()
        return {"success": True, "data": [s.to_dict() for s in sessions]}

    @classmethod
    def get_session(cls, user: User, session_id: str) -> tuple[dict, int]:
        session = ChatSession.query.get(session_id)
        if not session:
            return {"success": False, "message": "Chat session not found", "error_code": "NOT_FOUND"}, 404

        if session.user_id != user.id and not user.is_admin():
            return {"success": False, "message": "Unauthorized to access this chat", "error_code": "FORBIDDEN"}, 403

        return {"success": True, "data": session.to_dict(include_messages=True)}, 200

    @classmethod
    def send_message(cls, user: User, session_id: str, content: str) -> tuple[dict, int]:
        message_text = (content or "").strip()
        if not message_text:
            return {"success": False, "message": "Message content cannot be empty", "error_code": "VALIDATION_ERROR"}, 400

        session = ChatSession.query.get(session_id)
        if not session:
            return {"success": False, "message": "Chat session not found", "error_code": "NOT_FOUND"}, 404

        if session.user_id != user.id and not user.is_admin():
            return {"success": False, "message": "Unauthorized", "error_code": "FORBIDDEN"}, 403

        # 1. Save User message
        user_msg = ChatMessage(session_id=session.id, role="user", content=message_text)
        db.session.add(user_msg)
        db.session.commit()

        # 2. Determine target document context
        doc_ids = []
        if session.document_id:
            doc_ids = [session.document_id]
        elif session.is_multi_doc:
            doc_ids = session.get_selected_doc_ids()

        # 3. Query RAG engine
        rag_response = RAGService.query(
            question=message_text,
            user_id=user.id,
            document_ids=doc_ids,
            custom_llm_key=user.custom_llm_key or "",
            top_k=5,
        )

        answer_text = rag_response.get("answer", "No answer generated.")
        sources = rag_response.get("sources", [])

        # 4. Save Assistant message
        assistant_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=answer_text,
        )
        assistant_msg.set_sources(sources)
        db.session.add(assistant_msg)
        db.session.commit()

        return {
            "success": True,
            "data": {
                "user_message": user_msg.to_dict(),
                "assistant_message": assistant_msg.to_dict(),
                "session": session.to_dict(),
            }
        }, 200

    @classmethod
    def delete_session(cls, user: User, session_id: str) -> tuple[dict, int]:
        session = ChatSession.query.get(session_id)
        if not session:
            return {"success": False, "message": "Session not found", "error_code": "NOT_FOUND"}, 404

        if session.user_id != user.id and not user.is_admin():
            return {"success": False, "message": "Unauthorized", "error_code": "FORBIDDEN"}, 403

        db.session.delete(session)
        db.session.commit()

        return {"success": True, "message": "Chat session deleted"}, 200
