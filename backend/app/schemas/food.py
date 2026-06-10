from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FoodBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    category: Optional[str] = None
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float
    fiber_per_100g: Optional[float] = None
    default_portion_g: float = 100.0
    portion_label: Optional[str] = "100g"

class FoodCreate(FoodBase):
    pass

class FoodOut(FoodBase):
    id: int
    is_verified: bool
    source: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class FavoriteFoodOut(BaseModel):
    id: int
    user_id: int
    food_id: int
    food: Optional[FoodOut] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class FavoriteFoodCreate(BaseModel):
    food_id: int

class FoodSearch(BaseModel):
    items: List[FoodOut]
    total: int

class FoodAIEstimateRequest(BaseModel):
    query: str

class FoodAIEstimateOut(BaseModel):
    food_name: str
    estimated_grams: float
    calories: float
    protein: float
    carbs: float
    fat: float
    confidence: str
    explanation: Optional[str] = None
