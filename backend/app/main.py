from typing import Union
from fastapi import FastAPI
from pathlib import Path
import importlib
import pkgutil

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.api.create_user.router import router as create_user_router
from app.api.get_test.router import router as get_test_router

from app.db.database import engine, Base
from app.db.models import (
    user as user_model,
    session as session_model,
    detection_log as detection_log_model,
)


def init_db():
    Base.metadata.create_all(bind=engine)


from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


api_dir = Path(__file__).parent / "api"


print(api_dir)

# auto import router
for api in api_dir.iterdir():
    if api.is_dir():  # folder(each endpoint)
        router_module = f"app.api.{api.name}.router"
        try:
            module = importlib.import_module(router_module)
            if hasattr(module, "router"):
                app.include_router(module.router)
                print(f"✅ router added: {router_module}")  # debug
        except ModuleNotFoundError:
            if api.name == "__pycache__" or api.name == "__init__":
                continue
            print(f"⚠️ {router_module} not found (router.py is missing)")
