import io


def test_list_documents(client, demo_token):
    res = client.get("/api/documents", headers={"Authorization": f"Bearer {demo_token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["data"]["items"]) >= 1


def test_upload_text_document(client, demo_token):
    file_data = io.BytesIO(b"Artificial Intelligence and Machine Learning Research Report.\nAuthor: Dr. Test\nAbstract: This paper explores deep learning architectures.")
    res = client.post(
        "/api/documents",
        data={"file": (file_data, "test_report.txt"), "title": "Test AI Research Report"},
        headers={"Authorization": f"Bearer {demo_token}"},
        content_type="multipart/form-data",
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["title"] == "Test AI Research Report"


def test_get_document_details(client, demo_token):
    # List first
    list_res = client.get("/api/documents", headers={"Authorization": f"Bearer {demo_token}"})
    doc_id = list_res.get_json()["data"]["items"][0]["id"]

    res = client.get(f"/api/documents/{doc_id}", headers={"Authorization": f"Bearer {demo_token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "summary" in data["data"]
    assert "entities" in data["data"]
    assert "keywords" in data["data"]


def test_rename_document(client, demo_token):
    list_res = client.get("/api/documents", headers={"Authorization": f"Bearer {demo_token}"})
    doc_id = list_res.get_json()["data"]["items"][0]["id"]

    res = client.patch(
        f"/api/documents/{doc_id}",
        json={"title": "Updated Custom Document Title"},
        headers={"Authorization": f"Bearer {demo_token}"},
    )
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["title"] == "Updated Custom Document Title"
