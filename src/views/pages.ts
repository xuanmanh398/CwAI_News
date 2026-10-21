// src/views/pages.ts
// Static institutional & policy pages for Tin Công Nghệ

export function renderAboutPage(): string {
  return `
<div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:36px; max-width:900px; margin:30px auto; line-height:1.8;">
  <h1 style="color:var(--primary); font-size:2rem; margin-bottom:20px; border-bottom:2px solid var(--primary); padding-bottom:10px;">
    Giới thiệu về Tin Công Nghệ
  </h1>
  <p class="lead" style="font-size:1.15rem; font-weight:500; color:#374151; margin-bottom:20px;">
    <strong>Tin Công Nghệ</strong> là chuyên trang thông tin điện tử tổng hợp chuyên biệt về bước tiến của Trí tuệ nhân tạo (AI), phần mềm, an ninh mạng, thiết bị công nghệ và hệ sinh thái đổi mới sáng tạo số tại Việt Nam cũng như trên toàn cầu.
  </p>

  <h3 style="color:#111827; margin:24px 0 12px;">Sứ mệnh của chúng tôi</h3>
  <p>
    Chúng tôi hướng tới việc cung cấp cho độc giả Việt Nam các bản tin công nghệ nhanh chóng, chính xác, khách quan và dễ tiếp cận. Trong kỷ nguyên bùng nổ thông tin và sự trỗi dậy của AI, sứ mệnh của Tin Công Nghệ là chắt lọc dữ liệu đáng tin cậy, giải thích bản chất công nghệ và luôn trích dẫn nguồn gốc kiểm chứng rõ ràng.
  </p>

  <h3 style="color:#111827; margin:24px 0 12px;">Mô hình vận hành Tòa soạn hiện đại</h3>
  <p>
    Tin Công Nghệ ứng dụng mô hình tòa soạn số lai (Human-in-the-loop Hybrid Newsroom):
  </p>
  <ul style="padding-left:24px; margin-bottom:20px;">
    <li><strong>Thu thập tin tức tự động:</strong> Kết nối thông qua giao thức chuẩn RSS/Atom từ các nguồn cơ quan báo chí, viện nghiên cứu và cổng công nghệ chính thống.</li>
    <li><strong>Trợ lý AI biên tập:</strong> Hỗ trợ dịch thuật, tổng hợp luận điểm, phát hiện sự kiện và đề xuất phân loại khoa học.</li>
    <li><strong>Con người kiểm duyệt tuyệt đối:</strong> 100% bản tin trước khi đến tay độc giả đều phải được ban biên tập người thật đối chiếu dữ kiện, chỉnh sửa và bấm nút phê duyệt xuất bản.</li>
  </ul>

  <h3 style="color:#111827; margin:24px 0 12px;">Cam kết về bản quyền và nguồn tin</h3>
  <p>
    Website tôn trọng quyền sở hữu trí tuệ của các cơ quan báo chí và tác giả gốc. Mọi bài viết tổng hợp đều đính kèm thông tin tên nguồn và liên kết trực tiếp tới bài báo gốc.
  </p>
</div>
  `.trim();
}

export function renderEditorialPolicyPage(): string {
  return `
<div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:36px; max-width:900px; margin:30px auto; line-height:1.8;">
  <h1 style="color:var(--primary); font-size:2rem; margin-bottom:20px; border-bottom:2px solid var(--primary); padding-bottom:10px;">
    Nguyên tắc biên tập & Đạo đức sử dụng AI
  </h1>

  <p class="lead" style="font-size:1.15rem; font-weight:500; color:#374151; margin-bottom:20px;">
    Tin Công Nghệ cam kết thực thi các tiêu chuẩn đạo đức báo chí nghiêm ngặt trong việc ứng dụng công nghệ trí tuệ nhân tạo (AI).
  </p>

  <h3 style="color:#111827; margin:24px 0 12px;">1. Con người kiểm soát quyết định xuất bản (Human-in-the-loop)</h3>
  <p>
    Hệ thống kỹ thuật của chúng tôi được thiết kế có rào chắn tuyệt đối: <strong>Không có bất kỳ cơ chế tự động nào cho phép AI tự động xuất bản bài viết lên trang chủ</strong>. Tất cả các nội dung do AI hỗ trợ tạo bản nháp đều được đưa vào trạng thái chờ duyệt (pending) và chỉ được xuất bản sau khi biên tập viên đã xác thực.
  </p>

  <h3 style="color:#111827; margin:24px 0 12px;">2. Chống ảo giác dữ liệu (Anti-Hallucination)</h3>
  <p>
    Mô hình AI chỉ được phép xử lý dựa trên dữ kiện, số liệu và trích dẫn được cung cấp từ nguồn tin gốc. AI tuyệt đối bị nghiêm cấm bịa đặt tên tuổi, phát biểu phát ngôn, số liệu doanh thu hoặc ngày giờ không có thật. Nếu nguồn tin gốc thiếu dữ kiện, hệ thống đánh dấu bản ghi cần biên tập viên bổ sung tài liệu.
  </p>

  <h3 style="color:#111827; margin:24px 0 12px;">3. Minh bạch với độc giả</h3>
  <p>
    Mọi bài viết có sự trợ giúp của AI đều được gắn nhãn ghi nhận công khai: <em>"Bản tin được tổng hợp với sự hỗ trợ của AI và được phê duyệt bởi Ban biên tập"</em>. Độc giả luôn có quyền biết quy trình hình thành nội dung họ tiếp nhận.
  </p>

  <h3 style="color:#111827; margin:24px 0 12px;">4. Bản quyền hình ảnh & Trích dẫn</h3>
  <p>
    Chúng tôi không sao chép nguyên văn tác phẩm báo chí của bên thứ ba, không tải lại hình ảnh độc quyền khi chưa có thỏa thuận cấp phép. Các bài viết đều dẫn chiếu link trực tiếp đến bài gốc của nguồn.
  </p>
</div>
  `.trim();
}

