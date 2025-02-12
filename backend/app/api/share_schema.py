from pydantic import BaseModel
from datetime import datetime

# common schema
class User(BaseModel):
    id: int
    email: str
    password: str
    count_login: int
    verified: bool
    role: str
    plan: str
    created_at: datetime
    expired_at: datetime

    class Config:
        from_attributes = True
