

## 🔧 Bugfix & Cải Thiện Đi Kèm

### Fix lỗi hiện tại (thực hiện xen kẽ trong các Phase)
- [ ] **Fix Water Goal Hardcode**: Cập nhật `backend/app/api/water.py` — Lấy water goal từ user's Goal model thay vì hardcode `WATER_GOAL_ML = 2500`
  - [ ] Thêm field `daily_water_target_ml` vào `backend/app/models/goal.py` (default 2500)
  - [ ] Cập nhật `backend/app/schemas/goal.py` — Thêm field mới vào GoalCreate, GoalOut
  - [ ] Cập nhật `backend/app/api/water.py` — Query Goal để lấy water target
- [x] **Fix Activity Level Mismatch**: Cập nhật `frontend/src/pages/GoalsPage.jsx` — Hiển thị 5 activity levels (sedentary, lightly_active, moderate, active, very_active) thay vì chỉ 3
- [x] **Fix ChatWidget AI Tab**: Cập nhật `frontend/src/components/ChatWidget.jsx` — Kết nối tab AI với chatService thay vì hiển thị "đang bảo trì"
- [x] **Fix Missing PUT Endpoint**: (Đã bao gồm trong Phase 3 — mục 3.3)

### Cải thiện giao diện Mobile (Responsive Design)
- [x] **Tối ưu Layout tổng thể**: Chuyển đổi linh hoạt giữa `flex-col` trên mobile và `md:flex-row` / `md:grid-cols-*` trên desktop.
- [x] **Thanh điều hướng (Navigation)**: Thu gọn Sidebar trên thiết bị di động, bổ sung Bottom Navigation hoặc Hamburger Menu.
- [x] **Tối ưu Tables & Data**: Áp dụng cuộn ngang `overflow-x-auto` cho các bảng dữ liệu trên thiết bị nhỏ (Ant Design Table responsive hoặc Tailwind CSS).
- [x] **Typography & Spacing**: Điều chỉnh lại cỡ chữ (text size), padding/margin phù hợp giúp dễ thao tác cảm ứng hơn trên mobile.

---

## 🚨 Code Review — Danh Sách Lỗi Phát Hiện (10/06/2026)

> **Reviewer:** AI Code Review
> **Phạm vi:** Toàn bộ Frontend Services, Backend API, Pages
> **Tổng lỗi:** 21 bugs (5 Critical, 8 High, 6 Medium, 2 Low)

---

### 🔴 CRITICAL — Lỗi gây hỏng chức năng (trang bị 404 hoặc không hoạt động)

#### BUG-01: `reportService.js` — Thiếu prefix `/api/v1` → TẤT CẢ 5 endpoint bị 404
- **File:** `frontend/src/services/reportService.js`
- **Mô tả:** Tất cả 5 endpoint trong `reportService.js` sử dụng path `/reports/...` thay vì `/api/v1/reports/...`. API base URL trong `api.js` mặc định là `''` (empty), nên full path là `/reports/weekly` thay vì `/api/v1/reports/weekly`. Điều này khiến **toàn bộ trang ReportsPage bị hỏng hoàn toàn** (404 error).
- **Ảnh hưởng:** Trang Báo Cáo Sức Khỏe (`/reports`) không hoạt động: Weekly/Monthly reports, Health Score, Comparison, AI Review — tất cả đều 404.
- **Cách sửa:**
  ```diff
  # frontend/src/services/reportService.js — Thêm /api/v1 vào tất cả 5 endpoints
  - const response = await api.get('/reports/weekly', { params });
  + const response = await api.get('/api/v1/reports/weekly', { params });
  
  - const response = await api.get('/reports/monthly', { params });
  + const response = await api.get('/api/v1/reports/monthly', { params });
  
  - const response = await api.get('/reports/comparison', { ... });
  + const response = await api.get('/api/v1/reports/comparison', { ... });
  
  - const response = await api.get('/reports/score', { params });
  + const response = await api.get('/api/v1/reports/score', { params });
  
  - const response = await api.post('/reports/ai-review', null, { params });
  + const response = await api.post('/api/v1/reports/ai-review', null, { params });
  ```