export function renderCorrectionPolicyPage(): string {
  return `
<div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:36px; max-width:900px; margin:30px auto; line-height:1.8;">
  <h1 style="color:var(--primary); font-size:2rem; margin-bottom:20px; border-bottom:2px solid var(--primary); padding-bottom:10px;">
    Chính sách sửa lỗi & Đính chính thông tin
  </h1>

  <p style="margin-bottom:20px;">
    Tin Công Nghệ coi trọng sự thật và tính chính xác lên hàng đầu. Khi có thông tin chưa chuẩn xác hoặc có sự thay đổi từ nguồn tin gốc, chúng tôi xử lý theo quy trình sau:
  </p>

  <h3 style="color:#111827; margin:20px 0 10px;">1. Quy trình tiếp nhận yêu cầu</h3>
  <p>
    Độc giả, đối tác hoặc nhân vật được đề cập trong bài viết có thể gửi thông báo yêu cầu đính chính qua email: <a href="mailto:bientap@tincongnghe.vn" style="color:var(--primary); font-weight:600;">bientap@tincongnghe.vn</a> hoặc qua trang Liên hệ. Vui lòng cung cấp link bài viết và bằng chứng tài liệu đối chiếu.
  </p>

  <h3 style="color:#111827; margin:20px 0 10px;">2. Thời hạn xử lý</h3>
  <p>
    Ban biên tập sẽ tiến hành kiểm tra lại nguồn tin gốc và phản hồi, cập nhật nội dung trong vòng <strong>24 giờ làm việc</strong> kể từ khi tiếp nhận thông tin hợp lệ.
  </p>

  <h3 style="color:#111827; margin:20px 0 10px;">3. Ghi chú đính chính công khai</h3>
  <p>
    Đối với các đính chính có tính chất trọng yếu (số liệu, chính sách, phát ngôn), chúng tôi sẽ cập nhật bài viết đồng thời ghi rõ dòng thông báo ở cuối bài: <em>"Đính chính: Bài viết được cập nhật lúc [giờ, ngày] để điều chỉnh lại dữ liệu [nội dung cụ thể]."</em>
  </p>
</div>
  `.trim();
}

export function renderPrivacyPolicyPage(): string {
  return `
<div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:36px; max-width:900px; margin:30px auto; line-height:1.8;">
  <h1 style="color:var(--primary); font-size:2rem; margin-bottom:20px; border-bottom:2px solid var(--primary); padding-bottom:10px;">
    Chính sách bảo mật thông tin
  </h1>
  <p style="margin-bottom:16px;"><em>Cập nhật lần cuối: Tháng 10 năm 2025</em></p>

  <p>Chuyên trang <strong>Tin Công Nghệ</strong> tôn trọng và cam kết bảo vệ thông tin cá nhân của người sử dụng theo quy định của pháp luật Việt Nam (Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân) và các tiêu chuẩn bảo mật quốc tế.</p>

  <h3 style="color:#111827; margin:20px 0 10px;">1. Thông tin chúng tôi thu thập</h3>
  <p>Khi bạn truy cập website, máy chủ Cloudflare có thể tự động ghi nhận các thông tin kỹ thuật không định danh như: địa chỉ IP, loại trình duyệt, hệ điều hành, thời gian truy cập và trang đã xem. Chúng tôi không yêu cầu độc giả phải đăng ký tài khoản hay cung cấp thông tin cá nhân nhạy cảm khi đọc báo.</p>

  <h3 style="color:#111827; margin:20px 0 10px;">2. Cookies và Dịch vụ Quảng cáo của bên thứ ba</h3>
  <p>Website có thể sử dụng cookie để ghi nhớ tùy chọn giao diện hoặc phân phối quảng cáo qua Google AdSense khi được kích hoạt. Google và các đối tác quảng cáo có thể sử dụng cookie (như cookie DART) để phân phối quảng cáo dựa trên lịch sử truy cập hợp pháp của người dùng trên Internet. Bạn có thể vô hiệu hóa cookie trong cài đặt trình duyệt của mình.</p>

  <h3 style="color:#111827; margin:20px 0 10px;">3. Bảo mật hệ thống</h3>
  <p>Chúng tôi triển khai các giao thức mã hóa dữ liệu HTTPS (TLS 1.3), tường lửa WAF và các biện pháp bảo vệ đám mây Cloudflare để đảm bảo an toàn tuyệt đối cho người truy cập.</p>
</div>
  `.trim();
}

