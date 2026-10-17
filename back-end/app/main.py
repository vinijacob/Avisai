from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (registers tables on Base.metadata)
from app.config import get_settings
from app.db import Base, engine
from app.routers import auth, events, users


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None]:
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="Avisaí API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (auth.router, events.router, users.router):
    app.include_router(router, prefix="/api")


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
