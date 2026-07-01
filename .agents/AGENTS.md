# Hướng dẫn Workflow cho các Agent

Dự án này sử dụng một quy trình làm việc (workflow) bao gồm nhiều bước phối hợp giữa các Agent khác nhau nhằm đảm bảo chất lượng code và hiệu quả phát triển. Mọi quá trình phát triển tính năng mới hay sửa lỗi đều nên tuân theo quy trình dưới đây:

## Quy trình làm việc (Workflow)

1. **Nghiên cứu (Research)**: 
   - Nhiệm vụ: Phân tích yêu cầu từ User, đọc hiểu mã nguồn hiện tại, tìm hiểu các giải pháp khả thi.
   - Output: Ý tưởng giải pháp, kiến trúc tổng quan.

2. **Tạo Task (Task)**:
   - Nhiệm vụ: Chuyển đổi kết quả nghiên cứu thành các công việc (task) cụ thể, chi tiết.
   - Output: Danh sách các task cần thực hiện (ví dụ trong `task.md`).

3. **Lập trình (Developer)**:
   - Nhiệm vụ: Viết code thực hiện các task đã đề ra. Áp dụng các quy tắc về Frontend/Backend của dự án.
   - Output: Code mới, các file đã được chỉnh sửa.

4. **Review Code (Code Reviewer Agent)**:
   - Nhiệm vụ: Gọi **Code Reviewer Agent** để kiểm tra lại toàn bộ đoạn code vừa được viết.
   - Output: Báo cáo chất lượng code, danh sách các bug tiềm ẩn, các điểm cần tối ưu.

5. **Tạo Task Sửa lỗi (Task)**:
   - Nhiệm vụ: Từ kết quả của Code Reviewer, tạo các task chi tiết để fix bug hoặc refactor code.
   - Output: Danh sách task fix bug.

6. **Sửa lỗi (Bug Fixer Agent)**:
   - Nhiệm vụ: Gọi **Bug Fixer Agent** để tiếp nhận các task sửa lỗi. Agent này sẽ tập trung giải quyết triệt để các bug được report.
   - Output: Code đã được fix, hoạt động ổn định.

## Tóm tắt luồng đi:
`Nghiên cứu -> Tạo Task -> Developer (Viết code) -> Review Code -> Tạo Task (Lỗi/Refactor) -> Fix Bug`

Hãy tuân thủ nghiêm ngặt Workflow này để đảm bảo mã nguồn luôn đạt chất lượng tốt nhất.

---

# Giao tiếp & General Rules

- **Giao diện**: Phải mobile friendly.
- **Task**: Mỗi khi xong task phải đánh dấu `[x]` vào ô.
- **Format**: Dùng Markdown cho tất cả document.
- **Giao tiếp Agent**: Khi chuyển giao công việc giữa các Agent, cần phải cung cấp tóm tắt tiến độ hiện tại và bước tiếp theo.
- **Quyết định kiến trúc**: Tham khảo `memory.md` trước khi đưa ra thay đổi lớn.
- **Cập nhật tiến độ**: Update file `task.md` sau khi hoàn thành một khối lượng công việc đáng kể.

# Backend Rules
Guidelines and standards for the server-side logic and API.
- **API Design**: Tuân thủ chuẩn REST/GraphQL.
- **Security**: Tuân thủ các quy tắc Authentication và Authorization hiện hành.

# Frontend Rules
Guidelines and standards for the user interface.
- **Styling**: Ưu tiên dùng Tailwind cho Layout và Styling; chỉ dùng Ant Design cho các Component chức năng cần logic phức tạp như Form, Table, Modal.