export function renderTermsPage(): string {
  return `
<div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:36px; max-width:900px; margin:30px auto; line-height:1.8;">
  <h1 style="color:var(--primary); font-size:2rem; margin-bottom:20px; border-bottom:2px solid var(--primary); padding-bottom:10px;">
    Điều khoản sử dụng
  </h1>
  <p style="margin-bottom:20px;">Chào mừng bạn đến với Tin Công Nghệ. Khi truy cập và sử dụng dịch vụ trên trang web, bạn đồng ý tuân thủ các điều khoản sau:</p>

  <h3 style="color:#111827; margin:20px 0 10px;">1. Mục đích sử dụng</h3>
  <p>Nội dung trên website được cung cấp nhằm mục đích tham khảo, cập nhật tin tức công nghệ và học hỏi. Độc giả không sử dụng các công cụ crawler, bot quét dữ liệu gây quá tải máy chủ hoặc can thiệp vào tính an toàn của trang web.</p>

  <h3 style="color:#111827; margin:20px 0 10px;">2. Bản quyền và quyền tác giả</h3>
  <p>Bản tin tổng hợp thuộc quyền sở hữu của Tin Công Nghệ cùng các tổ chức cung cấp nguồn tin gốc. Bạn có thể chia sẻ đường liên kết bài viết nhưng không được tự ý sao chép nguyên văn với mục đích thương mại khi chưa có sự đồng ý bằng văn bản.</p>

  <h3 style="color:#111827; margin:20px 0 10px;">3. Tuyên bố miễn trừ trách nhiệm</h3>
  <p>Tin Công Nghệ nỗ lực tối đa để đảm bảo dữ liệu đăng tải là chính xác và kịp thời. Tuy nhiên, các quyết định đầu tư, mua bán thiết bị hay ứng dụng kỹ thuật thuộc về sự cân nhắc độc lập của mỗi cá nhân độc giả.</p>
</div>
  `.trim();
}

export function renderContactPage(): string {
  return `
<div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:36px; max-width:900px; margin:30px auto; line-height:1.8;">
  <h1 style="color:var(--primary); font-size:2rem; margin-bottom:20px; border-bottom:2px solid var(--primary); padding-bottom:10px;">
    Liên hệ Ban Biên tập
  </h1>
  <p style="margin-bottom:20px;">Quý độc giả, đối tác công nghệ và cơ quan báo chí có thể liên hệ với chúng tôi theo các kênh sau:</p>

  <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:20px; margin-bottom:24px;">
    <p><strong>Tòa soạn:</strong> Chuyên trang Tin Công Nghệ</p>
    <p><strong>Email biên tập:</strong> <a href="mailto:bientap@tincongnghe.vn" style="color:var(--primary); font-weight:600;">bientap@tincongnghe.vn</a></p>
    <p><strong>Email hợp tác truyền thông:</strong> <a href="mailto:contact@tincongnghe.vn" style="color:var(--primary); font-weight:600;">contact@tincongnghe.vn</a></p>
    <p><strong>Địa chỉ:</strong> Khu Công nghệ cao Hòa Lạc / TP. Hồ Chí Minh, Việt Nam</p>
  </div>

  <h3 style="color:#111827; margin:20px 0 10px;">Gửi tin bài & Thông cáo báo chí</h3>
  <p>Nếu đơn vị của bạn có thông cáo báo chí về sản phẩm AI mới, cập nhật phần mềm hoặc phát hiện lỗ hổng an ninh mạng cần công bố rộng rãi, hãy gửi email trực tiếp cho chúng tôi kèm theo tài liệu kỹ thuật có liên quan.</p>
</div>
  `.trim();
}

export function renderNotFoundPage(): string {
  return `
<div style="background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:60px 20px; text-align:center; max-width:700px; margin:50px auto;">
  <div style="font-size:4rem; font-weight:900; color:var(--primary); line-height:1;">404</div>
  <h2 style="font-size:1.6rem; color:#111827; margin:16px 0;">Không tìm thấy trang yêu cầu</h2>
  <p style="color:#6b7280; margin-bottom:24px; font-size:1rem;">
    Đường dẫn bạn truy cập có thể đã bị thay đổi, xóa bỏ hoặc tạm thời không khả dụng.
  </p>
  <div style="display:flex; justify-content:center; gap:12px;">
    <a href="/" style="background:var(--primary); color:#fff; padding:10px 24px; border-radius:6px; font-weight:600; text-decoration:none;">Về Trang chủ</a>
    <a href="/chuyen-muc/tri-tue-nhan-tao" style="background:#e2e8f0; color:#334155; padding:10px 24px; border-radius:6px; font-weight:600; text-decoration:none;">Chuyên mục AI</a>
  </div>
</div>
  `.trim();
}
