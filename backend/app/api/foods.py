import json
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from sqlalchemy import or_

from ..db.session import get_session
from ..models.user import User
from ..models.food import Food
from ..models.favorite_food import FavoriteFood
from ..schemas.food import (
    FoodOut, FoodSearch, FoodAIEstimateRequest, FoodAIEstimateOut,
    FavoriteFoodOut, FavoriteFoodCreate
)
from ..core.security import get_current_user
from ..core.config import settings

router = APIRouter(prefix="/foods", tags=["Foods"])

@router.get("/search", response_model=FoodSearch)
def search_foods(
    q: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    limit: int = Query(default=20),
    offset: int = Query(default=0),
    session: Session = Depends(get_session)
):
    stmt = select(Food)
    
    if q:
        search_pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
                Food.name.ilike(search_pattern),
                Food.name_en.ilike(search_pattern)
            )
        )
    if category:
        stmt = stmt.where(Food.category == category)
        
    total = len(session.exec(stmt).all())
    
    stmt = stmt.offset(offset).limit(limit)
    items = session.exec(stmt).all()
    
    return FoodSearch(items=[FoodOut.model_validate(i) for i in items], total=total)

@router.get("/categories", response_model=List[str])
def get_categories(session: Session = Depends(get_session)):
    from sqlalchemy import select
    stmt = select(Food.category).distinct().where(Food.category != None)
    categories = session.exec(stmt).all()
    return categories

@router.get("/favorites", response_model=List[FavoriteFoodOut])
def get_favorites(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    stmt = select(FavoriteFood, Food).join(Food, FavoriteFood.food_id == Food.id).where(
        FavoriteFood.user_id == current_user.id
    )
    results = session.exec(stmt).all()
    
    out = []
    for fav, food in results:
        fav_out = FavoriteFoodOut.model_validate(fav)
        fav_out.food = FoodOut.model_validate(food)
        out.append(fav_out)
    return out

@router.post("/favorites", response_model=FavoriteFoodOut)
def add_favorite(
    body: FavoriteFoodCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    food = session.get(Food, body.food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
        
    existing = session.exec(
        select(FavoriteFood).where(
            FavoriteFood.user_id == current_user.id,
            FavoriteFood.food_id == body.food_id
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Đã có trong danh sách yêu thích")
        
    fav = FavoriteFood(user_id=current_user.id, food_id=body.food_id)
    session.add(fav)
    session.commit()
    session.refresh(fav)
    
    fav_out = FavoriteFoodOut.model_validate(fav)
    fav_out.food = FoodOut.model_validate(food)
    return fav_out

@router.delete("/favorites/{food_id}")
def remove_favorite(
    food_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    fav = session.exec(
        select(FavoriteFood).where(
            FavoriteFood.user_id == current_user.id,
            FavoriteFood.food_id == food_id
        )
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Không tìm thấy trong yêu thích")
        
    session.delete(fav)
    session.commit()
    return {"message": "Đã xóa khỏi danh sách yêu thích"}

@router.get("/{id}", response_model=FoodOut)
def get_food(id: int, session: Session = Depends(get_session)):
    food = session.get(Food, id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    return food

@router.post("/ai-estimate", response_model=FoodAIEstimateOut)
def ai_estimate_food(
    body: FoodAIEstimateRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        system_instruction = """Bạn là chuyên gia dinh dưỡng. Nhiệm vụ của bạn là ước tính giá trị dinh dưỡng của một món ăn hoặc bữa ăn do người dùng nhập vào.
        Hãy trả về KẾT QUẢ DUY NHẤT LÀ MỘT KHỐI JSON (không có markdown code block, không có text nào khác).
        Format JSON bắt buộc:
        {
            "food_name": "Tên món ăn (chuẩn hóa)",
            "estimated_grams": 200,
            "calories": 300.5,
            "protein": 15.2,
            "carbs": 40.0,
            "fat": 8.5,
            "confidence": "high|medium|low",
            "explanation": "Giải thích ngắn gọn cách bạn ước tính (VD: 1 bát phở bò vừa khoảng 400g, chứa 450 calo...)"
        }"""
        
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=system_instruction
        )
        
        response = model.generate_content(body.query)
        text = response.text.strip()
        
        # Xóa markdown json ticks nếu có
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        return FoodAIEstimateOut(**data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi gọi AI: {str(e)}")