#### BUG-02: `notificationService.js` — Thiếu prefix `/api/v1` → TẤT CẢ 8 endpoint bị 404
- **File:** `frontend/src/services/notificationService.js`
- **Mô tả:** Tất cả 8 endpoint (5 notification + 3 reminder) sử dụng path `/notifications/...` và `/reminders/...` thay vì `/api/v1/notifications/...` và `/api/v1/reminders/...`.
- **Ảnh hưởng:** 
  - NotificationBell component không hoạt động (không lấy được unread count, không hiển thị notifications)
  - SettingsPage: Reminder settings không load/save được
  - DashboardLayout: `checkReminders()` bị 404 mỗi 30 phút (gây console error spam)
- **Cách sửa:**
  ```diff
  # frontend/src/services/notificationService.js — Thêm /api/v1 vào tất cả 8 endpoints
  - const response = await api.get('/notifications', ...);
  + const response = await api.get('/api/v1/notifications', ...);
  
  - const response = await api.get('/notifications/unread-count');
  + const response = await api.get('/api/v1/notifications/unread-count');
  
  - const response = await api.post(`/notifications/read/${id}`);
  + const response = await api.post(`/api/v1/notifications/read/${id}`);
  
  - const response = await api.post('/notifications/read-all');
  + const response = await api.post('/api/v1/notifications/read-all');
  
  - const response = await api.delete(`/notifications/${id}`);
  + const response = await api.delete(`/api/v1/notifications/${id}`);
  
  - const response = await api.get('/reminders/settings');
  + const response = await api.get('/api/v1/reminders/settings');
  
  - const response = await api.put('/reminders/settings', data);
  + const response = await api.put('/api/v1/reminders/settings', data);
  
  - const response = await api.post('/reminders/check');
  + const response = await api.post('/api/v1/reminders/check');
  ```

#### BUG-03: `daily_water_target_ml` — Phantom field, KHÔNG TỒN TẠI trong backend
- **Files:** `frontend/src/pages/DashboardPage.jsx` (L41, L55), `frontend/src/pages/WaterTrackerPage.jsx`
- **Mô tả:** Frontend tham chiếu `goalRes?.daily_water_target_ml` nhưng field này **KHÔNG TỒN TẠI** trong backend Goal model và GoalOut schema. Goal model chỉ có: `current_weight, height, age, gender, activity_level, target_weight, body_fat_percentage, weekly_goal_rate, bmr, tdee, bmi, daily_calorie_goal, estimated_days_to_target`.
- **Ảnh hưởng:** `goalRes?.daily_water_target_ml` **LUÔN** trả về `undefined` → fallback `2500` luôn được dùng → user KHÔNG THỂ tùy chỉnh mục tiêu nước. Cả Dashboard và WaterTracker đều bị hardcode 2500ml.
- **Cách sửa (4 bước):**
  1. **Model** — Thêm field vào `backend/app/models/goal.py`:
     ```python
     daily_water_target_ml: Optional[int] = Field(default=2500)
     ```
  2. **Schema** — Thêm vào `GoalCreate`, `GoalUpdate`, `GoalOut` trong `backend/app/schemas/goal.py`:
     ```python
     daily_water_target_ml: Optional[int] = 2500
     ```
  3. **Goals API** — Cập nhật `backend/app/api/goals.py` (`upsert_goal`) để xử lý field mới
  4. **GoalsPage** — Thêm input "Mục tiêu nước hàng ngày (ml)" vào form ở `frontend/src/pages/GoalsPage.jsx`
  5. **Database migration** — Chạy Alembic migration để thêm column `daily_water_target_ml` vào bảng `goals`

#### BUG-04: `water.py` — Hardcode `WATER_GOAL_ML = 2500`, không query Goal model
- **File:** `backend/app/api/water.py` (L14, L104, L111, L144, L149)
- **Mô tả:** Constant `WATER_GOAL_ML = 2500` được dùng ở 4+ chỗ: `get_summary()`, streak calculation, `get_weekly()`. Backend không bao giờ query Goal model để lấy mục tiêu nước cá nhân hóa.
- **Ảnh hưởng:** Mọi user đều bị coi là mục tiêu 2500ml. Streak calculation sai nếu user có mục tiêu khác.
- **Cách sửa:**
  ```diff
  # backend/app/api/water.py
  + from ..models.goal import Goal
  
  - WATER_GOAL_ML = 2500
  
  + def _get_water_goal(session: Session, user_id: int) -> int:
  +     goal = session.exec(select(Goal).where(Goal.user_id == user_id)).first()
  +     return goal.daily_water_target_ml if goal and goal.daily_water_target_ml else 2500
  
  # Thay tất cả WATER_GOAL_ML bằng _get_water_goal(session, current_user.id)
  ```

