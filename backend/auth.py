"""
AquaCop – JWT Authentication
Two roles: officer, citizen.
Includes demo user seeding for development.
"""
import os
import uuid
from datetime import datetime, timedelta
from typing import Optional

import hashlib
import hmac
import secrets
import jwt

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except ImportError:
    pwd_context = None

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from models import User, get_db

SECRET_KEY = os.getenv("SECRET_KEY", "aquacop-dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    if pwd_context:
        try:
            return pwd_context.hash(password)
        except Exception:
            pass
    # Standard library fallback using PBKDF2 HMAC SHA-256
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()
    return f"pbkdf2${salt}${key}"


def verify_password(plain: str, hashed: str) -> bool:
    if hashed.startswith("pbkdf2$"):
        parts = hashed.split("$")
        if len(parts) == 3:
            salt, key = parts[1], parts[2]
            computed = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), 100000).hex()
            return hmac.compare_digest(key, computed) if 'hmac' in globals() else key == computed
    if pwd_context:
        try:
            return pwd_context.verify(plain, hashed)
        except Exception:
            pass
    return plain == hashed


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Extract user from JWT token. Returns None if no token (guest access allowed)."""
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id).first()


async def require_officer(
    user: Optional[User] = Depends(get_current_user),
) -> User:
    """Require authenticated officer role."""
    if not user or user.role != "officer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Officer access required",
        )
    return user


async def require_citizen(
    user: Optional[User] = Depends(get_current_user),
) -> User:
    """Require authenticated citizen role."""
    if not user or user.role != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Citizen access required",
        )
    return user


# ── Demo Users (seeded on first run) ────────────────────────────────────────

DEMO_USERS = [
    {
        "id": "officer-raman",
        "email": "raman.officer@aquacop.gov.in",
        "name": "Inspector S. Ramanathan",
        "password": "officer123",
        "role": "officer",
        "department": "Chennai Coastal Zone Authority",
        "badge_id": "CZA-OFF-1042",
    },
    {
        "id": "officer-kavitha",
        "email": "kavitha@aquacop.gov.in",
        "name": "Divisional Engineer M. Kavitha",
        "password": "officer123",
        "role": "officer",
        "department": "Water Resources Division – WRD",
        "badge_id": "WRD-DE-2081",
    },
    {
        "id": "citizen-priya",
        "email": "priya.citizen@aquaguard.org",
        "name": "Priya Sharma",
        "password": "citizen123",
        "role": "citizen",
        "department": "Citizen Water Guardians Network",
        "badge_id": "CWG-IND-552",
    },
    {
        "id": "citizen-karthik",
        "email": "karthik@gmail.com",
        "name": "Karthik Subramanian",
        "password": "citizen123",
        "role": "citizen",
        "department": None,
        "badge_id": None,
    },
]


def seed_demo_users(db: Session):
    """Create demo users if they don't exist."""
    for user_data in DEMO_USERS:
        existing = db.query(User).filter(User.id == user_data["id"]).first()
        if not existing:
            user = User(
                id=user_data["id"],
                email=user_data["email"],
                name=user_data["name"],
                hashed_password=hash_password(user_data["password"]),
                role=user_data["role"],
                department=user_data.get("department"),
                badge_id=user_data.get("badge_id"),
            )
            db.add(user)
    db.commit()
