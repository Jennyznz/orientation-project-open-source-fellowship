
from datetime import datetime, timedelta, timezone
 
import bcrypt
import jwt
 
from app.config import settings

SIGNING_ALGO = "HS256"
EXPIRE_MINS = 60

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
 
 
def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())
 
 
def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINS)
    return jwt.encode({"sub": user_id, "exp": expire}, settings.jwt_secret_key, algorithm=SIGNING_ALGO)
 