#### BUG-05: `reports.py` — Hardcode goal check, KHÔNG import Goal model
- **File:** `backend/app/api/reports.py` (L102-104, L157-158, L235-240)
- **Mô tả:** 
  - `days_goal_reached` check: `if summary.water_ml >= 2000 and summary.calories_consumed >= 1000` — hardcode hoàn toàn, không liên quan đến user goals.
  - Health Score: `nutrition_score = 40.0 if 1500 <= avg_cal <= 2500 else 20.0` — binary scoring, hardcode.
  - Water score: `water_score = 30.0 if avg_water >= 2000` — hardcode 2000ml.
  - **Goal model không được import trong file này.**
- **Ảnh hưởng:** ReportsPage hiển thị "Ngày đạt mục tiêu" nhưng logic check hoàn toàn vô nghĩa (water >= 2000 VÀ calories >= 1000). Health Score không phản ánh mục tiêu cá nhân.
- **Cách sửa:**
  ```diff
  # backend/app/api/reports.py
  + from ..models.goal import Goal
  
  # Trong get_weekly_report() và get_monthly_report():
  + goal = session.exec(select(Goal).where(Goal.user_id == current_user.id)).first()
  + cal_target = goal.daily_calorie_goal if goal and goal.daily_calorie_goal else 2000
  + water_target = goal.daily_water_target_ml if goal and hasattr(goal, 'daily_water_target_ml') and goal.daily_water_target_ml else 2500
  
  - if summary.water_ml >= 2000 and summary.calories_consumed >= 1000:
  + if summary.water_ml >= water_target and summary.calories_consumed >= cal_target * 0.8:
  
  # Trong get_health_score():
  + goal = session.exec(select(Goal).where(Goal.user_id == current_user.id)).first()
  + cal_target = goal.daily_calorie_goal if goal else 2000
  + water_target = goal.daily_water_target_ml if goal and hasattr(goal, 'daily_water_target_ml') else 2500
  
  - nutrition_score = 40.0 if 1500 <= avg_cal <= 2500 else 20.0
  + nutrition_score = 40.0 * min(avg_cal / cal_target, 1.0) if avg_cal <= cal_target * 1.2 else 20.0
  
  - water_score = 30.0 if avg_water >= 2000 else (avg_water / 2000) * 30
  + water_score = 30.0 if avg_water >= water_target else (avg_water / water_target) * 30
  ```

---

### 🟠 HIGH — Lỗi ảnh hưởng lớn đến trải nghiệm

#### BUG-06: `wellness.py` — Sleep streak threshold hardcode 7h, không dùng Goal model
- **File:** `backend/app/api/wellness.py` (L113)
- **Mô tả:** Sleep streak tính dựa trên `if l.duration_hours >= 7.0` — hardcode 7 tiếng, không sử dụng mục tiêu ngủ cá nhân hóa.
- **Ảnh hưởng:** User muốn ngủ 8h/ngày nhưng hệ thống vẫn tính streak dựa trên 7h.
- **Cách sửa:** Import Goal model, query user's sleep goal. Cần thêm field `daily_sleep_target_hours` vào Goal model.

#### BUG-07: Goal model thiếu nhiều field cá nhân hóa
- **File:** `backend/app/models/goal.py`
- **Mô tả:** Goal model chỉ có `daily_calorie_goal`, thiếu:
  - `daily_water_target_ml` (cần cho Water API, Reports, Dashboard)
  - `daily_sleep_target_hours` (cần cho Wellness sleep streak)
  - `daily_exercise_target_minutes` (cần cho Exercise tracking, Reports)
  - `daily_protein_target`, `daily_carbs_target`, `daily_fat_target` (cần cho Nutrition macro goals)
- **Ảnh hưởng:** Tất cả các trang đều dùng hardcode thay vì mục tiêu cá nhân.
- **Cách sửa:** Thêm các fields mới vào Goal model, schema, API, và frontend GoalsPage.

