from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from backend.app.models.user import User
from backend.app.models.document import Document


def get_current_user() -> User | None:
    """Helper to fetch the current authenticated user instance from DB."""
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        if not user_id:
            return None
        user = User.query.get(user_id)
        if not user or not user.is_active:
            return None
        return user
    except Exception:
        return None


def admin_required():
    """Decorator to require admin role for an endpoint."""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                user = User.query.get(user_id)
                if not user or not user.is_active or not user.is_admin():
                    return (
                        jsonify(
                            {
                                "success": False,
                                "message": "Administrator privileges required",
                                "error_code": "FORBIDDEN",
                            }
                        ),
                        403,
                    )
                return fn(*args, **kwargs)
            except Exception as e:
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": f"Unauthorized: {str(e)}",
                            "error_code": "UNAUTHORIZED",
                        }
                    ),
                    401,
                )
        return decorator
    return wrapper


def can_access_document(user: User, document: Document) -> bool:
    """Check whether the user is authorized to read/query the document."""
    if not user or not document:
        return False
    if user.is_admin():
        return True
    return document.user_id == user.id


def can_manage_document(user: User, document: Document) -> bool:
    """Check whether the user is authorized to update/delete the document."""
    if not user or not document:
        return False
    if user.is_admin():
        return True
    return document.user_id == user.id
