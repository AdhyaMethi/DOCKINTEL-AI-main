import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env file from backend root
base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
load_dotenv(os.path.join(base_dir, ".env"))


class Config:
    """Base configuration settings."""
    SECRET_KEY = os.getenv("SECRET_KEY", "docintel-super-secret-key-default-384729")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-docintel-secret-key-default-837492")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "1440"))
    )

    # Database
    db_url = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(base_dir, 'docintel.db')}")
    # Handle postgres:// vs postgresql:// for SQLAlchemy 2.0+
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File uploads & limits
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 50 * 1024 * 1024))  # 50MB default
    UPLOAD_FOLDER = os.path.join(base_dir, os.getenv("UPLOAD_FOLDER", "storage/uploads"))
    PROCESSED_FOLDER = os.path.join(base_dir, os.getenv("PROCESSED_FOLDER", "storage/processed"))
    ALLOWED_EXTENSIONS = {"pdf", "docx", "txt", "jpg", "jpeg", "png"}
    ALLOWED_MIME_TYPES = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/jpg",
    }

    # AI & Embeddings
    AI_PROVIDER = os.getenv("AI_PROVIDER", "fallback").lower()
    EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "fallback").lower()
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "fallback").lower()
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
    TESSERACT_CMD = os.getenv("TESSERACT_CMD", "")

    # CORS
    CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"]


class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False


class TestingConfig(Config):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=60)
    UPLOAD_FOLDER = os.path.join(base_dir, "storage/test_uploads")
    PROCESSED_FOLDER = os.path.join(base_dir, "storage/test_processed")


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
