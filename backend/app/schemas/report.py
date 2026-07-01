from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class DailySummary(BaseModel):
    date: date
    calories_consumed: float
    calories_burned: float
    water_ml: float
    exercise_minutes: int
    sleep_hours: float

class WeeklyReport(BaseModel):
    start_date: date
    end_date: date
    avg_calories_consumed: float
    avg_calories_burned: float
    avg_water_ml: float
    avg_sleep_hours: float
    total_exercise_minutes: int
    days_goal_reached: int
    daily_summaries: List[DailySummary]

class MonthlyReport(BaseModel):
    month: int
    year: int
    avg_calories_consumed: float
    avg_calories_burned: float
    avg_water_ml: float
    avg_sleep_hours: float
    total_exercise_minutes: int
    days_goal_reached: int
    daily_summaries: List[DailySummary]

class ComparisonReport(BaseModel):
    period1_start: date
    period1_end: date
    period2_start: date
    period2_end: date
    p1_avg_calories: float
    p2_avg_calories: float
    p1_avg_water: float
    p2_avg_water: float
    p1_total_exercise: int
    p2_total_exercise: int

class HealthScore(BaseModel):
    date: date
    total_score: float # 0-100
    nutrition_score: float # 0-30
    water_score: float # 0-20
    exercise_score: float # 0-20
    sleep_score: float # 0-15
    consistency_score: float # 0-15

class AIReview(BaseModel):
    observations: List[str]
    recommendations: List[str]
