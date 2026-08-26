import os
import sys
import pytest

# Add parent path
backend_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
parent_dir = os.path.abspath(os.path.dirname(backend_dir))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.app import create_app
from backend.app.extensions import db
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.models.page import DocumentPage
from backend.app.models.chunk import DocumentChunk
from backend.app.models.summary import DocumentSummary
from backend.app.models.entity import DocumentEntity
from backend.app.models.keyword import DocumentKeyword
from backend.app.seed.seed_data import seed_database
from flask_jwt_extended import create_access_token


@pytest.fixture
def app():
    test_app = create_app("testing")
    with test_app.app_context():
        db.create_all()
        seed_database()
        yield test_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def admin_token(app):
    with app.app_context():
        admin = User.query.filter_by(role="admin").first()
        return create_access_token(identity=admin.id)


@pytest.fixture
def demo_token(app):
    with app.app_context():
        demo = User.query.filter_by(role="user").first()
        return create_access_token(identity=demo.id)
