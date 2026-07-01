# Task Board

Tracking current progress and upcoming objectives.

## Current Sprint
- [x] Initialize project structure [.agent/]
- [x] Frontend Audit — Phân tích toàn bộ 34 vấn đề (9 Critical, 16 Medium, 9 Low)
- [x] Database Migration — Chuyển từ SQLite file → PostgreSQL

---

## Phase 0: Database — SQLite → PostgreSQL ✅
- [x] Sửa `backend/.env` — Đổi `DATABASE_URL` từ `sqlite:///healthychat.db` → `postgresql://postgres:postgres@localhost:5432/healthychat`
- [x] Đảm bảo PostgreSQL đang chạy (Docker hoặc local install)
- [x] Chạy backend, verify `init_db()` tạo tables thành công trên PostgreSQL
- [x] Test API endpoints (auth, goals, nutrition, water, chat) hoạt động với PostgreSQL
- [x] Xóa file `healthychat.db` (SQLite cũ) sau khi verify xong

---

## Phase 1: Auth Context & Protected Routes (Foundation) ✅
- [x] Tạo `src/contexts/AuthContext.jsx` — React Context quản lý auth state (user, token, login, logout, isAuthenticated)
- [x] Tạo `src/components/ProtectedRoute.jsx` — Component wrapper kiểm tra auth → redirect `/login`
- [x] Cập nhật `src/routes/AppRoutes.jsx` — Wrap protected routes, redirect login/register nếu đã login
- [x] Cập nhật `src/App.jsx` — Wrap AuthProvider, bỏ duplicate CSS import
- [x] Cập nhật `src/services/api.js` — Tích hợp AuthContext cho 401 handling

## Phase 2: Layout & Routing Restructure ✅
- [x] Cập nhật `AppRoutes.jsx` — Nested routes với layout wrappers + `<Outlet />`
- [x] Cập nhật `MainLayout.jsx` — Thêm Outlet, thêm MobileNav cho mobile
- [x] Cập nhật `DashboardLayout.jsx` — Thêm Outlet
- [x] Cập nhật `AuthLayout.jsx` — Thêm Outlet
- [x] Cập nhật tất cả 10 Pages — Bỏ import layout, để layout quản lý qua routing

## Phase 3: Navigation Consistency ✅
- [x] Chuẩn hóa nav items giữa Navbar, Sidebar, MobileNav
- [x] Cập nhật `Navbar.jsx` — Auth-aware rendering (Login/Register vs Logout), fix dark mode & notification buttons
- [x] Cập nhật `Sidebar.jsx` — Thêm `/profile`, dùng `useAuth()`
- [x] Cập nhật `MobileNav.jsx` — Thêm `/goals`, fix CSS bug (absolute without relative parent)
- [x] Cập nhật `Footer.jsx` — Fix dead links (/privacy, /terms, /support, /contact), dynamic copyright year

## Phase 4: Page Functionality Fixes ✅
- [x] `HomePage.jsx` — Thêm Link cho CTA buttons ("Bắt Đầu Miễn Phí" → /register)
- [x] `NutritionPage.jsx` — Implement search filter (searchQuery state tồn tại nhưng không filter)
- [x] `NutritionPage.jsx` — Fix macro progress bars dùng data thực (hiện hardcode 40%)
- [x] `NutritionPage.jsx` — Thay `alert()` bằng form/modal thêm thực phẩm
- [x] `NutritionPage.jsx` — Thêm Fat stat card (hiện chỉ có Protein & Carbs)
- [x] `WaterTrackerPage.jsx` — Gọi `GET /api/v1/water/weekly` thay vì hardcoded weekData
- [x] `WaterTrackerPage.jsx` — Fix smart reminders toggle hoặc bỏ nếu backend chưa hỗ trợ
- [x] `AIAssistantPage.jsx` — Tích hợp vào DashboardLayout (hiện có custom layout riêng 337 dòng)
- [x] `AIAssistantPage.jsx` — Fix logout dùng `authService.logout()` thay vì `localStorage.clear()`
- [x] `LoginPage.jsx` — Fix/bỏ dead "Quên mật khẩu?" link (href="#")
- [x] `RegisterPage.jsx` — Fix dead links /terms, /privacy

## Phase 5: Complete API Integration ✅
- [x] `healthService.js` — Thêm `getWaterWeekly()` (backend có nhưng frontend chưa dùng)
- [x] `healthService.js` — Thêm `getWaterLogs()` (backend có endpoint)
- [x] `healthService.js` — Thêm `updateNutritionLog()` (hiện chỉ add/delete, không edit)
- [x] `authService.js` — Thêm `changePassword()` → `PUT /api/v1/users/me/password`
- [x] `authService.js` — Thêm `deleteAccount()` → `DELETE /api/v1/users/me`

