from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class Food(SQLModel, table=True):
    __tablename__ = "foods"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, description="Tên món ăn tiếng Việt")
    name_en: Optional[str] = Field(default=None, description="Tên tiếng Anh (để AI dễ map)")
    category: Optional[str] = Field(default=None, index=True)
    
    # Dinh dưỡng tính trên 100g
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float
    fiber_per_100g: Optional[float] = Field(default=None)
    
    # Khẩu phần mặc định
    default_portion_g: float = Field(default=100.0, description="Định lượng mặc định (gram)")
    portion_label: Optional[str] = Field(default="100g", description="Nhãn định lượng (VD: 1 bát, 1 tô)")
    
    is_verified: bool = Field(default=False, description="True nếu được admin duyệt")
    source: Optional[str] = Field(default="system", description="Nguồn gốc (system/user/ai)")
    
    created_at: datetime = Field(default_factory=datetime.now)
