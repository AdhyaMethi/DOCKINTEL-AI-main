def test_admin_stats(client, admin_token):
    res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["total_users"] >= 2
    assert data["data"]["total_documents"] >= 4


def test_admin_stats_forbidden_for_user(client, demo_token):
    res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {demo_token}"})
    assert res.status_code == 403


def test_admin_users_list(client, admin_token):
    res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["data"]["items"]) >= 2


def test_admin_audit_logs(client, admin_token):
    res = client.get("/api/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["data"]["items"]) >= 1
