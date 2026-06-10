from .auth import router as auth_router
from .users import router as users_router
from .goals import router as goals_router
from .nutrition import router as nutrition_router
from .water import router as water_router
from .chat import router as chat_router
from .tips import router as tips_router
from .admin import router as admin_router
from .exercise import router as exercise_router
from .wellness import router as wellness_router
from .foods import router as foods_router
from .reports import router as reports_router
from .notifications import router as notifications_router
from .reminders import router as reminders_router

__all__ = [
    "auth_router", "users_router", "goals_router",
    "nutrition_router", "water_router", "chat_router", "tips_router",
    "admin_router", "exercise_router", "wellness_router", "foods_router", "reports_router",
    "notifications_router", "reminders_router"
]
