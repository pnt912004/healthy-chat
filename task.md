# Danh sách Task (Workflow)

## Vấn đề 1: Code deploy lên Vercel báo lỗi timeout không đăng nhập được
- Nguyên nhân: Backend host trên Render free tier mất khoảng 50s để khởi động lại sau khi sleep. Cấu hình Axios ở frontend đang để timeout là 15s, dẫn đến bị ngắt kết nối trước khi backend kịp phản hồi.
- [x] Task 1: Tăng `timeout` trong `frontend/src/services/api.js` lên `60000` (60 giây).
- [x] Task 2: Hướng dẫn người dùng cấu hình biến môi trường `VITE_API_URL` trên Vercel.

## Vấn đề 2: Đăng ký không có email gửi về
- Nguyên nhân: Chưa cấu hình thông tin SMTP trong biến môi trường của backend, hệ thống chạy ở chế độ "Mock Email".
- [x] Task 3: Chỉnh sửa lại `auth.py` để bổ sung thông báo rõ ràng hơn nếu hệ thống chưa cài đặt email.
- [x] Task 4: Hướng dẫn người dùng cấu hình SMTP.
