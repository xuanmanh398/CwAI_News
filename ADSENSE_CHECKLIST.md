# CHECKLIST CHUẨN BỊ VÀ ĐĂNG KÝ GOOGLE ADSENSE CHO "TIN CÔNG NGHỆ"

Tài liệu này hướng dẫn chi tiết quy trình chuẩn bị trang web, kiểm tra điều kiện và tối ưu nội dung để tối đa hóa khả năng được Google AdSense phê duyệt tài khoản nhà xuất bản với chi phí 0 đồng.

---

## 1. NGUYÊN TẮC QUAN TRỌNG VỀ BẢN QUYỀN VÀ NỘI DUNG AI

> [!IMPORTANT]
> Google AdSense kiểm duyệt rất chặt chẽ chính sách **Nội dung có giá trị thấp (Low Value Content)** và **Nội dung sao chép (Scraped Content)**.
> - **Tuyệt đối không** xuất bản hàng loạt hàng trăm bài viết do AI tạo tự động mà không có con người biên tập.
> - Hệ thống Tin Công Nghệ đã mặc định đưa tất cả bài viết mới vào trạng thái `pending` (chờ duyệt).
> - Biên tập viên cần đối chiếu dữ kiện, chỉnh sửa ngữ văn tự nhiên, bổ sung góc nhìn phân tích hoặc bối cảnh thị trường Việt Nam trước khi bấm xuất bản.

---

## 2. CHECKLIST TRƯỚC KHI GỬI ĐƠN XÉT DUYỆT

### A. Số lượng và chất lượng bài viết
- [ ] Website đã có tối thiểu **25 - 40 bài viết chất lượng cao** đã được xuất bản (`status = 'published'`).
- [ ] Phân bổ đồng đều vào cả 5 chuyên mục:
  - Trí tuệ nhân tạo (AI)
  - Phần mềm & Ứng dụng
  - An ninh mạng
  - Thiết bị
  - Công nghệ mới
- [ ] Mỗi bài viết có độ dài tối thiểu từ 400 - 800 từ, có sapo rõ ràng, chia đề mục `<h3>`, trích dẫn nguồn uy tín và ghi nhận minh bạch việc sử dụng công cụ AI.

### B. Các trang chính sách bắt buộc (Đã được tạo sẵn trong mã nguồn)
Google AdSense bắt buộc website phải có các trang điều khoản và chính sách độc lập:
- [x] **Giới thiệu tòa soạn (`/gioi-thieu`)**: Nêu rõ sứ mệnh, phương pháp làm việc và mô hình tòa soạn số.
- [x] **Nguyên tắc biên tập & Đạo đức AI (`/nguyen-tac-bien-tap`)**: Cam kết Human-in-the-loop, chống ảo giác dữ liệu và trích dẫn bản quyền.
- [x] **Chính sách sửa lỗi & Đính chính (`/chinh-sach-dinh-chinh`)**: Quy trình tiếp nhận và xử lý phản ánh sai sót.
- [x] **Chính sách bảo mật (`/chinh-sach-bao-mat`)**: Tuân thủ quy định bảo vệ dữ liệu cá nhân, nêu rõ việc sử dụng Cookie và quảng cáo bên thứ ba (Google AdSense / DART cookie).
- [x] **Điều khoản sử dụng (`/dieu-khoan-su-dung`)**: Quy định quyền và trách nhiệm của người đọc.
- [x] **Liên hệ (`/lien-he`)**: Cung cấp email biên tập chính thức và địa chỉ liên lạc.

### C. Trải nghiệm người dùng và Kỹ thuật
- [x] Giao diện responsive 100% trên thiết bị di động, tablet và máy tính.
- [x] Tốc độ tải trang nhanh (được tối ưu hóa qua Cloudflare Edge Serverless & CSS thuần tối giản).
- [x] Điều hướng menu và thanh tìm kiếm hoạt động chuẩn xác, không có liên kết hỏng (broken links).
- [x] Sitemap động `/sitemap.xml` và `/robots.txt` hoạt động chính xác.
- [x] Đã thiết lập Google Search Console và index các bài viết chính thức.

---

## 3. CÁC BƯỚC THỰC HIỆN SAU KHI ĐƯỢC CẤP MÃ ADSENSE

1. **Lấy mã Publisher ID:**
   Sau khi tạo tài khoản Google AdSense, bạn sẽ nhận được mã dạng: `ca-pub-XXXXXXXXXXXXXXXX`.

2. **Cấu hình trên Cloudflare Pages:**
   Vào trang quản trị Cloudflare:
   - `Workers & Pages` > Chọn dự án `tin-cong-nghe-ai` > `Settings` > `Environment Variables`.
   - Thêm hoặc sửa 2 biến:
     - `ADSENSE_ENABLED = "true"`
     - `ADSENSE_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX"`
   - Bấm **Save and Deploy**.

3. **Kiểm tra tệp `ads.txt` tự động:**
   - Hệ thống Tin Công Nghệ đã tích hợp sẵn endpoint dynamic `ads.txt`.
   - Khi cấu hình `ADSENSE_CLIENT`, truy cập: `https://your-domain.com/ads.txt` sẽ tự động hiển thị dòng chuẩn:
     ```text
     google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
     ```
   - Không cần tải file thủ công lên hosting!

4. **Kích hoạt các vị trí quảng cáo (Ad Slots):**
   Trong hệ thống mã nguồn, các vị trí quảng cáo tuân thủ tiêu chuẩn Google:
   - `ad_header_leaderboard`: Dưới thanh điều hướng, trên cùng của trang.
   - `ad_infeed_home`: Xen kẽ giữa các khối chuyên mục trang chủ.
   - `ad_inarticle_body`: Trong thân bài viết, sau đoạn phân tích chính.
   - `ad_sidebar_top` & `ad_sidebar_bottom`: Cột phụ bên phải.
   - Khi chưa kích hoạt, hệ thống hiển thị khung placeholder kín đáo cho nhà phát triển, không làm vỡ giao diện.
