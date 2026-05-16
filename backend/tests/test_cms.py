"""Shadrasa CMS endpoint tests - site public, admin CRUD for content/products/categories/banners."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://shadrasa-preview.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@shadrasa.com"
ADMIN_PASSWORD = "Shadrasa@2026"


@pytest.fixture(scope="module")
def auth_headers():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.text}"
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# -------- Public site endpoints --------
def test_site_content_returns_seeded():
    r = requests.get(f"{BASE_URL}/api/site/content")
    assert r.status_code == 200
    data = r.json()
    assert "_id" not in data
    assert data.get("hero_heading") == "Welcome to Shadrasa"
    assert "about_body" in data
    assert "mission_body" in data
    assert "contact_phone" in data
    assert "footer_tagline" in data


def test_site_products_no_id_leak():
    r = requests.get(f"{BASE_URL}/api/site/products")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list) and len(items) >= 2
    names = [p["name"] for p in items]
    assert "Jeerige Midi Maavu Pickle" in names
    assert "Pure Natural Honey" in names
    for p in items:
        assert "_id" not in p
        assert "id" in p
        assert p.get("is_active") is True


def test_site_banners():
    r = requests.get(f"{BASE_URL}/api/site/banners")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list) and len(items) >= 4
    for b in items:
        assert "_id" not in b
        assert b.get("is_active") is True


def test_site_categories():
    r = requests.get(f"{BASE_URL}/api/site/categories")
    assert r.status_code == 200
    items = r.json()
    slugs = [c["slug"] for c in items]
    assert "pickles" in slugs and "honey" in slugs
    for c in items:
        assert "_id" not in c


# -------- Admin dashboard --------
def test_admin_dashboard_unauth():
    r = requests.get(f"{BASE_URL}/api/admin/dashboard")
    assert r.status_code == 401


def test_admin_dashboard_auth(auth_headers):
    r = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    for key in ["products", "categories", "banners", "contacts",
                "enquiries", "active_products", "low_stock"]:
        assert key in data
        assert isinstance(data[key], int)


# -------- Admin Categories CRUD --------
def test_categories_unauth():
    r = requests.get(f"{BASE_URL}/api/admin/categories")
    assert r.status_code == 401


def test_categories_crud(auth_headers):
    # CREATE without slug -> auto-generated
    name = f"TEST_Cat_{uuid.uuid4().hex[:6]}"
    r = requests.post(f"{BASE_URL}/api/admin/categories",
                      headers=auth_headers, json={"name": name})
    assert r.status_code == 201, r.text
    cat = r.json()
    assert cat["name"] == name
    assert cat["slug"] == name.lower().replace(" ", "-")
    assert "_id" not in cat
    cid = cat["id"]

    # LIST
    r = requests.get(f"{BASE_URL}/api/admin/categories", headers=auth_headers)
    assert r.status_code == 200
    assert any(c["id"] == cid for c in r.json())

    # UPDATE
    r = requests.put(f"{BASE_URL}/api/admin/categories/{cid}",
                     headers=auth_headers,
                     json={"name": name + "_v2", "description": "updated"})
    assert r.status_code == 200
    assert r.json()["name"] == name + "_v2"

    # DELETE
    r = requests.delete(f"{BASE_URL}/api/admin/categories/{cid}", headers=auth_headers)
    assert r.status_code == 200


def test_category_missing_name(auth_headers):
    r = requests.post(f"{BASE_URL}/api/admin/categories",
                      headers=auth_headers, json={"description": "no name"})
    assert r.status_code == 422


# -------- Admin Products CRUD --------
def test_products_unauth():
    r = requests.get(f"{BASE_URL}/api/admin/products")
    assert r.status_code == 401


def test_products_crud_with_category_autofill(auth_headers):
    # Create a temp category to use
    cat_name = f"TEST_PCat_{uuid.uuid4().hex[:6]}"
    rc = requests.post(f"{BASE_URL}/api/admin/categories",
                       headers=auth_headers, json={"name": cat_name})
    assert rc.status_code == 201
    cat_id = rc.json()["id"]

    # CREATE product with category_id only -> category_name should auto-fill
    pname = f"TEST_Prod_{uuid.uuid4().hex[:6]}"
    payload = {
        "name": pname,
        "description": "A test product",
        "category_id": cat_id,
        "price": 199.0,
        "stock": 10,
        "image": "data:image/png;base64,iVBORw0KGgo=",
    }
    r = requests.post(f"{BASE_URL}/api/admin/products",
                      headers=auth_headers, json=payload)
    assert r.status_code == 201, r.text
    prod = r.json()
    assert prod["name"] == pname
    assert prod["category_name"] == cat_name
    assert "_id" not in prod
    pid = prod["id"]

    # appears on public /api/site/products
    rs = requests.get(f"{BASE_URL}/api/site/products")
    assert any(p["id"] == pid for p in rs.json())

    # UPDATE
    payload["price"] = 299.0
    payload["description"] = "Updated desc"
    r = requests.put(f"{BASE_URL}/api/admin/products/{pid}",
                     headers=auth_headers, json=payload)
    assert r.status_code == 200
    assert r.json()["price"] == 299.0

    # DELETE
    r = requests.delete(f"{BASE_URL}/api/admin/products/{pid}", headers=auth_headers)
    assert r.status_code == 200
    requests.delete(f"{BASE_URL}/api/admin/categories/{cat_id}", headers=auth_headers)


def test_product_missing_fields(auth_headers):
    r = requests.post(f"{BASE_URL}/api/admin/products",
                      headers=auth_headers, json={"name": "OnlyName"})
    assert r.status_code == 422
    r = requests.post(f"{BASE_URL}/api/admin/products",
                      headers=auth_headers, json={"description": "no name"})
    assert r.status_code == 422


# -------- Admin Banners CRUD --------
def test_banners_crud_and_toggle(auth_headers):
    r = requests.post(f"{BASE_URL}/api/admin/banners",
                      headers=auth_headers,
                      json={"image": "https://example.com/a.png",
                            "title": "TEST_Banner", "is_active": True})
    assert r.status_code == 201
    bid = r.json()["id"]
    assert "_id" not in r.json()

    # toggle off
    r = requests.put(f"{BASE_URL}/api/admin/banners/{bid}",
                     headers=auth_headers,
                     json={"image": "https://example.com/a.png",
                           "title": "TEST_Banner", "is_active": False})
    assert r.status_code == 200
    assert r.json()["is_active"] is False

    # should not appear in public banners (only active)
    pub = requests.get(f"{BASE_URL}/api/site/banners").json()
    assert not any(b["id"] == bid for b in pub)

    # DELETE
    r = requests.delete(f"{BASE_URL}/api/admin/banners/{bid}", headers=auth_headers)
    assert r.status_code == 200


# -------- Admin Content --------
def test_content_get_and_partial_update(auth_headers):
    r = requests.get(f"{BASE_URL}/api/admin/content", headers=auth_headers)
    assert r.status_code == 200
    original = r.json()
    assert "_id" not in original
    original_about = original.get("about_body")

    new_heading = f"TEST Heading {uuid.uuid4().hex[:5]}"
    r = requests.put(f"{BASE_URL}/api/admin/content",
                     headers=auth_headers, json={"hero_heading": new_heading})
    assert r.status_code == 200
    updated = r.json()
    assert updated["hero_heading"] == new_heading
    # other fields preserved
    assert updated.get("about_body") == original_about

    # public reflects change
    rp = requests.get(f"{BASE_URL}/api/site/content").json()
    assert rp["hero_heading"] == new_heading

    # restore
    requests.put(f"{BASE_URL}/api/admin/content",
                 headers=auth_headers,
                 json={"hero_heading": "Welcome to Shadrasa"})


# -------- Admin enquiry/contact status updates --------
def test_enquiry_status_update(auth_headers):
    # create one first
    rc = requests.post(f"{BASE_URL}/api/enquiry", json={
        "name": "TEST_E", "email": "e@example.com", "phone": "1234567",
        "product": "TestProd", "quantity": "1", "message": "x"
    })
    assert rc.status_code == 201
    eid = rc.json()["id"]

    r = requests.put(f"{BASE_URL}/api/admin/enquiries/{eid}/status",
                     headers=auth_headers, json={"status": "contacted"})
    assert r.status_code == 200

    lst = requests.get(f"{BASE_URL}/api/admin/enquiries", headers=auth_headers).json()
    found = next((x for x in lst if x["id"] == eid), None)
    assert found and found["status"] == "contacted"


def test_contact_status_update(auth_headers):
    rc = requests.post(f"{BASE_URL}/api/contact", json={
        "name": "TEST_C", "email": "c@example.com", "message": "hello"
    })
    cid = rc.json()["id"]
    r = requests.put(f"{BASE_URL}/api/admin/contacts/{cid}/status",
                     headers=auth_headers, json={"status": "resolved"})
    assert r.status_code == 200
    lst = requests.get(f"{BASE_URL}/api/admin/contacts", headers=auth_headers).json()
    found = next((x for x in lst if x["id"] == cid), None)
    assert found and found["status"] == "resolved"


def test_enquiry_status_not_found(auth_headers):
    r = requests.put(f"{BASE_URL}/api/admin/enquiries/nonexistent-id/status",
                     headers=auth_headers, json={"status": "x"})
    assert r.status_code == 404
