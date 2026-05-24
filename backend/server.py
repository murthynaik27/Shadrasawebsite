try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None
from pathlib import Path
ROOT_DIR = Path(__file__).parent
if load_dotenv:
    try:
        load_dotenv(ROOT_DIR / '.env')
    except Exception:
        # ignore dotenv load failures in minimal environments
        pass

import os
import asyncio
import logging
import uuid
import bcrypt
import jwt
import resend
import sys
import traceback
import asyncio
import logging
import uuid
import bcrypt
import jwt
import resend
import certifi
from datetime import datetime, timezone, timedelta
from typing import List, Optional

# Configure basic logging early so any import-time error is logged
logging.basicConfig(level=logging.INFO)

try:
    from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, File, UploadFile
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import StreamingResponse
    from fastapi.middleware.gzip import GZipMiddleware
    from starlette.middleware.cors import CORSMiddleware
    from pymongo import MongoClient
    from pydantic import BaseModel, Field, EmailStr
    from io import BytesIO
    from fpdf import FPDF
except Exception:
    logging.exception("Failed importing FastAPI or other runtime dependencies during startup")
    traceback.print_exc()
    # exit so Render shows a clear error instead of a silent crash
    sys.exit(1)
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'shadrasa_db')

client = None
db = None
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

if mongo_url:
    try:
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        db = client[db_name]
        print("DB connected")
    except Exception as e:
        print("DB connection failed:", e)
else:
    print("MONGO_URL missing, db not connected")

# -------- App --------
app = FastAPI(title="Shadrasa API")
app.add_middleware(GZipMiddleware, minimum_size=1000)
api_router = APIRouter(prefix="/api")
admin_router = APIRouter(prefix="/api/admin")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# -------- Resend setup --------
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
NOTIFY_EMAIL = os.environ.get("NOTIFY_EMAIL", "shadrasa.india@gmail.com")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


async def send_notification_email(subject: str, html_content: str) -> bool:
    if not RESEND_API_KEY:
        logger.info("Resend API key not configured; skipping email send.")
        return False
    try:
        params = {"from": SENDER_EMAIL, "to": [NOTIFY_EMAIL], "subject": subject, "html": html_content}
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as e:
        logger.error(f"Resend email failed: {e}")
        return False


# -------- Auth helpers --------
JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ.get("JWT_SECRET", "default_secret_key_change_me")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# -------- Models --------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=30)
    subject: Optional[str] = Field(None, max_length=200)
    message: str = Field(..., min_length=1, max_length=2000)


class EnquiryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=4, max_length=30)
    product: str = Field(..., max_length=120)
    quantity: Optional[str] = Field(None, max_length=80)
    message: Optional[str] = Field(None, max_length=2000)


class CategoryIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    slug: Optional[str] = Field(None, max_length=80)
    description: Optional[str] = Field(None, max_length=500)
    image: Optional[str] = None
    blur_image: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class WeightOptionIn(BaseModel):
    weight: float
    unit: str
    price: float
    sale_price: Optional[float] = None
    retailerPrice: Optional[float] = None
    wholesalePrice: Optional[float] = None
    normalPrice: Optional[float] = None
    stock: int = 0
    image: Optional[str] = None
    blur_image: Optional[str] = None


class ProductIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=160)
    tagline: Optional[str] = Field(None, max_length=160)
    description: str = Field(..., min_length=1, max_length=2000)
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    price: float = 0
    sale_price: Optional[float] = None
    currency: str = "INR"
    stock: int = 0
    weight: Optional[float] = None
    unit: Optional[str] = None
    weight_options: List[WeightOptionIn] = []
    image: Optional[str] = None  # base64 data URL
    blur_image: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    premium_badge: Optional[str] = None
    sort_order: int = 0


