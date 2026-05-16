"""Shadrasa backend API tests - auth, contact, enquiry, admin endpoints."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://shadrasa-preview.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@shadrasa.com"
ADMIN_PASSWORD = "Shadrasa@2026"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(client):
    r = client.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


# Root
def test_root(client):
    r = client.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# Auth
def test_login_success(client):
    r = client.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert "access_token" in data and len(data["access_token"]) > 20
    # cookie should be set
    assert "access_token" in r.cookies or any("access_token" in c.name for c in r.cookies)


def test_login_wrong_password(client):
    r = client.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"})
    assert r.status_code == 401


def test_me_with_bearer(client, admin_token):
    r = client.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert "_id" not in data
    assert "password_hash" not in data


def test_me_without_token():
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


# Contact
def test_create_contact(client):
    payload = {
        "name": "TEST_User",
        "email": "test@example.com",
        "phone": "+919999999999",
        "subject": "Test subject",
        "message": "Hello from pytest",
    }
    r = client.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert "id" in data
    assert "email_sent" in data
    # email should be False since RESEND_API_KEY is empty
    assert data["email_sent"] is False


def test_contact_invalid_email(client):
    r = client.post(f"{BASE_URL}/api/contact", json={
        "name": "Bad", "email": "not-an-email", "message": "hi"
    })
    assert r.status_code == 422


# Enquiry
def test_create_enquiry(client):
    payload = {
        "name": "TEST_Enquirer",
        "email": "buyer@example.com",
        "phone": "+919876543210",
        "product": "Jeerige Midi Maavu Pickle",
        "quantity": "2",
        "message": "Test enquiry",
    }
    r = client.post(f"{BASE_URL}/api/enquiry", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert "id" in data and "email_sent" in data


# Admin endpoints
def test_admin_contacts_unauth():
    r = requests.get(f"{BASE_URL}/api/admin/contacts")
    assert r.status_code == 401


def test_admin_contacts_auth(client, admin_token):
    r = client.get(f"{BASE_URL}/api/admin/contacts", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    if items:
        assert "_id" not in items[0]
        assert "id" in items[0]


def test_admin_enquiries_unauth():
    r = requests.get(f"{BASE_URL}/api/admin/enquiries")
    assert r.status_code == 401


def test_admin_enquiries_auth(client, admin_token):
    r = client.get(f"{BASE_URL}/api/admin/enquiries", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    if items:
        assert "_id" not in items[0]


def test_admin_stats(client, admin_token):
    r = client.get(f"{BASE_URL}/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    data = r.json()
    assert "contacts" in data and "enquiries" in data
    assert isinstance(data["contacts"], int) and isinstance(data["enquiries"], int)