#### BUG-08: Health Score không tính Exercise & Sleep
- **File:** `backend/app/api/reports.py` (L235-240)
- **Mô tả:** Health Score chỉ tính: Nutrition (40đ) + Water (30đ) + Consistency (30đ). Hoàn toàn **bỏ qua** Exercise minutes và Sleep hours mặc dù có thu thập data.
- **Ảnh hưởng:** Health Score thiếu chính xác, user tập luyện chăm nhưng không được phản ánh.
- **Cách sửa:** Điều chỉnh công thức: Nutrition (30đ) + Water (20đ) + Exercise (20đ) + Sleep (15đ) + Consistency (15đ).

#### BUG-09: Health Score Nutrition là binary (40 hoặc 20), không gradient
- **File:** `backend/app/api/reports.py` (L236)
- **Mô tả:** `nutrition_score = 40.0 if 1500 <= avg_cal <= 2500 else 20.0` — chỉ có 2 mức: 40 hoặc 20. User ăn 1501 cal cùng điểm với user ăn 2499 cal.
- **Ảnh hưởng:** Thiếu công bằng, không khuyến khích cải thiện dần.
- **Cách sửa:** Dùng gradient scoring dựa trên khoảng cách đến target.

#### BUG-10: `WellnessPage.jsx` — Race condition khi xóa log
- **File:** `frontend/src/pages/WellnessPage.jsx`
- **Mô tả:** `deleteSleepLog(log.id); fetchData();` — gọi `fetchData()` ngay lập tức mà KHÔNG `await` delete. Data có thể refetch trước khi delete hoàn tất → hiển thị data cũ.
- **Cách sửa:**
  ```diff
  - deleteSleepLog(log.id); fetchData();
  + await deleteSleepLog(log.id); fetchData();
  ```

#### BUG-11: `ReportsPage.jsx` — Chart titles không đổi theo tab
- **File:** `frontend/src/pages/ReportsPage.jsx`
- **Mô tả:** Khi chuyển sang tab "Tháng", chart titles vẫn hiển thị "7 Ngày Qua" thay vì "30 Ngày Qua". State `weeklyData` được reuse cho monthly data (tên biến gây nhầm lẫn).
- **Cách sửa:** Dùng dynamic titles dựa trên `activeTab`, đổi tên state cho rõ nghĩa.

#### BUG-12: `ReportsPage.jsx` — Không fetch user goals để so sánh
- **File:** `frontend/src/pages/ReportsPage.jsx`
- **Mô tả:** Trang báo cáo hiển thị "avg calories consumed" nhưng KHÔNG bao giờ fetch Goal model để so sánh với target. Không có `getGoal()` call.
- **Cách sửa:** Thêm `getGoal()` vào `fetchData`, hiển thị target so sánh trong overview cards.

#### BUG-13: `ProfilePage.jsx` — Stale data sau khi update
- **File:** `frontend/src/pages/ProfilePage.jsx`
- **Mô tả:** `getCurrentUser()` đọc từ localStorage (JWT decoded). Sau khi `updateProfile()` thành công, localStorage KHÔNG được refresh → form hiển thị data cũ khi navigate lại.
- **Cách sửa:** Sau khi update thành công, gọi `setUser()` từ AuthContext hoặc cập nhật localStorage.

---

### 🟡 MEDIUM — Lỗi ảnh hưởng vừa phải

#### BUG-14: `exercise.py` — Calorie burn không tính theo cân nặng user
- **File:** `backend/app/api/exercise.py`
- **Mô tả:** Sử dụng `CALORIES_PER_MINUTE` hardcode. User 50kg và 100kg burn cùng lượng calories cho cùng bài tập.
- **Cách sửa:** Query user weight từ Goal model, điều chỉnh calorie calculation.

#### BUG-15: `exercise.py` — Không validate `duration_minutes`
- **File:** `backend/app/api/exercise.py`
- **Mô tả:** Chấp nhận giá trị âm hoặc cực lớn cho `duration_minutes`. Không có validation.
- **Cách sửa:** Thêm validation `duration_minutes > 0` và `duration_minutes <= 480`.

#### BUG-16: `reports.py` — Performance: 120 DB queries cho monthly report
- **File:** `backend/app/api/reports.py`
- **Mô tả:** `_get_daily_summary` chạy 4 queries/ngày. Monthly report (30 ngày) = 120 queries. Rất chậm.
- **Cách sửa:** Batch query: lấy tất cả data cho khoảng ngày trong 4 queries lớn thay vì loop.