## Phase 6: Settings & Profile Completion ✅
- [x] `ProfilePage.jsx` — Implement đổi mật khẩu (nút "Update Password" hiện không có onClick)
- [x] `ProfilePage.jsx` — Implement xoá tài khoản + confirmation dialog
- [x] `ProfilePage.jsx` — Implement avatar upload hoặc ẩn feature
- [x] `ProfilePage.jsx` — Chuẩn hóa ngôn ngữ → toàn bộ tiếng Việt (hiện mix EN/VN)
- [x] `SettingsPage.jsx` — Implement theme toggle thực tế (dark/light) qua Context
- [x] `SettingsPage.jsx` — Persist notification settings (hiện chỉ local state, reset khi refresh)
- [x] `SettingsPage.jsx` — Bỏ/implement connected apps & privacy features (hiện UI giả)

## Phase 7: UX Polish & Cleanup ✅
- [x] Fix font mismatch — `tailwind.config.js` dùng Manrope, `index.css` import Plus Jakarta Sans + Inter
- [x] Xử lý `StatCard.jsx` — Component tồn tại nhưng không page nào import (dead code)
- [x] Mở rộng `Button.jsx` variants — Hiện chỉ dùng ở HomePage, các page khác dùng inline `<button>`
- [x] Bỏ duplicate CSS import ở `main.jsx` (index.css import cả ở main.jsx và App.jsx)
- [x] Xoá unnecessary `@types/react` từ devDependencies (project dùng JSX không TSX)
- [x] Cài và cấu hình ESLint (package.json có script lint nhưng không có ESLint dependency)
- [x] Fix Sidebar "Premium Member" hardcode & "Nâng Cấp Gói" button không hoạt động
- [x] Cài Ant Design cho Form, Table, Modal (theo user rules — cần confirm version)

---

## Phase 8A: Admin Panel — Foundation & RBAC ✅ (có lỗi cần sửa)
> **Prerequisite**: Phase 1 (AuthContext) phải xong trước

### Backend — Role & Permission System
- [x] Thêm field `role` vào `User` model — `role: str = Field(default="user", max_length=20)` ⚠️ *Thiếu enum validation*
- [x] Tạo `get_current_admin()` dependency trong `security.py` — check `role != "admin"`, trả 403
- [x] Seed admin account mặc định trong `init_db()` — username: `admin`, password: `Admin@123`, role: `admin` + 5 health tips
- [x] Cập nhật `UserOut` schema — thêm field `role`, `is_active` vào response
- [x] Tạo `app/api/admin.py` — Admin router (147 lines, 8 endpoints)
- [x] Tạo `app/schemas/admin.py` — `DashboardStats` + `UserUpdateAdmin` schemas
- [x] Register `admin_router` trong `main.py` — `prefix=f"{PREFIX}/admin"`

### Frontend — Admin Route & Layout
- [x] Tạo `src/layouts/AdminLayout.jsx` — Ant Design Layout + Sider (97 lines)
- [x] Tạo `src/components/AdminRoute.jsx` — Auth + role check, redirect (20 lines)
- [x] Cập nhật `AppRoutes.jsx` — Nested admin routes (Lines 54-63)
- [x] Tạo `src/services/adminService.js` — 8 functions 🔴 **BUG: SAI API PATH (thiếu /api/v1 prefix)**

## Phase 8B: Admin Panel — Core Admin UI ✅ (có lỗi cần sửa)
> **Prerequisite**: Phase 8A xong

### Dashboard thống kê
- [x] Backend `GET /api/v1/admin/stats` — Trả về tổng users, new_users_today, chat/nutrition/water logs, active_users_today ⚠️ *Thiếu tuần/tháng, active_users logic sai*
- [x] Tạo `src/pages/admin/AdminDashboard.jsx` — StatsCards + Recharts BarChart (125 lines) ⚠️ *Chart data hardcoded 0, icon sai*

### Quản lý người dùng
- [x] Backend `GET /api/v1/admin/users` — Danh sách users (pagination only) ⚠️ *Thiếu search & filter*
- [x] Backend `PATCH /api/v1/admin/users/:id` — Cập nhật user (khóa/mở, đổi role) ⚠️ *Thiếu reset password*
- [x] Backend `DELETE /api/v1/admin/users/:id` — Xóa user vĩnh viễn (có self-delete prevention)
- [x] Tạo `src/pages/admin/AdminUsers.jsx` — Ant Design Table (144 lines) ⚠️ *Thiếu search, bug Select defaultValue, thiếu dayjs trong package.json*

### Quản lý Health Tips (CRUD)
- [x] Backend `GET /api/v1/admin/tips` — Danh sách tips (pagination) ⚠️ *Thiếu filter by category*
- [x] Backend `POST /api/v1/admin/tips` — Thêm tip mới ✅
- [x] Backend `PUT /api/v1/admin/tips/:id` — Sửa tip (dùng `exclude_unset=True`) ✅
- [x] Backend `DELETE /api/v1/admin/tips/:id` — Xóa tip ✅
- [x] Tạo `src/pages/admin/AdminTips.jsx` — CRUD tips (176 lines, Ant Design Table + Form + Modal) ⚠️ *Bug error check, form không reset sau edit*

## Phase 8-FIX: Sửa Lỗi Phase 8A & 8B ✅
> **Ưu tiên**: Sửa từ P0 → P3

