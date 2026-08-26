def test_keyword_search(client, demo_token):
    res = client.get("/api/search?q=ResNet", headers={"Authorization": f"Bearer {demo_token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["data"]["items"]) >= 1


def test_semantic_vector_search(client, demo_token):
    res = client.post(
        "/api/search/semantic",
        json={"query": "neural network architecture depth and error rate", "top_k": 5},
        headers={"Authorization": f"Bearer {demo_token}"},
    )
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["data"]["items"]) >= 1
    assert data["data"]["items"][0]["score"] > 0.0


def test_chat_and_rag_pipeline(client, demo_token):
    # 1. Create chat session
    create_res = client.post(
        "/api/chat/sessions",
        json={"title": "Test AI Chat Session"},
        headers={"Authorization": f"Bearer {demo_token}"},
    )
    assert create_res.status_code == 201
    session_id = create_res.get_json()["data"]["id"]

    # 2. Send message
    msg_res = client.post(
        f"/api/chat/sessions/{session_id}/messages",
        json={"content": "What is the total amount due on the invoice?"},
        headers={"Authorization": f"Bearer {demo_token}"},
    )
    assert msg_res.status_code == 200
    data = msg_res.get_json()
    assert data["success"] is True
    assert len(data["data"]["assistant_message"]["content"]) > 0
    assert len(data["data"]["assistant_message"]["sources"]) >= 1


def test_document_comparison(client, demo_token):
    list_res = client.get("/api/documents", headers={"Authorization": f"Bearer {demo_token}"})
    items = list_res.get_json()["data"]["items"]
    if len(items) >= 2:
        doc_a = items[0]["id"]
        doc_b = items[1]["id"]
        res = client.post(
            "/api/documents/compare",
            json={"document_id_a": doc_a, "document_id_b": doc_b},
            headers={"Authorization": f"Bearer {demo_token}"},
        )
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert "metrics" in data["data"]
        assert "diff" in data["data"]