class BannerIn(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image: Optional[str] = None  # base64 data URL
    blur_image: Optional[str] = None
    cta_label: Optional[str] = None
    cta_href: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class GalleryIn(BaseModel):
    title: Optional[str] = None
    type: str = Field(..., max_length=20)  # "image" or "video"
    url: str
    blur_image: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class ReviewIn(BaseModel):
    name: str = Field(..., max_length=100)
    location: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    text: str = Field(..., max_length=1000)
    image: Optional[str] = None
    status: str = "pending" # pending, approved, featured, rejected
    is_verified_purchase: bool = False


class StatusUpdate(BaseModel):
    status: str = Field(..., max_length=40)


class OrderItemIn(BaseModel):
    product_id: str
    name: str
    image: Optional[str] = None
    price: float
    quantity: int = Field(..., ge=1)
    weight: Optional[float] = None
    unit: Optional[str] = None


class OrderIn(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=120)
    customer_email: Optional[EmailStr] = None
    customer_phone: str = Field(..., min_length=4, max_length=30)
    address_line1: str = Field(..., min_length=1, max_length=200)
    address_line2: Optional[str] = Field(None, max_length=200)
    city: str = Field(..., min_length=1, max_length=80)
    state: Optional[str] = Field(None, max_length=80)
    pincode: str = Field(..., min_length=3, max_length=12)
    country: str = "India"
    notes: Optional[str] = Field(None, max_length=1000)
    items: List[OrderItemIn]
    payment_method: str = Field("cod", max_length=40)  # cod | bank | whatsapp


class InvoiceItemIn(BaseModel):
    product_id: Optional[str] = None
    name: str = Field(..., max_length=160)
    quantity: int = Field(..., ge=1)
    weight: Optional[float] = None
    unit: Optional[str] = None
    price_type: Optional[str] = None
    price: float = Field(..., ge=0)
    line_total: float = Field(..., ge=0)


class InvoiceIn(BaseModel):
    shop_name: str = Field(..., max_length=160)
    owner_name: str = Field(..., max_length=120)
    phone: str = Field(..., max_length=30)
    address: str = Field(..., max_length=300)
    gst_number: Optional[str] = Field(None, max_length=30)
    items: List[InvoiceItemIn]
    subtotal: float = Field(..., ge=0)
    discount: float = Field(0, ge=0)
    tax_rate: float = Field(0, ge=0)
    tax_amount: float = Field(0, ge=0)
    total: float = Field(..., ge=0)
    payment_status: str = Field("Pending", max_length=40) # Pending, Partial, Paid
    notes: Optional[str] = Field(None, max_length=1000)



class ContentIn(BaseModel):
    # Hero
    hero_eyebrow: Optional[str] = None
    hero_heading: Optional[str] = None
    hero_subheading: Optional[str] = None
    hero_cta_primary_label: Optional[str] = None
    hero_cta_secondary_label: Optional[str] = None
    # About
    about_eyebrow: Optional[str] = None
    about_heading: Optional[str] = None
    about_body: Optional[str] = None
    about_image: Optional[str] = None
    mission_title: Optional[str] = None
    mission_body: Optional[str] = None
    vision_title: Optional[str] = None
    vision_body: Optional[str] = None
    # Heritage
    heritage_eyebrow: Optional[str] = None
    heritage_heading: Optional[str] = None
    heritage_body: Optional[str] = None
    heritage_image: Optional[str] = None
    heritage_button_label: Optional[str] = None
    heritage_video_url: Optional[str] = None
    heritage_is_active: Optional[bool] = True
    # Trust counters
    stat_customers: Optional[int] = None
    stat_quality: Optional[int] = None
    stat_natural: Optional[int] = None
    stat_recipes: Optional[int] = None
    # Business / Contact
    business_heading: Optional[str] = None
    business_body: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_address: Optional[str] = None
    whatsapp_number: Optional[str] = None
    # Footer
    footer_tagline: Optional[str] = None


import base64
from PIL import Image

def process_and_save_image(base64_str: str, prefix: str = "img") -> dict:
    if not base64_str or not base64_str.startswith("data:image"):
        return {"url": base64_str, "blur": None}
    
    try:
        header, encoded = base64_str.split(",", 1)
        image_data = base64.b64decode(encoded)
        img = Image.open(BytesIO(image_data))
        
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
        
        # Save as WebP for optimal size and compatibility
        buffered_webp = BytesIO()
        img.save(buffered_webp, format="WEBP", quality=80, method=6)
        webp_base64 = base64.b64encode(buffered_webp.getvalue()).decode("utf-8")
        file_url = f"data:image/webp;base64,{webp_base64}"
        
        # Generate Blur Data URI
        blur_img = img.copy()
        blur_img.thumbnail((20, 20), Image.Resampling.LANCZOS)
        buffered = BytesIO()
        blur_img.save(buffered, format="JPEG", quality=40)
        blur_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
        blur_data_uri = f"data:image/jpeg;base64,{blur_base64}"
        
        return {"url": file_url, "blur": blur_data_uri}
    except Exception as e:
        logger.error(f"Image processing error: {e}")
        return {"url": base64_str, "blur": None}

# -------- Public Routes --------
@api_router.get("/")
async def root():
    return {"message": "Shadrasa API", "status": "ok"}


@api_router.get("/health")
async def health():
    info = {"status": "ok", "uptime": datetime.now(timezone.utc).isoformat()}
    try:
        if db is None:
            info["db"] = "disconnected"
            info["status"] = "degraded"
        else:
            # ping the database to ensure connectivity
            db.command("ping")
            info["db"] = "ok"
    except Exception as e:
        info["db"] = f"error: {str(e)}"
        info["status"] = "error"
    return info


@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    email = data.email.lower().strip()
    user = db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True,
        samesite="none", max_age=8 * 60 * 60, path="/",
    )
    return {
        "id": user["id"], "email": user["email"],
        "name": user.get("name", "Admin"), "role": user.get("role", "admin"),
        "access_token": token,
    }


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.post("/contact", status_code=201)
async def create_contact(data: ContactCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "name": data.name, "email": data.email, "phone": data.phone,
        "subject": data.subject, "message": data.message,
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.contacts.insert_one(doc.copy())
    html = f"<h2>New Contact</h2><p><b>Name:</b> {doc['name']}<br><b>Email:</b> {doc['email']}<br><b>Phone:</b> {doc['phone'] or '-'}<br><b>Subject:</b> {doc['subject'] or '-'}</p><p>{doc['message']}</p>"
    email_sent = await send_notification_email("New Shadrasa Contact", html)
    return {"id": doc["id"], "email_sent": email_sent}


@api_router.post("/enquiry", status_code=201)
async def create_enquiry(data: EnquiryCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "name": data.name, "email": data.email, "phone": data.phone,
        "product": data.product, "quantity": data.quantity, "message": data.message,
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.enquiries.insert_one(doc.copy())
    html = f"<h2>New Enquiry</h2><p><b>Product:</b> {doc['product']}<br><b>Name:</b> {doc['name']}<br><b>Email:</b> {doc['email']}<br><b>Phone:</b> {doc['phone']}<br><b>Qty:</b> {doc['quantity'] or '-'}</p><p>{doc['message'] or ''}</p>"
    email_sent = await send_notification_email("New Shadrasa Enquiry", html)
    return {"id": doc["id"], "email_sent": email_sent}


@api_router.post("/orders", status_code=201)
async def create_order(data: OrderIn):
    # Validate items + compute totals server-side
    items_validated = []
    subtotal = 0.0
    for it in data.items:
        prod = db.products.find_one({"id": it.product_id, "is_active": True}, {"_id": 0})
        if not prod:
            raise HTTPException(400, f"Product unavailable: {it.name}")
        
        # Determine the price and stock based on weight options if selected
        unit_price = float(prod.get("sale_price") or prod.get("price") or 0)
        stock_available = prod.get("stock", 0)
        
        if it.weight and it.unit and prod.get("weight_options"):
            for opt in prod["weight_options"]:
                if opt["weight"] == it.weight and opt["unit"] == it.unit:
                    unit_price = float(opt.get("sale_price") or opt.get("price") or 0)
                    stock_available = opt.get("stock", 0)
                    break

        if stock_available < it.quantity:
            raise HTTPException(400, f"Insufficient stock for {prod['name']}")
        
        line_total = unit_price * it.quantity
        subtotal += line_total
        items_validated.append({
            "product_id": prod["id"],
            "name": prod["name"],
            "image": prod.get("image"),
            "price": unit_price,
            "quantity": it.quantity,
            "weight": it.weight,
            "unit": it.unit,
            "line_total": line_total,
        })
    shipping = 0.0  # free shipping default
    total = subtotal + shipping

    # Order number ORD-YYMMDD-XXXX
    now = datetime.now(timezone.utc)
    suffix = uuid.uuid4().hex[:4].upper()
    order_no = f"ORD-{now.strftime('%y%m%d')}-{suffix}"

    doc = {
        "id": str(uuid.uuid4()),
        "order_no": order_no,
        "customer_name": data.customer_name,
        "customer_email": data.customer_email,
        "customer_phone": data.customer_phone,
        "address_line1": data.address_line1,
        "address_line2": data.address_line2,
        "city": data.city,
        "state": data.state,
        "pincode": data.pincode,
        "country": data.country,
        "notes": data.notes,
        "items": items_validated,
        "subtotal": subtotal,
        "shipping": shipping,
        "total": total,
        "currency": "INR",
        "payment_method": data.payment_method,
        "status": "placed",
        "created_at": now.isoformat(),
    }
    db.orders.insert_one(doc.copy())

    # Decrement stock
    for it in items_validated:
        if it.get("weight") and it.get("unit"):
            # Also decrement main stock for overall inventory tracking
            db.products.update_one(
                {"id": it["product_id"], "weight_options.weight": it["weight"], "weight_options.unit": it["unit"]},
                {"$inc": {"weight_options.$.stock": -it["quantity"], "stock": -it["quantity"]}}
            )
        else:
            db.products.update_one(
                {"id": it["product_id"]},
                {"$inc": {"stock": -it["quantity"]}},
            )

    # Send email notification (gracefully skipped if no key)
    rows = "".join(
        f"<tr><td>{i['name']}</td><td>{i['quantity']}</td><td>₹{i['price']}</td><td>₹{i['line_total']}</td></tr>"
        for i in items_validated
    )
    html = f"""
    <h2 style='color:#0f4d2e;font-family:Arial'>New Order — {order_no}</h2>
    <p><b>Customer:</b> {data.customer_name}<br><b>Phone:</b> {data.customer_phone}<br><b>Email:</b> {data.customer_email or '-'}</p>
    <p><b>Address:</b><br>{data.address_line1}<br>{data.address_line2 or ''}<br>{data.city}, {data.state or ''} {data.pincode}<br>{data.country}</p>
    <p><b>Payment:</b> {data.payment_method.upper()}</p>
    <table border='1' cellpadding='6' cellspacing='0' style='font-family:Arial;border-collapse:collapse;margin-top:8px'>
      <tr style='background:#fdfbf7'><th>Item</th><th>Qty</th><th>Price</th><th>Line</th></tr>
      {rows}
      <tr><td colspan='3' align='right'><b>Subtotal</b></td><td>₹{subtotal:.0f}</td></tr>
      <tr><td colspan='3' align='right'><b>Total</b></td><td><b>₹{total:.0f}</b></td></tr>
    </table>
    {f'<p><b>Notes:</b> {data.notes}</p>' if data.notes else ''}
    """
    email_sent = await send_notification_email(f"New Shadrasa Order {order_no}", html)

    return {
        "id": doc["id"],
        "order_no": order_no,
        "total": total,
        "currency": "INR",
        "email_sent": email_sent,
        "status": "placed",
    }


@api_router.get("/orders/{order_no}")
async def get_order_by_no(order_no: str):
    doc = db.orders.find_one({"order_no": order_no}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Order not found")
    return doc


# -------- Public Site (read-only, exposes CMS content) --------
@api_router.get("/site/content")
async def site_content():
    doc = db.content.find_one({"id": "main"}, {"_id": 0})
    return doc or {}


@api_router.get("/site/categories")
async def site_categories():
    items = list(db.categories.find({"is_active": True}, {"_id": 0}).sort("sort_order", 1).limit(200))
    return items


@api_router.get("/site/products")
async def site_products(category_id: Optional[str] = None, featured: Optional[bool] = None, page: int = 1, limit: int = 500):
    q: dict = {"is_active": True}
    if category_id:
        q["category_id"] = category_id
    if featured is True:
        q["is_featured"] = True
    
    skip = (page - 1) * limit
    items = list(db.products.find(q, {"_id": 0}).sort([("sort_order", 1), ("created_at", -1)]).skip(skip).limit(limit))
    return items


@api_router.get("/products")
async def get_products_lite():
    items = list(db.products.find(
        {"is_active": True},
        {"_id": 0, "id": 1, "name": 1, "weight_options": 1}
    ).sort("name", 1))
    return items


@api_router.get("/site/banners")
async def site_banners():
    items = list(db.banners.find({"is_active": True}, {"_id": 0}).sort("sort_order", 1).limit(50))
    return items


@api_router.get("/site/gallery")
async def site_gallery():
    items = list(db.gallery.find({"is_active": True}, {"_id": 0}).sort("sort_order", 1).limit(200))
    return items


@api_router.get("/site/reviews")
async def site_reviews():
    # Only return approved or featured reviews
    items = list(db.reviews.find(
        {"status": {"$in": ["approved", "featured"]}}, 
        {"_id": 0}
    ).sort("created_at", -1).limit(50))
    return items


@api_router.post("/reviews", status_code=201)
async def submit_review(data: ReviewIn):
    doc = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "status": "pending", # Force pending on submission
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.reviews.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


# -------- Admin CMS Routes --------
@admin_router.get("/dashboard")
async def dashboard(user: dict = Depends(get_current_user)):
    pending = db.orders.count_documents({"status": {"$in": ["placed", "confirmed", "packed"]}})
    revenue_agg = list(db.orders.aggregate([
        {"$match": {"status": {"$nin": ["cancelled"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}},
    ]))
    total_revenue = revenue_agg[0]["total"] if revenue_agg else 0
    return {
        "products": db.products.count_documents({}),
        "categories": db.categories.count_documents({}),
        "banners": db.banners.count_documents({}),
        "contacts": db.contacts.count_documents({}),
        "enquiries": db.enquiries.count_documents({}),
        "active_products": db.products.count_documents({"is_active": True}),
        "low_stock": db.products.count_documents({"stock": {"$lte": 5}}),
        "orders": db.orders.count_documents({}),
        "pending_orders": pending,
        "revenue": total_revenue,
    }


@admin_router.get("/contacts")
async def admin_contacts(user: dict = Depends(get_current_user)):
    return list(db.contacts.find({}, {"_id": 0}).sort("created_at", -1).limit(500))


@admin_router.get("/enquiries")
async def admin_enquiries(user: dict = Depends(get_current_user)):
    return list(db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).limit(500))


@admin_router.get("/stats")
async def admin_stats(user: dict = Depends(get_current_user)):
    return {
        "contacts": db.contacts.count_documents({}),
        "enquiries": db.enquiries.count_documents({}),
    }


@admin_router.put("/enquiries/{eid}/status")
async def update_enquiry_status(eid: str, data: StatusUpdate, user: dict = Depends(get_current_user)):
    res = db.enquiries.update_one({"id": eid}, {"$set": {"status": data.status}})
    if res.matched_count == 0:
        raise HTTPException(404, "Enquiry not found")
    return {"ok": True}


@admin_router.put("/contacts/{cid}/status")
async def update_contact_status(cid: str, data: StatusUpdate, user: dict = Depends(get_current_user)):
    res = db.contacts.update_one({"id": cid}, {"$set": {"status": data.status}})
    if res.matched_count == 0:
        raise HTTPException(404, "Contact not found")
    return {"ok": True}


# ---- Orders ----
@admin_router.get("/orders")
async def list_orders(user: dict = Depends(get_current_user), status: Optional[str] = None):
    q: dict = {}
    if status:
        q["status"] = status
    return list(db.orders.find(q, {"_id": 0}).sort("created_at", -1).limit(1000))


@admin_router.get("/orders/{oid}")
async def get_order(oid: str, user: dict = Depends(get_current_user)):
    doc = db.orders.find_one({"id": oid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Order not found")
    return doc


@admin_router.put("/orders/{oid}/status")
async def update_order_status(oid: str, data: StatusUpdate, user: dict = Depends(get_current_user)):
    res = db.orders.update_one({"id": oid}, {"$set": {"status": data.status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    if res.matched_count == 0:
        raise HTTPException(404, "Order not found")
    return db.orders.find_one({"id": oid}, {"_id": 0})


# ---- Invoices ----
@admin_router.get("/invoices")
async def list_invoices(user: dict = Depends(get_current_user)):
    return list(db.invoices.find({}, {"_id": 0}).sort("created_at", -1).limit(1000))


@admin_router.get("/invoices/{iid}")
async def get_invoice(iid: str, user: dict = Depends(get_current_user)):
    doc = db.invoices.find_one({"id": iid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Invoice not found")
    return doc


@api_router.get("/invoices/{iid}/pdf")
async def public_invoice_pdf(iid: str):
    doc = db.invoices.find_one({"id": iid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Invoice not found")
    pdf_bytes = generate_invoice_pdf_bytes(doc)
    safe_name = doc.get("owner_name", "Client").replace(" ", "")
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=Shadrasa_Invoice_{safe_name}.pdf"},
    )


@admin_router.post("/invoices", status_code=201)
async def create_invoice(data: InvoiceIn, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    # Generate Invoice Number INV-YYMMDD-XXXX
    suffix = uuid.uuid4().hex[:4].upper()
    invoice_no = f"INV-{now.strftime('%y%m%d')}-{suffix}"

    doc = {
        "id": str(uuid.uuid4()),
        "invoice_no": invoice_no,
        **data.model_dump(),
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    db.invoices.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


def generate_invoice_pdf_bytes(invoice: dict) -> bytes:
    pdf = FPDF(format="A4")
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # 1. Header (Logo / Company Name left, INVOICE right)
    pdf.set_font("Arial", "B", 24)
    # Use text as logo for now since we don't have an image file
    pdf.set_text_color(0, 51, 102) # Dark blue for logo
    pdf.cell(100, 10, "SHADRASA", ln=False)
    
    pdf.set_font("Arial", "B", 28)
    pdf.set_text_color(50, 50, 50)
    pdf.cell(0, 10, "INVOICE", ln=True, align="R")
    pdf.ln(5)

    # Company Details (Left) and Invoice Details (Right)
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(80, 80, 80)
    
    y_before = pdf.get_y()
    
    # Left side - Company details
    pdf.cell(100, 5, "Business Type: Honey, Pickles, Bird Eye Chilli", ln=True)
    pdf.cell(100, 5, "Phone: +91 73385 42117", ln=True)
    pdf.cell(100, 5, "Email: shadrasa.india@gmail.com", ln=True)
    pdf.cell(100, 5, "Address: Karnataka, India", ln=True)
    
    y_after_company = pdf.get_y()
    
    # Right side - Invoice Details
    pdf.set_xy(110, y_before)
    pdf.set_font("Arial", "B", 10)
    pdf.cell(40, 5, "Invoice #:", ln=False)
    pdf.set_font("Arial", "", 10)
    pdf.cell(0, 5, invoice.get('invoice_no', ''), ln=True)
    
    pdf.set_x(110)
    pdf.set_font("Arial", "B", 10)
    pdf.cell(40, 5, "Invoice Date:", ln=False)
    pdf.set_font("Arial", "", 10)
    date_str = invoice.get('created_at', '')[:10] if invoice.get('created_at') else ''
    pdf.cell(0, 5, date_str, ln=True)

    pdf.set_x(110)
    pdf.set_font("Arial", "B", 10)
    pdf.cell(40, 5, "Payment Status:", ln=False)
    pdf.set_font("Arial", "", 10)
    pdf.cell(0, 5, invoice.get('payment_status', ''), ln=True)

    pdf.set_y(max(y_after_company, pdf.get_y()) + 15)

    # 2. Bill To Section
    pdf.set_font("Arial", "B", 11)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(100, 6, "Bill To:", ln=True)
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(80, 80, 80)
    
    owner_name = invoice.get('owner_name', '')
    if owner_name:
        pdf.cell(100, 5, owner_name, ln=True)
    shop_name = invoice.get('shop_name', '')
    if shop_name:
        pdf.cell(100, 5, shop_name, ln=True)
        
    address = invoice.get('address', '')
    if address:
        x = pdf.get_x()
        y = pdf.get_y()
        pdf.multi_cell(100, 5, address)
        pdf.set_xy(x, pdf.get_y())
        
    phone = invoice.get('phone', '')
    if phone:
        pdf.cell(100, 5, f"Phone: {phone}", ln=True)
        
    gst = invoice.get('gst_number', '')
    if gst:
        pdf.cell(100, 5, f"GSTIN: {gst}", ln=True)

    pdf.ln(10)

    # 3. Table Header
    pdf.set_fill_color(100, 100, 100)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Arial", "B", 10)
    
    pdf.cell(15, 8, "Item", border=1, fill=True, align="C")
    pdf.cell(85, 8, "Description", border=1, fill=True, align="L")
    pdf.cell(20, 8, "Qty", border=1, fill=True, align="C")
    pdf.cell(35, 8, "Unit Price", border=1, fill=True, align="R")
    pdf.cell(35, 8, "Total", border=1, fill=True, align="R")
    pdf.ln()

    # 4. Table Rows
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", "", 10)
    
    items = invoice.get('items', [])
    idx = 0
    for idx, item in enumerate(items, 1):
        pdf.cell(15, 8, str(idx), border=1, align="C")
        pdf.cell(85, 8, str(item.get('name', '')), border=1, align="L")
        pdf.cell(20, 8, str(item.get('quantity', '')), border=1, align="C")
        pdf.cell(35, 8, f"Rs. {item.get('price', 0):.2f}", border=1, align="R")
        pdf.cell(35, 8, f"Rs. {item.get('line_total', 0):.2f}", border=1, align="R")
        pdf.ln()

    # Empty rows to fill space
    while idx < 5:
        idx += 1
        pdf.cell(15, 8, "", border=1)
        pdf.cell(85, 8, "", border=1)
        pdf.cell(20, 8, "", border=1)
        pdf.cell(35, 8, "", border=1)
        pdf.cell(35, 8, "", border=1)
        pdf.ln()

    pdf.ln(5)

    # 5. Totals Section (Bottom Right)
    y_before_totals = pdf.get_y()
    
    pdf.set_x(120)
    pdf.set_font("Arial", "", 10)
    pdf.cell(35, 7, "Invoice Subtotal", border=1, align="R")
    pdf.cell(35, 7, f"Rs. {invoice.get('subtotal', 0):.2f}", border=1, align="R")
    pdf.ln()
    
    tax_rate = invoice.get('tax_rate', 0)
    if tax_rate > 0:
        pdf.set_x(120)
        pdf.cell(35, 7, f"Tax Rate", border=1, align="R")
        pdf.cell(35, 7, f"{tax_rate}%", border=1, align="R")
        pdf.ln()
        
        pdf.set_x(120)
        pdf.cell(35, 7, "Sales Tax", border=1, align="R")
        pdf.cell(35, 7, f"Rs. {invoice.get('tax_amount', 0):.2f}", border=1, align="R")
        pdf.ln()
        
    discount = invoice.get('discount', 0)
    if discount > 0:
        pdf.set_x(120)
        pdf.cell(35, 7, "Discount", border=1, align="R")
        pdf.cell(35, 7, f"-Rs. {discount:.2f}", border=1, align="R")
        pdf.ln()

    pdf.set_x(120)
    pdf.set_font("Arial", "B", 10)
    pdf.cell(35, 8, "TOTAL", border=1, align="R")
    pdf.cell(35, 8, f"Rs. {invoice.get('total', 0):.2f}", border=1, align="R")
    pdf.ln()
    
    y_after_totals = pdf.get_y()

    # 6. Notes / Terms (Bottom Left)
    pdf.set_xy(10, y_before_totals)
    if invoice.get('notes'):
        pdf.set_font("Arial", "B", 10)
        pdf.cell(100, 5, "Notes / Terms:", ln=True)
        pdf.set_font("Arial", "", 9)
        pdf.set_text_color(80, 80, 80)
        pdf.multi_cell(100, 5, invoice.get('notes', ''))
    
    # Move past totals
    pdf.set_y(max(pdf.get_y(), y_after_totals) + 15)
    
    # 7. Footer / Signature
    pdf.set_y(-40)
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 5, "_______________________", ln=True, align="R")
    pdf.cell(0, 5, "Authorized Signature    ", ln=True, align="R")
    
    pdf.set_y(-20)
    pdf.set_font("Arial", "I", 9)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 5, "Thank you for your business!", ln=True, align="C")

    output = BytesIO()
    output.write(pdf.output(dest='S').encode('latin1'))
    return output.getvalue()


@admin_router.post("/invoices/upload")
async def upload_invoice_file(
    request: Request,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF uploads are supported.")

    safe_name = file.filename.split("/")[-1].split("\\")[-1]
    filename = f"{uuid.uuid4().hex}_{safe_name}"
    file_path = UPLOADS_DIR / filename

    contents = await file.read()
    file_path.write_bytes(contents)

    base_url = str(request.base_url).rstrip("/")
    file_url = f"{base_url}/uploads/{filename}"
    return {"url": file_url}


@admin_router.get("/invoices/{iid}/pdf")
async def invoice_pdf(iid: str, user: dict = Depends(get_current_user)):
    invoice = db.invoices.find_one({"id": iid}, {"_id": 0})
    if not invoice:
        raise HTTPException(404, "Invoice not found")
    pdf_bytes = generate_invoice_pdf_bytes(invoice)
    safe_name = invoice.get("owner_name", "Client").replace(" ", "")
    return StreamingResponse(BytesIO(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": f"inline; filename=Shadrasa_Invoice_{safe_name}.pdf"})


@admin_router.post("/invoices/{iid}/publish")
async def publish_invoice_pdf(iid: str, request: Request, user: dict = Depends(get_current_user)):
    invoice = db.invoices.find_one({"id": iid}, {"_id": 0})
    if not invoice:
        raise HTTPException(404, "Invoice not found")
    pdf_bytes = generate_invoice_pdf_bytes(invoice)
    safe_name = invoice.get("owner_name", "Client").replace(" ", "")
    filename = f"{uuid.uuid4().hex}_Shadrasa_Invoice_{safe_name}.pdf"
    file_path = UPLOADS_DIR / filename
    file_path.write_bytes(pdf_bytes)
    base_url = str(request.base_url).rstrip("/")
    file_url = f"{base_url}/uploads/{filename}"
    return {"url": file_url}


@admin_router.put("/invoices/{iid}")
async def update_invoice(iid: str, data: InvoiceIn, user: dict = Depends(get_current_user)):
    payload = data.model_dump()
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = db.invoices.update_one({"id": iid}, {"$set": payload})
    if res.matched_count == 0:
        raise HTTPException(404, "Invoice not found")
    return db.invoices.find_one({"id": iid}, {"_id": 0})


@admin_router.delete("/invoices/{iid}")
async def delete_invoice(iid: str, user: dict = Depends(get_current_user)):
    res = db.invoices.delete_one({"id": iid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Invoice not found")
    return {"ok": True}


# ---- Categories ----
@admin_router.get("/categories")
async def list_categories(user: dict = Depends(get_current_user)):
    return list(db.categories.find({}, {"_id": 0}).sort("sort_order", 1).limit(200))


@admin_router.post("/categories", status_code=201)
async def create_category(data: CategoryIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if not doc.get("slug"):
        doc["slug"] = doc["name"].lower().replace(" ", "-")
    db.categories.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


@admin_router.put("/categories/{cid}")
async def update_category(cid: str, data: CategoryIn, user: dict = Depends(get_current_user)):
    payload = {k: v for k, v in data.model_dump().items() if v is not None}
    res = db.categories.update_one({"id": cid}, {"$set": payload})
    if res.matched_count == 0:
        raise HTTPException(404, "Category not found")
    return db.categories.find_one({"id": cid}, {"_id": 0})


@admin_router.delete("/categories/{cid}")
async def delete_category(cid: str, user: dict = Depends(get_current_user)):
    res = db.categories.delete_one({"id": cid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Category not found")
    return {"ok": True}


# ---- Products ----
@admin_router.get("/products")
async def list_products(user: dict = Depends(get_current_user)):
    return list(db.products.find({"is_active": {"$ne": False}}, {"_id": 0}).sort([("sort_order", 1), ("created_at", -1)]).limit(500))


@admin_router.post("/products", status_code=201)
async def create_product(data: ProductIn, user: dict = Depends(get_current_user)):
    payload = data.model_dump()
    
    if payload.get("weight_options"):
        for opt in payload["weight_options"]:
            if opt.get("image") and opt["image"].startswith("data:image"):
                processed = process_and_save_image(opt["image"], prefix="prod_opt")
                opt["image"] = processed["url"]
                opt["blur_image"] = processed["blur"]
                
        # Auto-calculate main price and stock from options
        payload["price"] = payload["weight_options"][0]["price"]
        payload["sale_price"] = payload["weight_options"][0].get("sale_price")
        payload["stock"] = sum(opt.get("stock", 0) for opt in payload["weight_options"])
        
    if payload.get("image"):
        processed = process_and_save_image(payload["image"], prefix="prod")
        payload["image"] = processed["url"]
        payload["blur_image"] = processed["blur"]
        
    doc = {
        "id": str(uuid.uuid4()),
        **payload,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    # auto-fill category_name from category_id
    if doc.get("category_id") and not doc.get("category_name"):
        cat = db.categories.find_one({"id": doc["category_id"]}, {"_id": 0})
        if cat:
            doc["category_name"] = cat["name"]
    db.products.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


@admin_router.put("/products/{pid}")
async def update_product(pid: str, data: ProductIn, user: dict = Depends(get_current_user)):
    payload = data.model_dump()
    
    if payload.get("weight_options"):
        for opt in payload["weight_options"]:
            if opt.get("image") and opt["image"].startswith("data:image"):
                processed = process_and_save_image(opt["image"], prefix="prod_opt")
                opt["image"] = processed["url"]
                opt["blur_image"] = processed["blur"]
                
        # Auto-calculate main price and stock from options
        payload["price"] = payload["weight_options"][0]["price"]
        payload["sale_price"] = payload["weight_options"][0].get("sale_price")
        payload["stock"] = sum(opt.get("stock", 0) for opt in payload["weight_options"])

    if payload.get("image") and payload["image"].startswith("data:image"):
        processed = process_and_save_image(payload["image"], prefix="prod")
        payload["image"] = processed["url"]
        payload["blur_image"] = processed["blur"]
        
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    if payload.get("category_id"):
        cat = db.categories.find_one({"id": payload["category_id"]}, {"_id": 0})
        if cat:
            payload["category_name"] = cat["name"]
    res = db.products.update_one({"id": pid}, {"$set": payload})
    if res.matched_count == 0:
        raise HTTPException(404, "Product not found")
    return db.products.find_one({"id": pid}, {"_id": 0})


@admin_router.delete("/products/{pid}")
async def delete_product(pid: str, user: dict = Depends(get_current_user)):
    res = db.products.update_one({"id": pid}, {"$set": {"is_active": False}})
    if res.matched_count == 0:
        raise HTTPException(404, "Product not found")
    return {"ok": True}


# ---- Banners ----
@admin_router.get("/banners")
async def list_banners(user: dict = Depends(get_current_user)):
    return list(db.banners.find({}, {"_id": 0}).sort("sort_order", 1).limit(50))


@admin_router.post("/banners", status_code=201)
async def create_banner(data: BannerIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.banners.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


@admin_router.put("/banners/{bid}")
async def update_banner(bid: str, data: BannerIn, user: dict = Depends(get_current_user)):
    res = db.banners.update_one({"id": bid}, {"$set": data.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(404, "Banner not found")
    return db.banners.find_one({"id": bid}, {"_id": 0})


@admin_router.delete("/banners/{bid}")
async def delete_banner(bid: str, user: dict = Depends(get_current_user)):
    res = db.banners.delete_one({"id": bid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Banner not found")
    return {"ok": True}


# ---- Gallery ----
@admin_router.get("/gallery")
async def list_gallery(user: dict = Depends(get_current_user)):
    return list(db.gallery.find({}, {"_id": 0}).sort("sort_order", 1).limit(200))


@admin_router.post("/gallery", status_code=201)
async def create_gallery(data: GalleryIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.gallery.insert_one(doc.copy())
    doc.pop("_id", None)
    return doc


@admin_router.put("/gallery/{gid}")
async def update_gallery(gid: str, data: GalleryIn, user: dict = Depends(get_current_user)):
    res = db.gallery.update_one({"id": gid}, {"$set": data.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(404, "Gallery item not found")
    return db.gallery.find_one({"id": gid}, {"_id": 0})


@admin_router.delete("/gallery/{gid}")
async def delete_gallery(gid: str, user: dict = Depends(get_current_user)):
    res = db.gallery.delete_one({"id": gid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Gallery item not found")
    return {"ok": True}


# ---- Reviews ----
@admin_router.get("/reviews")
async def list_reviews(user: dict = Depends(get_current_user)):
    return list(db.reviews.find({}, {"_id": 0}).sort("created_at", -1).limit(200))


@admin_router.put("/reviews/{rid}")
async def update_review(rid: str, data: ReviewIn, user: dict = Depends(get_current_user)):
    res = db.reviews.update_one({"id": rid}, {"$set": data.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(404, "Review not found")
    return db.reviews.find_one({"id": rid}, {"_id": 0})


@admin_router.delete("/reviews/{rid}")
async def delete_review(rid: str, user: dict = Depends(get_current_user)):
    res = db.reviews.delete_one({"id": rid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Review not found")
    return {"ok": True}


# ---- Content ----
@admin_router.get("/content")
async def get_content(user: dict = Depends(get_current_user)):
    doc = db.content.find_one({"id": "main"}, {"_id": 0})
    return doc or {"id": "main"}


@admin_router.put("/content")
async def update_content(data: ContentIn, user: dict = Depends(get_current_user)):
    payload = {k: v for k, v in data.model_dump().items() if v is not None}
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    db.content.update_one({"id": "main"}, {"$set": payload}, upsert=True)
    return db.content.find_one({"id": "main"}, {"_id": 0})


# -------- Startup / Seeding --------
DEFAULT_CONTENT = {
    "id": "main",
    "hero_eyebrow": "Est. Karnataka · India",
    "hero_heading": "Welcome to Shadrasa",
    "hero_subheading": "Bringing Authentic Malenadu Taste to Every Home",
    "hero_cta_primary_label": "Explore Products",
    "hero_cta_secondary_label": "Contact Us",
    "about_eyebrow": "Our Story",
    "about_heading": "About Shadrasa",
    "about_body": "Shadrasa is a proudly homemade Malenadu food brand dedicated to preserving the authentic taste of traditional recipes. Every product is prepared in small batches using carefully selected ingredients, hygienic methods, and time-tested family traditions handed down through generations in the lush green hills of Karnataka.",
    "about_image": "https://static.prod-images.emergentagent.com/jobs/cc798c37-0d6b-4dd4-bae2-7f1634f5fc87/images/31a9bf84392f042b3f2a3f227f2e1dc646946f3e87f197b0643d501b21dfef8f.png",
    "mission_title": "Our Mission",
    "mission_body": "To deliver natural, premium and memorable taste experiences crafted with love and tradition.",
    "vision_title": "Our Vision",
    "vision_body": "To become a trusted traditional food brand across India and beyond, carrying Malenadu's heritage forward.",
    "heritage_eyebrow": "Experience Shadrasa",
    "heritage_heading": "From the lush green lands of Malenadu",
    "heritage_body": "We bring purity, tradition and authentic flavors crafted with love — straight from Karnataka's mist-kissed valleys to your kitchen.",
    "heritage_image": "https://images.pexels.com/photos/16300779/pexels-photo-16300779.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900",
    "heritage_button_label": "Watch Brand Story",
    "stat_customers": 5000,
    "stat_quality": 100,
    "stat_natural": 100,
    "stat_recipes": 25,
    "business_heading": "Dealers, Retailers & Distributors Welcome",
    "business_body": "Partner with Shadrasa and grow with premium traditional products that customers love and trust. Strong margins, exclusive territories, and full marketing support.",
    "contact_phone": "+91 7338542117",
    "contact_email": "shadrasa.india@gmail.com",
    "contact_address": "Karnataka, India",
    "whatsapp_number": "917338542117",
    "footer_tagline": "Bringing authentic Malenadu taste to every home — premium homemade pickles and pure natural honey, crafted with tradition from the heart of Karnataka.",
}

DEFAULT_CATEGORIES = [
    {"name": "Pickles", "slug": "pickles", "description": "Traditional handmade pickles", "sort_order": 1},
    {"name": "Honey", "slug": "honey", "description": "Pure natural forest honey", "sort_order": 2},
]

DEFAULT_PRODUCTS = [
    {
        "name": "Jeerige Midi Maavu Pickle",
        "tagline": "Heritage Mango Pickle",
        "description": "Traditional mango pickle blended with jeerige and authentic spices for rich aroma and bold taste — sun-cured and prepared in small artisan batches.",
        "category_slug": "pickles",
        "price": 349,
        "stock": 50,
        "weight": 500,
        "unit": "g",
        "image": "https://images.pexels.com/photos/7812134/pexels-photo-7812134.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=900",
        "premium_badge": "Premium Batch",
        "is_featured": True,
        "sort_order": 1,
    },
    {
        "name": "Pure Natural Honey",
        "tagline": "Forest Wild Honey",
        "description": "Collected naturally from the lush forests of Malenadu and packed carefully with rich flavour and wellness goodness — no additives, never heated.",
        "category_slug": "honey",
        "price": 499,
        "stock": 40,
        "image": "https://images.pexels.com/photos/5634206/pexels-photo-5634206.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=900",
        "premium_badge": "Premium Batch",
        "is_featured": True,
        "sort_order": 2,
    },
]

DEFAULT_BANNERS = [
    {"image": "https://static.prod-images.emergentagent.com/jobs/cc798c37-0d6b-4dd4-bae2-7f1634f5fc87/images/a49a777a9a98d03c379337a2f3d0ad8160e11fca05440ecf0b80cb2adc13c857.png", "sort_order": 1, "is_active": True},
    {"image": "https://static.prod-images.emergentagent.com/jobs/cc798c37-0d6b-4dd4-bae2-7f1634f5fc87/images/9c6384c45b25b0e273bdcd6b3ddafdf41e6a5c36ef90176bff1678398325ff5a.png", "sort_order": 2, "is_active": True},
    {"image": "https://images.pexels.com/photos/8500508/pexels-photo-8500508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900", "sort_order": 3, "is_active": True},
    {"image": "https://static.prod-images.emergentagent.com/jobs/cc798c37-0d6b-4dd4-bae2-7f1634f5fc87/images/31a9bf84392f042b3f2a3f227f2e1dc646946f3e87f197b0643d501b21dfef8f.png", "sort_order": 4, "is_active": True},
]

DEFAULT_GALLERY = [
    {"type": "image", "url": "https://static.prod-images.emergentagent.com/jobs/cc798c37-0d6b-4dd4-bae2-7f1634f5fc87/images/e84680ac840e149faf37cdbefef32eccba214d2ee0eb9299994073cb34aba1f2.png", "title": "Banana leaf traditional spread", "category": "Food", "sort_order": 1, "is_active": True},
    {"type": "image", "url": "https://images.pexels.com/photos/31280796/pexels-photo-31280796.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "title": "Honey collection", "category": "Farm", "sort_order": 2, "is_active": True},
    {"type": "image", "url": "https://images.pexels.com/photos/12299536/pexels-photo-12299536.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "title": "Spice market", "category": "Ingredients", "sort_order": 3, "is_active": True},
    {"type": "image", "url": "https://images.pexels.com/photos/16300779/pexels-photo-16300779.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "title": "Misty hills", "category": "Origin", "sort_order": 4, "is_active": True},
    {"type": "image", "url": "https://images.pexels.com/photos/7812134/pexels-photo-7812134.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "title": "Pickle jars", "category": "Products", "sort_order": 5, "is_active": True},
    {"type": "image", "url": "https://images.pexels.com/photos/8500508/pexels-photo-8500508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "title": "Honey jar", "category": "Products", "sort_order": 6, "is_active": True},
]

DEFAULT_REVIEWS = [
    {"name": "Anjali Rao", "location": "Bengaluru, Karnataka", "rating": 5, "text": "The Jeerige Midi pickle reminds me of my grandmother's kitchen. Authentic, fresh and packed with love. I order every month.", "status": "featured", "is_verified_purchase": True},
    {"name": "Rohit Shenoy", "location": "Mangalore", "rating": 5, "text": "Shadrasa honey is the purest I've tasted in years. You can tell it's straight from the forest. My kids are obsessed.", "status": "approved", "is_verified_purchase": True},
    {"name": "Lakshmi Iyer", "location": "Chennai", "rating": 5, "text": "Premium packaging, premium taste. Feels like a luxury brand but with the warmth of homemade. Highly recommended for gifting.", "status": "approved", "is_verified_purchase": True},
]


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@shadrasa.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = db.users.find_one({"email": admin_email})
    if existing is None:
        db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Shadrasa Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )


async def seed_cms():
    # Content
    if not db.content.find_one({"id": "main"}):
        doc = {**DEFAULT_CONTENT, "updated_at": datetime.now(timezone.utc).isoformat()}
        db.content.insert_one(doc.copy())
        logger.info("Seeded default content")

    # Categories
    cat_id_by_slug = {}
    for c in DEFAULT_CATEGORIES:
        existing = db.categories.find_one({"slug": c["slug"]}, {"_id": 0})
        if existing:
            cat_id_by_slug[c["slug"]] = existing["id"]
            continue
        doc = {
            "id": str(uuid.uuid4()),
            "name": c["name"], "slug": c["slug"],
            "description": c.get("description"),
            "is_active": True, "sort_order": c.get("sort_order", 0),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        db.categories.insert_one(doc.copy())
        cat_id_by_slug[c["slug"]] = doc["id"]

    # Products
    for p in DEFAULT_PRODUCTS:
        if db.products.find_one({"name": p["name"]}):
            continue
        cid = cat_id_by_slug.get(p["category_slug"])
        cname = next((c["name"] for c in DEFAULT_CATEGORIES if c["slug"] == p["category_slug"]), None)
        doc = {
            "id": str(uuid.uuid4()),
            "name": p["name"], "tagline": p["tagline"], "description": p["description"],
            "category_id": cid, "category_name": cname,
            "price": p["price"], "sale_price": None, "currency": "INR",
            "stock": p["stock"], "image": p["image"],
            "premium_badge": p.get("premium_badge"),
            "is_featured": p.get("is_featured", False),
            "is_active": True, "sort_order": p.get("sort_order", 0),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        db.products.insert_one(doc.copy())

    # Banners
    if db.banners.count_documents({}) == 0:
        for b in DEFAULT_BANNERS:
            doc = {
                "id": str(uuid.uuid4()),
                "title": None, "subtitle": None,
                "image": b["image"], "cta_label": None, "cta_href": None,
                "is_active": b.get("is_active", True),
                "sort_order": b.get("sort_order", 0),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            db.banners.insert_one(doc.copy())

    # Gallery
    if db.gallery.count_documents({}) == 0:
        for g in DEFAULT_GALLERY:
            doc = {
                "id": str(uuid.uuid4()),
                "title": g["title"],
                "type": g["type"],
                "url": g["url"],
                "category": g["category"],
                "is_active": g.get("is_active", True),
                "sort_order": g.get("sort_order", 0),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            db.gallery.insert_one(doc.copy())

    # Reviews
    if db.reviews.count_documents({}) == 0:
        for r in DEFAULT_REVIEWS:
            doc = {
                "id": str(uuid.uuid4()),
                "name": r["name"],
                "location": r["location"],
                "rating": r["rating"],
                "text": r["text"],
                "image": None,
                "status": r["status"],
                "is_verified_purchase": r["is_verified_purchase"],
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            db.reviews.insert_one(doc.copy())


@app.on_event("startup")
async def startup():
    if db is None:
        print("DB not connected, skipping startup tasks")
        return
    db.users.create_index("email", unique=True)
    db.users.create_index("id", unique=True)
    db.products.create_index("id", unique=True)
    db.categories.create_index("id", unique=True)
    db.categories.create_index("slug", unique=True)
    db.banners.create_index("id", unique=True)
    db.content.create_index("id", unique=True)
    db.contacts.create_index("created_at")
    db.enquiries.create_index("created_at")
    db.orders.create_index("id", unique=True)
    db.orders.create_index("order_no", unique=True)
    db.orders.create_index("created_at")
    db.invoices.create_index("id", unique=True)
    db.invoices.create_index("invoice_no", unique=True)
    await seed_admin()
    await seed_cms()


@app.on_event("shutdown")
async def shutdown_db_client():
    if client is not None:
        client.close()


# -------- Mount --------
app.include_router(api_router)
app.include_router(admin_router)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

cors_origins_env = os.environ.get("CORS_ORIGINS", "*")
if cors_origins_env == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origin_regex=".*",
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origins=cors_origins_env.split(","),
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Log basic startup info for Render logs and debugging
logger.info(f"Shadrasa API initialized. DB connected: {db is not None}")
