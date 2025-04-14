from passlib.context import CryptContext
import jwt
import os
from datetime import datetime, timedelta
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_admin_token(admin_id: int) -> str:
    expiration = datetime.utcnow() + timedelta(days=1)
    data = {
        "sub": str(admin_id),
        "exp": expiration,
        "is_admin": True
    }
    return jwt.encode(data, os.getenv("JWT_SECRET_KEY", "your-secret-key"), algorithm="HS256")

def decode_admin_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET_KEY", "your-secret-key"), algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None
