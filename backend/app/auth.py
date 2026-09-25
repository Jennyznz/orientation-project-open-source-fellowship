
from datetime import datetime, timedelta, timezone
 
import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
 
from app.config import settings
from app.database import get_db
from app.models import User

SIGNING_ALGO = "HS256"
EXPIRE_MINS = 60

class Credentials(BaseModel):
    email: str
    password: str = Field(max_length=72)  # bcrypt's input limit
 
 
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
 
 
def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())
 
 
def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINS)
    return jwt.encode({"sub": user_id, "exp": expire}, settings.jwt_secret_key, algorithm=SIGNING_ALGO)

router = APIRouter(prefix="/api/auth", tags=["auth"])
bearer = HTTPBearer()

@router.post("/signup", response_model=Token, status_code=201)
def signup(body: Credentials, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=body.email, hashed_password=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return Token(access_token=create_token(user.id))
 
 
@router.post("/login", response_model=Token)
def login(body: Credentials, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.hashed_password or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return Token(access_token=create_token(user.id))

def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(creds.credentials, settings.jwt_secret_key, algorithms=[ALGORITHM])
        user = db.get(User, payload["sub"])
    except (jwt.PyJWTError, KeyError):
        user = None
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user
 