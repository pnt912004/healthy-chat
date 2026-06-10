from sqlmodel import Session, select
from app.db.session import engine
from app.models.food import Food

FOODS = [
    # Cơm/Xôi
    {"name": "Cơm trắng", "name_en": "White rice", "category": "Cơm/Xôi", "calories_per_100g": 130, "protein_per_100g": 2.7, "carbs_per_100g": 28, "fat_per_100g": 0.3, "fiber_per_100g": 0.4, "default_portion_g": 200, "portion_label": "1 bát"},
    {"name": "Cơm tấm", "name_en": "Broken rice", "category": "Cơm/Xôi", "calories_per_100g": 145, "protein_per_100g": 3, "carbs_per_100g": 30, "fat_per_100g": 1, "fiber_per_100g": 0.5, "default_portion_g": 250, "portion_label": "1 đĩa"},
    # Phở/Bún/Mì
    {"name": "Phở bò", "name_en": "Beef pho", "category": "Phở/Bún/Mì", "calories_per_100g": 85, "protein_per_100g": 4, "carbs_per_100g": 12, "fat_per_100g": 2.5, "fiber_per_100g": 0.5, "default_portion_g": 450, "portion_label": "1 tô"},
    {"name": "Bún chả", "name_en": "Bun cha", "category": "Phở/Bún/Mì", "calories_per_100g": 120, "protein_per_100g": 5, "carbs_per_100g": 15, "fat_per_100g": 4, "fiber_per_100g": 1.0, "default_portion_g": 300, "portion_label": "1 suất"},
    {"name": "Bún bò Huế", "name_en": "Bun bo Hue", "category": "Phở/Bún/Mì", "calories_per_100g": 90, "protein_per_100g": 4.5, "carbs_per_100g": 10, "fat_per_100g": 3.5, "fiber_per_100g": 0.8, "default_portion_g": 450, "portion_label": "1 tô"},
    {"name": "Mì tôm", "name_en": "Instant noodles", "category": "Phở/Bún/Mì", "calories_per_100g": 450, "protein_per_100g": 9, "carbs_per_100g": 60, "fat_per_100g": 18, "fiber_per_100g": 2.0, "default_portion_g": 75, "portion_label": "1 gói"},
    # Thịt/Cá/Hải sản
    {"name": "Thịt lợn luộc", "name_en": "Boiled pork", "category": "Thịt/Cá/Hải sản", "calories_per_100g": 242, "protein_per_100g": 27, "carbs_per_100g": 0, "fat_per_100g": 14, "fiber_per_100g": 0, "default_portion_g": 100, "portion_label": "100g"},
    {"name": "Thịt gà luộc", "name_en": "Boiled chicken", "category": "Thịt/Cá/Hải sản", "calories_per_100g": 165, "protein_per_100g": 31, "carbs_per_100g": 0, "fat_per_100g": 3.6, "fiber_per_100g": 0, "default_portion_g": 100, "portion_label": "100g"},
    {"name": "Cá hồi nướng", "name_en": "Grilled salmon", "category": "Thịt/Cá/Hải sản", "calories_per_100g": 206, "protein_per_100g": 22, "carbs_per_100g": 0, "fat_per_100g": 13, "fiber_per_100g": 0, "default_portion_g": 150, "portion_label": "1 miếng"},
    {"name": "Trứng luộc", "name_en": "Boiled egg", "category": "Thịt/Cá/Hải sản", "calories_per_100g": 155, "protein_per_100g": 13, "carbs_per_100g": 1.1, "fat_per_100g": 11, "fiber_per_100g": 0, "default_portion_g": 50, "portion_label": "1 quả"},
    {"name": "Đậu phụ", "name_en": "Tofu", "category": "Thịt/Cá/Hải sản", "calories_per_100g": 76, "protein_per_100g": 8, "carbs_per_100g": 1.9, "fat_per_100g": 4.8, "fiber_per_100g": 0.3, "default_portion_g": 150, "portion_label": "1 miếng"},
    # Rau Củ
    {"name": "Rau muống xào tỏi", "name_en": "Stir-fried water spinach with garlic", "category": "Rau Củ", "calories_per_100g": 60, "protein_per_100g": 2.5, "carbs_per_100g": 4, "fat_per_100g": 4, "fiber_per_100g": 2, "default_portion_g": 150, "portion_label": "1 đĩa"},
    {"name": "Rau bắp cải luộc", "name_en": "Boiled cabbage", "category": "Rau Củ", "calories_per_100g": 25, "protein_per_100g": 1.3, "carbs_per_100g": 5.8, "fat_per_100g": 0.1, "fiber_per_100g": 2.5, "default_portion_g": 150, "portion_label": "1 đĩa"},
    {"name": "Cà chua", "name_en": "Tomato", "category": "Rau Củ", "calories_per_100g": 18, "protein_per_100g": 0.9, "carbs_per_100g": 3.9, "fat_per_100g": 0.2, "fiber_per_100g": 1.2, "default_portion_g": 100, "portion_label": "1 quả"},
    # Trái Cây
    {"name": "Chuối", "name_en": "Banana", "category": "Trái Cây", "calories_per_100g": 89, "protein_per_100g": 1.1, "carbs_per_100g": 22.8, "fat_per_100g": 0.3, "fiber_per_100g": 2.6, "default_portion_g": 120, "portion_label": "1 quả"},
    {"name": "Táo", "name_en": "Apple", "category": "Trái Cây", "calories_per_100g": 52, "protein_per_100g": 0.3, "carbs_per_100g": 13.8, "fat_per_100g": 0.2, "fiber_per_100g": 2.4, "default_portion_g": 150, "portion_label": "1 quả"},
    {"name": "Dưa hấu", "name_en": "Watermelon", "category": "Trái Cây", "calories_per_100g": 30, "protein_per_100g": 0.6, "carbs_per_100g": 7.6, "fat_per_100g": 0.2, "fiber_per_100g": 0.4, "default_portion_g": 200, "portion_label": "1 miếng"},
    # Đồ Uống
    {"name": "Cà phê sữa đá", "name_en": "Iced milk coffee", "category": "Đồ Uống", "calories_per_100g": 70, "protein_per_100g": 1.5, "carbs_per_100g": 12, "fat_per_100g": 1.8, "fiber_per_100g": 0, "default_portion_g": 250, "portion_label": "1 ly"},
    {"name": "Trà sữa trân châu", "name_en": "Bubble tea", "category": "Đồ Uống", "calories_per_100g": 85, "protein_per_100g": 0.5, "carbs_per_100g": 16, "fat_per_100g": 2.5, "fiber_per_100g": 0.2, "default_portion_g": 500, "portion_label": "1 ly size M"},
    # Bánh/Snack
    {"name": "Bánh mì pate thịt", "name_en": "Banh mi with pate and pork", "category": "Bánh/Snack", "calories_per_100g": 250, "protein_per_100g": 10, "carbs_per_100g": 28, "fat_per_100g": 11, "fiber_per_100g": 2, "default_portion_g": 200, "portion_label": "1 ổ"},
    {"name": "Bánh bao nhân thịt", "name_en": "Steamed pork bun", "category": "Bánh/Snack", "calories_per_100g": 220, "protein_per_100g": 7, "carbs_per_100g": 32, "fat_per_100g": 6, "fiber_per_100g": 1, "default_portion_g": 150, "portion_label": "1 cái"},
]

def run_seed():
    with Session(engine) as session:
        existing = session.exec(select(Food)).first()
        if existing:
            print("Food table is not empty. Skip seeding.")
            return

        print(f"Seeding {len(FOODS)} foods...")
        for food_data in FOODS:
            f = Food(**food_data, is_verified=True, source="system")
            session.add(f)
        session.commit()
        print("Done seeding foods.")

if __name__ == "__main__":
    run_seed()
