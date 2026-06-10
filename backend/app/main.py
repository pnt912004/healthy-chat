from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db.session import init_db
from .api import (
    auth_router, users_router, goals_router,
    nutrition_router, water_router, chat_router,
    tips_router, admin_router, exercise_router,
    wellness_router, foods_router, reports_router,
    notifications_router, reminders_router
)

app = FastAPI(
    title="HealthyChat API",
    description="Backend API cho ứng dụng sức khoẻ HealthyChat",
    version="1.0.0",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
import os

ALLOWED_ORIGINS = [
    # Local development
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    # Vercel production (thay tên project thực của bạn)
    "https://healthychat-frontend.vercel.app",
    # Cho phép tất cả subdomains của vercel.app (preview deployments)
    "https://*.vercel.app",
]

# Thêm FRONTEND_URL từ env nếu có (linh hoạt khi custom domain)
_frontend_url = os.getenv("FRONTEND_URL", "")
if _frontend_url:
    ALLOWED_ORIGINS.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # regex cho mọi Vercel preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Startup ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    init_db()

# ─── Routers ─────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth_router,      prefix=PREFIX)
app.include_router(users_router,     prefix=PREFIX)
app.include_router(goals_router,     prefix=PREFIX)
app.include_router(nutrition_router, prefix=PREFIX)
app.include_router(water_router,     prefix=PREFIX)
app.include_router(exercise_router,  prefix=PREFIX)
app.include_router(wellness_router,  prefix=PREFIX)
app.include_router(chat_router,      prefix=PREFIX)
app.include_router(tips_router,      prefix=PREFIX)
app.include_router(foods_router,     prefix=PREFIX)
app.include_router(reports_router,   prefix=PREFIX)
app.include_router(notifications_router, prefix=PREFIX)
app.include_router(reminders_router,     prefix=PREFIX)
app.include_router(admin_router,     prefix=f"{PREFIX}/admin")

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": "HealthyChat API", "version": "1.0.0"}

@app.get("/", tags=["System"])
def root():
    return {"message": "HealthyChat API đang chạy. Vào /docs để xem tài liệu."}
