from flask_jwt_extended import create_access_token
from backend.app.extensions import db
from backend.app.models.user import User
from backend.app.models.audit import AuditLog


class AuthService:
    """Authentication and User management service."""

    @staticmethod
    def register(email: str, username: str, password: str, role: str = "user", ip_address: str = None) -> tuple[dict, int]:
        email = (email or "").strip().lower()
        username = (username or "").strip()
        
        if not email or not username or not password:
            return {"success": False, "message": "Email, username, and password are required", "error_code": "VALIDATION_ERROR"}, 400

        if len(password) < 6:
            return {"success": False, "message": "Password must be at least 6 characters long", "error_code": "WEAK_PASSWORD"}, 400

        if User.query.filter_by(email=email).first():
            return {"success": False, "message": "Email is already registered", "error_code": "EMAIL_EXISTS"}, 409

        if User.query.filter_by(username=username).first():
            return {"success": False, "message": "Username is already taken", "error_code": "USERNAME_EXISTS"}, 409

        user = User(email=email, username=username, role=role if role in ["user", "admin"] else "user")
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        # Audit log
        audit = AuditLog(user_id=user.id, action="REGISTER", resource_type="USER", resource_id=user.id, ip_address=ip_address)
        audit.set_details({"username": username, "email": email, "role": user.role})
        db.session.add(audit)
        db.session.commit()

        access_token = create_access_token(identity=user.id)
        return {
            "success": True,
            "message": "User registered successfully",
            "data": {
                "user": user.to_dict(),
                "access_token": access_token,
            }
        }, 201

    @staticmethod
    def login(login_identifier: str, password: str, ip_address: str = None) -> tuple[dict, int]:
        login_identifier = (login_identifier or "").strip().lower()
        if not login_identifier or not password:
            return {"success": False, "message": "Email/Username and password are required", "error_code": "VALIDATION_ERROR"}, 400

        user = User.query.filter((User.email == login_identifier) | (User.username == login_identifier)).first()
        if not user or not user.check_password(password):
            return {"success": False, "message": "Invalid email or password", "error_code": "INVALID_CREDENTIALS"}, 401

        if not user.is_active:
            return {"success": False, "message": "Account has been deactivated. Please contact support.", "error_code": "ACCOUNT_DEACTIVATED"}, 403

        access_token = create_access_token(identity=user.id)

        # Audit log
        audit = AuditLog(user_id=user.id, action="LOGIN", resource_type="USER", resource_id=user.id, ip_address=ip_address)
        audit.set_details({"username": user.username})
        db.session.add(audit)
        db.session.commit()

        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "user": user.to_dict(),
                "access_token": access_token,
            }
        }, 200

    @staticmethod
    def update_profile(user: User, data: dict) -> tuple[dict, int]:
        if "custom_llm_key" in data:
            user.custom_llm_key = data["custom_llm_key"].strip() if data["custom_llm_key"] else None
        
        if "avatar_url" in data:
            user.avatar_url = data["avatar_url"]

        if "password" in data and data["password"]:
            if len(data["password"]) < 6:
                return {"success": False, "message": "New password must be at least 6 characters", "error_code": "WEAK_PASSWORD"}, 400
            user.set_password(data["password"])

        db.session.commit()
        return {
            "success": True,
            "message": "Profile updated successfully",
            "data": {"user": user.to_dict(include_private=True)},
        }, 200
