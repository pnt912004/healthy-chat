import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .db.session import init_db
from .api import (
    auth_router, users_router, goals_router,
    nutrition_router, water_router, chat_router,
    tips_router, admin_router, exercise_router,
    reports_router, notifications_router, reminders_router, foods_router
)

app = FastAPI(
    title="HealthyChat API",
    description="Backend API cho ứng dụng sức khoẻ HealthyChat",
    version="1.0.0",
    
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Startup ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    init_db()

# ─── Static Files ─────────────────────────────────────────────────────────────
os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ─── Routers ─────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth_router,      prefix=PREFIX)
app.include_router(users_router,     prefix=PREFIX)
app.include_router(goals_router,     prefix=PREFIX)
app.include_router(nutrition_router, prefix=PREFIX)
app.include_router(water_router,     prefix=PREFIX)
app.include_router(exercise_router,  prefix=PREFIX)
app.include_router(chat_router,      prefix=PREFIX)
app.include_router(tips_router,      prefix=PREFIX)
app.include_router(foods_router,     prefix=PREFIX)
app.include_router(reports_router,   prefix=PREFIX)
app.include_router(notifications_router, prefix=PREFIX)
app.include_router(reminders_router, prefix=PREFIX)
app.include_router(admin_router,     prefix=f"{PREFIX}/admin")

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": "HealthyChat API", "version": "1.0.0"}

@app.get("/", tags=["System"])
def root():
    return {"message": "HealthyChat API đang chạy. Vào /docs để xem tài liệu."}
