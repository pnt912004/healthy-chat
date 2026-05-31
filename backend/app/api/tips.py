import random
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from ..db.session import get_session
from ..models.health_tip import HealthTip
from ..schemas.health_tip import HealthTipOut

router = APIRouter(prefix="/tips", tags=["Health Tips"])


@router.get("/random", response_model=HealthTipOut)
def get_random_tip(session: Session = Depends(get_session)):
    """Lấy một mẹo sức khoẻ ngẫu nhiên."""
    # Đếm tổng số tips
    count = session.exec(select(func.count(HealthTip.id))).first()
    if not count:
        # Trả về một tip mặc định nếu DB trống
        return HealthTipOut(
            id=0,
            category="Chung",
            content="Đi bộ 10 phút sau bữa ăn giúp điều hoà đường huyết và cải thiện tiêu hoá đáng kể.",
            icon="psychology"
        )
    
    # Lấy ngẫu nhiên
    offset = random.randint(0, count - 1)
    tip = session.exec(select(HealthTip).offset(offset).limit(1)).first()
    return tip
