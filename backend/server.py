from dotenv import load_dotenv
from pathlib import Path
import os
import asyncio
import logging
import uuid
import bcrypt
import jwt
import resend
import certifi

from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------------- LOAD ENV ----------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

app = FastAPI(title="Shadrasa API")

# ---------------- MONGODB ----------------
mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME", "shadrasa_db")

client = None
db = None

if mongo_url:
    try:
        client = AsyncIOMotorClient(
            mongo_url,
            tls=True,
            tlsCAFile=certifi.where()
        )
        db = client[db_name]
        print("✅ MongoDB connected")
    except Exception as e:
        print("❌ MongoDB connection failed:", e)
else:
    print("⚠️ MONGO_URL not found")

# ---------------- STARTUP ----------------
@app.on_event("startup")
async def startup():
    if db is None:
        print("❌ DB not connected")
        return

    print("🚀 Running startup...")

    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)

    await db.products.create_index("id", unique=True)
    await db.categories.create_index("id", unique=True)

    await db.orders.create_index("id", unique=True)
    await db.orders.create_index("order_no", unique=True)

    print("✅ Startup complete")

# ---------------- BASIC ROUTE ----------------
@app.get("/")
async def root():
    return {"message": "API Working 🚀"}

# ---------------- AUTH ----------------
JWT_ALGORITHM = "HS256"

def get_secret():
    return os.environ.get("JWT_SECRET", "secret")

def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(p, h):
    return bcrypt.checkpw(p.encode(), h.encode())

def create_token(user_id, email):
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8)
    }
    return jwt.encode(payload, get_secret(), algorithm=JWT_ALGORITHM)

# ---------------- LOGIN ----------------
class Login(BaseModel):
    email: EmailStr
    password: str

@app.post("/login")
async def login(data: Login):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid login")

    token = create_token(user["id"], user["email"])
    return {"token": token}

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)