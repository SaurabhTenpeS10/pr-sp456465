from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth as auth_routes
from app.api.routes import conversations as conversations_routes
from app.api.routes import messages as messages_routes
from app.core.config import settings
from app.core.database import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="PromptSplitwise API",
    version="1.0.0",
    description="Backend API for PromptSplitwise built with FastAPI",
    lifespan=lifespan,
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/")
def root():
    return {"message": "Welcome to PromptSplitwise API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(auth_routes.router, prefix="/api")
app.include_router(conversations_routes.router, prefix="/api/v1")
app.include_router(messages_routes.router, prefix="/api/v1")