#### BUG-17: `AIAssistantPage.jsx` — Không gửi context goals cho AI
- **File:** `frontend/src/pages/AIAssistantPage.jsx`
- **Mô tả:** Chat AI không gửi kèm goals/targets/health data của user → AI trả lời generic, không personalized.
- **Cách sửa:** Gọi `getGoal()` khi init, gửi context kèm message.

#### BUG-18: `AIAssistantPage.jsx` — Import `logout` không dùng
- **File:** `frontend/src/pages/AIAssistantPage.jsx` (L3)
- **Mô tả:** `logout` được import nhưng không sử dụng → dead import.
- **Cách sửa:** Xóa import không dùng.

#### BUG-19: `ProfilePage.jsx` — HTML entity `&amp;` hiển thị sai
- **File:** `frontend/src/pages/ProfilePage.jsx`
- **Mô tả:** `"Bảo Mật &amp; Mật Khẩu"` — trong JSX không cần dùng HTML entity, nên dùng `&` trực tiếp.
- **Cách sửa:** Đổi `&amp;` thành `&`.

---

### 🟢 LOW — Lỗi nhỏ / cải thiện

#### BUG-20: `goals.py` — `datetime.utcnow()` deprecated Python 3.12+
- **File:** `backend/app/models/goal.py` (L29-30), `backend/app/api/goals.py` (L141)
- **Mô tả:** `datetime.utcnow()` bị deprecated từ Python 3.12. Nên dùng `datetime.now(timezone.utc)`.
- **Cách sửa:** Import `timezone` và đổi sang `datetime.now(timezone.utc)`.

#### BUG-21: `goals.py` — GoalUpdate schema vô nghĩa
- **File:** `backend/app/schemas/goal.py` (L19-20)
- **Mô tả:** `class GoalUpdate(GoalCreate): pass` — chỉ có `pass`, không thêm gì mới, và KHÔNG được sử dụng ở bất kỳ đâu trong API. API dùng `GoalCreate` cho PUT endpoint.
- **Cách sửa:** Xóa `GoalUpdate` hoặc sử dụng nó trong PUT endpoint.

---

### 📝 Thứ tự sửa đề xuất

| Ưu tiên | Bug IDs | Nội dung | Ước tính |
|---------|---------|----------|----------|
| **P0** | BUG-01, BUG-02 | Fix API path prefix (reportService, notificationService) | 15 phút |
| **P1** | BUG-03, BUG-04, BUG-07 | Thêm goal fields + fix water hardcode | 2-3 tiếng |
| **P2** | BUG-05 | Fix reports.py goal logic | 1 tiếng |
| **P3** | BUG-06, BUG-08, BUG-09 | Fix health score + sleep streak | 1-2 tiếng |
| **P4** | BUG-10, BUG-11, BUG-12, BUG-13 | Fix race conditions + UI issues | 1-2 tiếng |
| **P5** | BUG-14 → BUG-21 | Medium/Low severity fixes | 2-3 tiếng |
| **Tổng** | 21 bugs | | **~8-12 tiếng** |

---

## 📋 Tóm Tắt Tổng Quan

| Phase | Tính năng | Files mới | Files sửa | Ước tính |
|-------|-----------|-----------|-----------|----------|
| 1 | 🏋️ Exercise Tracking | 4 mới (model, schema, api, service, page) | 6 sửa (routes, sidebar, dashboard, admin, __init__ ×2) | 3-4 ngày |
| 2 | 😴 Sleep & Mood | 5 mới (2 models, schema, api, service, page) | 6 sửa (routes, sidebar, dashboard, admin, __init__ ×2) | 3-4 ngày |
| 3 | 📚 AI Food Database | 5 mới (2 models, schema, api, service, seed) | 5 sửa (nutrition page, dashboard, admin, __init__ ×2) | 5-7 ngày |
| 4 | 📈 Health Reports | 3 mới (api, schema, service, page) | 4 sửa (routes, sidebar, __init__ ×2) + 1 install | 4-5 ngày |
| 5 | 🔔 Smart Notifications | 5 mới (2 models, schema, 2 apis, service, component) | 5 sửa (navbar, settings, app, __init__ ×2) | 5-6 ngày |
| — | 🔧 Bugfixes & Mobile UI | 0 | Nhiều file | 2-3 ngày |
| — | 🚨 Code Review Bugs (21 lỗi) | 0 | ~15 files | 1.5-2 ngày |
| **Tổng** | | **~22 files mới** | **~Nhiều files sửa** | **~25-32 ngày** |
