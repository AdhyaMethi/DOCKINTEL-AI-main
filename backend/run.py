import os
import sys

# Ensure backend root is on sys.path
backend_dir = os.path.abspath(os.path.dirname(__file__))
parent_dir = os.path.abspath(os.path.dirname(backend_dir))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.app import create_app
from backend.app.extensions import db
from backend.app.seed.seed_data import seed_database
from backend.app.models.user import User

env = os.getenv("FLASK_ENV", "development")
app = create_app(env)


@app.cli.command("seed")
def seed_command():
    """CLI command to seed initial admin, demo user, and sample documents."""
    with app.app_context():
        db.create_all()
        seed_database()
        print("Database seed completed successfully.")


if __name__ == "__main__":
    with app.app_context():
        # Auto-create tables on startup
        db.create_all()

        # If no users exist, auto-seed with default admin and demo user
        if User.query.count() == 0 or "--seed" in sys.argv:
            print("[*] Initializing and seeding database...")
            seed_database()

    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    print(f"[*] Starting Intelligent Document Intelligence Platform Backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug)