### P0 — CRITICAL
- [x] **Bug #1**: `adminService.js` — Thêm `/api/v1` prefix cho tất cả 8 API calls (hiện 404 toàn bộ)

### P1 — HIGH
- [x] **Bug #2**: `AdminUsers.jsx:99` — Đổi `defaultValue` → `value` cho Select component
- [x] **Bug #3**: `AdminTips.jsx:60` — Đổi `error.name === 'ValidationError'` → `error.errorFields`
- [x] **Bug #4**: `AdminTips.jsx:57` — Thêm `setEditingTip(null)` + `form.resetFields()` sau edit thành công
- [x] **Bug #5**: Chạy `npm install dayjs` để thêm vào package.json

### P2 — MEDIUM
- [x] **Bug #6**: `admin.py` GET /users — Thêm search (username/email), filter (role, is_active)
- [x] **Bug #7**: `admin.py` GET /stats — Thêm `new_users_week`, `new_users_month`
- [x] **Bug #8**: `admin.py` schema + model — Validate `role` chỉ nhận `"user"` / `"admin"` (dùng `Literal`)
- [x] Thêm link Admin Panel vào `Sidebar.jsx` cho users có `role === "admin"`
- [x] Thêm search bar + filter UI vào `AdminUsers.jsx` và `AdminTips.jsx`

### P3 — LOW
- [x] **Bug #9**: `AdminDashboard.jsx:7` — Đổi `FormatPainterOutlined` → icon phù hợp cho water logs
- [x] **Bug #10**: `AdminDashboard.jsx:41-43` — Bỏ hoặc lấy data thực cho chart "Hôm nay"
- [x] **Bug #11**: `admin.py:32` — Fix `active_users_today` logic (dùng activity log thay vì `updated_at`)
- [x] Thêm `created_at` vào `HealthTipOut` schema
- [x] Replace `datetime.utcnow()` → `datetime.now(timezone.utc)` (deprecated Python 3.12+)

## Phase 8C: Admin Panel — Monitoring & Content 🟡
> **Prerequisite**: Phase 8B xong

### Giám sát AI Chat
- [ ] Backend `GET /api/v1/admin/chat-logs` — Danh sách phiên chat (filter by user, date range, pagination)
- [ ] Backend `GET /api/v1/admin/chat-logs/:session_id` — Chi tiết phiên chat
- [ ] Tạo `src/pages/admin/AdminChatLogs.jsx` — Xem lịch sử chat (chỉ đọc) — phát hiện lạm dụng

### Thống kê tổng hợp
- [ ] Backend `GET /api/v1/admin/stats/nutrition` — Thống kê dinh dưỡng (thực phẩm phổ biến, calo trung bình, phân bố bữa ăn)
- [ ] Backend `GET /api/v1/admin/stats/water` — Thống kê nước (lượng TB/ngày, % đạt mục tiêu)
- [ ] Tạo `src/pages/admin/AdminAnalytics.jsx` — Biểu đồ thống kê tổng hợp (Nutrition + Water + User growth)

### Activity Log & Cấu hình
- [ ] Tạo `ActivityLog` model — Log hành động quan trọng (register, login, password change, account delete)
- [ ] Backend middleware ghi log tự động cho các action quan trọng
- [ ] Tạo `src/pages/admin/AdminActivityLog.jsx` — Bảng activity log (Ant Design Table, filter by action type/user/date)
- [ ] Backend `GET/PUT /api/v1/admin/config` — Đọc/sửa cấu hình hệ thống (daily water target, calorie defaults, chat limit/ngày)
- [ ] Backend `GET/PUT /api/v1/admin/ai-prompt` — Đọc/sửa system prompt Gemini AI (không cần redeploy)
- [ ] Tạo `src/pages/admin/AdminSettings.jsx` — Giao diện cấu hình hệ thống + AI prompt editor
- [ ] Backend `GET /api/v1/admin/export/users` — Export danh sách user ra CSV
- [ ] Tạo nút Export trong `AdminUsers.jsx` — Download CSV

---

## Backlog (Pending User Decision)
- [ ] Implement Forgot Password flow (backend chưa có endpoint)
- [ ] Implement file upload cho avatar (cần kiểm tra backend support)
- [ ] Implement Connected Apps integration (Strava, Apple Health) — thực hay mockup?
- [ ] Implement Dark Mode toàn diện (hiện Navbar có icon nhưng không hoạt động)

## Backlog — Admin Panel Nâng Cao (Nhóm 4 — Tương lai)
- [ ] Quản lý gói Premium — subscription, nâng/hạ cấp user (khi có monetization)
- [ ] Giám sát Gemini API — tracking usage, cost, rate limiting per user
- [ ] Backup & Restore — trigger backup database từ admin panel
- [ ] Multi-admin roles — phân quyền chi tiết: `super_admin`, `moderator`, `content_manager`
- [ ] Gửi thông báo broadcast — thông báo tới tất cả users hoặc nhóm user

---

**Tổng: 79 tasks chính + 16 bug fixes + 9 backlog | 12 Phases (0–8C + 8-FIX) | Recommend: Phase 8-FIX → 8C**
