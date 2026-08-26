import json


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "online"
    assert data["service"] == "Intelligent Document Intelligence Platform API"


def test_user_registration(client):
    res = client.post("/api/auth/register", json={
        "email": "newuser@docintel.io",
        "username": "newuser",
        "password": "Password123!",
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "newuser@docintel.io"


def test_user_login(client):
    res = client.post("/api/auth/login", json={
        "email": "admin@docintel.io",
        "password": "AdminPassword123!",
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["role"] == "admin"


def test_invalid_login(client):
    res = client.post("/api/auth/login", json={
        "email": "admin@docintel.io",
        "password": "WrongPassword!",
    })
    assert res.status_code == 401
    data = res.get_json()
    assert data["success"] is False


def test_get_current_user_profile(client, demo_token):
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {demo_token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["email"] == "demo@docintel.io"
