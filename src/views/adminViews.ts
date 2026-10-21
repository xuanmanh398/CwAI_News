// src/views/adminViews.ts
// Admin CMS UI views: Dashboard, Queue, Editor, Feed Manager, and Audit Logs

import { Article, Feed, IngestionRun, AuditLog } from '../types/index.js';
import { escapeHtml } from '../security/sanitize.js';
import { ADMIN_CSS } from './styles.js';

export function renderAdminLoginPage(errorMessage?: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đăng nhập Quản trị | Tin Tức Việt CMS</title>
  <link rel="stylesheet" href="/static/css/admin.css">
  <style>${ADMIN_CSS}</style>
  <style>
    .login-box {
      max-width: 420px;
      margin: 100px auto;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 36px 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
  </style>
</head>
<body class="admin-body">
  <div class="login-box">
    <div style="text-align:center; margin-bottom:24px;">
      <h2 style="color:var(--admin-primary); margin-bottom:6px;">TIN TỨC VIỆT</h2>
      <p style="font-size:0.88rem; color:var(--admin-muted);">Hệ thống Tòa soạn & Quản trị Biên tập</p>
    </div>

    ${
      errorMessage
        ? `<div class="alert-box alert-warning" style="padding:10px 14px; font-size:0.85rem; margin-bottom:18px;">
            ${escapeHtml(errorMessage)}
           </div>`
        : ''
    }

    <form action="/api/admin/login" method="POST">
      <div class="form-group">
        <label for="token">Mã khóa quản trị (Admin Token)</label>
        <input type="password" id="token" name="token" required placeholder="Nhập ADMIN_TOKEN bảo mật..." autocomplete="current-password" autofocus>
        <small style="color:#64748b; font-size:0.75rem; margin-top:4px; display:block;">
          Khóa bí mật được thiết lập trong Cloudflare Environment Variables.
        </small>
      </div>

      <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; padding:10px; font-size:0.95rem; margin-top:10px;">
        Đăng nhập Tòa soạn
      </button>
    </form>

    <div style="text-align:center; margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
      <a href="/" style="font-size:0.82rem; color:var(--admin-muted); text-decoration:none;">« Về trang chủ Tin Tức Việt</a>
    </div>
  </div>
</body>
</html>`;
}

export function renderCreateArticleView(): string {
  const categories = [
    'Trí tuệ nhân tạo (AI)',
    'Phần mềm',
    'An ninh mạng',
    'Thiết bị',
    'Công nghệ mới',
  ];

  return `
<div>
  <div style="margin-bottom:16px;">
    <a href="/admin" style="color:var(--admin-primary); font-weight:600; text-decoration:none;">« Quay lại Bảng điều khiển</a>
  </div>

  <div class="editor-grid">
    <div>
      <div class="editor-card">
        <h2 style="font-size:1.3rem; margin-bottom:20px; color:var(--admin-primary);">✍️ Soạn thảo bài viết mới (Thủ công)</h2>

        <form id="createForm">
          <div class="form-group">
            <label for="title">Tiêu đề bài viết (*)</label>
            <input type="text" id="title" name="title" placeholder="Nhập tiêu đề hấp dẫn, chuẩn mực..." required autofocus>
          </div>

          <div class="form-group">
            <label for="excerpt">Sapo / Đoạn mở đầu tóm tắt (*)</label>
            <textarea id="excerpt" name="excerpt" rows="3" placeholder="Đoạn văn 2-3 câu nêu bật thông điệp quan trọng nhất..." required></textarea>
          </div>

          <div class="form-group">
            <label for="category">Chuyên mục (*)</label>
            <select id="category" name="category" required>
              ${categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="tags">Từ khóa / Thẻ phân loại (ngăn cách bởi dấu phẩy)</label>
            <input type="text" id="tags" name="tags" placeholder="AI, Công nghệ, Phần mềm...">
          </div>

          <div class="form-group">
            <label for="source_name">Tác giả / Tên nguồn</label>
            <input type="text" id="source_name" name="source_name" value="Ban biên tập Tin Tức Việt" required>
          </div>

          <div class="form-group">
            <label for="source_url">Link bài gốc / Tài liệu tham khảo (nếu có)</label>
            <input type="url" id="source_url" name="source_url" placeholder="https://...">
          </div>

          <div class="form-group">
            <label for="image_url">Ảnh đại diện bài viết (URL ảnh)</label>
            <input type="url" id="image_url" name="image_url" placeholder="https://example.com/image.jpg" oninput="previewCreateImage(this.value)">
            <div id="create_image_preview_box" style="margin-top:8px; display:none;">
              <img id="create_image_preview_img" src="" alt="Xem trước ảnh" style="max-height:160px; border-radius:6px; border:1px solid #cbd5e1; object-fit:cover;">
            </div>
          </div>

          <div class="form-group">
            <label for="content">Nội dung chi tiết bài viết (HTML) (*)</label>
            <textarea id="content" name="content" rows="18" placeholder="<p>Đoạn mở đầu...</p>
<h3>1. Chi tiết sự kiện</h3>
<p>Nội dung phân tích...</p>
<ul>
  <li>Điểm nổi bật 1</li>
  <li>Điểm nổi bật 2</li>
</ul>
<h3>2. Đánh giá và ý nghĩa</h3>
<p>Nhận định chuyên môn...</p>" required></textarea>
            <small style="color:#64748b; font-size:0.75rem;">Hỗ trợ các thẻ HTML: &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;blockquote&gt;</small>
          </div>

          <!-- SEO Section -->
          <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
            <h4 style="margin-bottom:12px; font-size:1rem; color:#334155;">Tối ưu hóa SEO (Google Search)</h4>
            <div class="form-group">
              <label for="seo_title">Tiêu đề SEO (để trống sẽ lấy tiêu đề bài viết)</label>
              <input type="text" id="seo_title" name="seo_title" placeholder="Tiêu đề hiển thị trên Google...">
            </div>
            <div class="form-group">
              <label for="seo_description">Thẻ mô tả SEO (để trống sẽ lấy đoạn Sapo)</label>
              <textarea id="seo_description" name="seo_description" rows="2" placeholder="Mô tả dưới 160 ký tự..."></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div style="display:flex; gap:12px; margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
            <button type="button" onclick="submitArticle('pending')" class="btn btn-secondary" style="font-size:0.95rem;">💾 Lưu bản nháp</button>
            <button type="button" onclick="submitArticle('published')" class="btn btn-success" style="font-size:1rem; padding:10px 20px;">🚀 Xuất bản ngay</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Right Sidebar Guidance -->
    <div>
      <div class="editor-card">
        <h3 style="font-size:1.05rem; margin-bottom:14px; color:#1e3a8a;">Tiêu chuẩn bài viết chuyên nghiệp</h3>
        <ul style="font-size:0.85rem; line-height:1.8; color:#475569; padding-left:18px;">
          <li><strong>Tiêu đề:</strong> Rõ ràng, đúng sự thật, không giật tít sai lệch.</li>
          <li><strong>Sapo:</strong> Tóm lược nhanh 2-3 ý chính giúp người bận rộn nắm ngay cốt lõi.</li>
          <li><strong>Thân bài:</strong> Nên chia thành 2-3 đề mục <code>&lt;h3&gt;</code> để bài viết thoáng mắt, dễ đọc trên di động.</li>
          <li><strong>Nguồn:</strong> Ghi rõ tác giả hoặc nguồn tin tức nếu tổng hợp từ báo chí.</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<script>
  async function submitArticle(status) {
    const title = document.getElementById('title').value.trim();
    const excerpt = document.getElementById('excerpt').value.trim();
    const content = document.getElementById('content').value.trim();
    const category = document.getElementById('category').value;
    const tags = document.getElementById('tags').value.split(',').map(t => t.trim()).filter(Boolean);
    const source_name = document.getElementById('source_name').value.trim() || 'Ban biên tập Tin Tức Việt';
    const source_url = document.getElementById('source_url').value.trim();
    const seo_title = document.getElementById('seo_title').value.trim();
    const seo_description = document.getElementById('seo_description').value.trim();
    const image_url = document.getElementById('image_url').value.trim();

    if (!title || !content || !excerpt) {
      alert('Vui lòng điền đầy đủ Tiêu đề, Sapo và Nội dung bài viết!');
      return;
    }

    const actionText = status === 'published' ? 'XUẤT BẢN NGAY lên trang chủ' : 'LƯU VÀO BẢN NHÁP';
    if (!confirm('Xác nhận bạn muốn ' + actionText + '?')) return;

    try {
      const res = await fetch('/api/admin/articles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, excerpt, content, category, tags, source_name, source_url, seo_title, seo_description, image_url, status
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(status === 'published' ? 'Đã xuất bản bài viết thành công lên trang chủ!' : 'Đã lưu bản nháp thành công vào Hàng chờ duyệt!');
        window.location.href = status === 'published' ? '/' : '/admin/queue';
      } else {
        alert('Lỗi: ' + (data.message || 'Không thể tạo bài viết'));
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  }

  function previewCreateImage(url) {
    const box = document.getElementById('create_image_preview_box');
    const img = document.getElementById('create_image_preview_img');
    if (url && url.startsWith('http')) {
      img.src = url;
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
    }
  }
</script>
  `.trim();
}

export function renderDashboardView(data: {
  totalCount: number;
  pendingCount: number;
  publishedCount: number;
  rejectedCount: number;
  latestRun: IngestionRun | null;
  recentLogs: AuditLog[];
}): string {
  const { totalCount, pendingCount, publishedCount, rejectedCount, latestRun, recentLogs } = data;

  return `
<div>
  <!-- Stat Cards -->
  <div class="stats-grid">
    <div class="stat-card pending">
      <div class="label">Chờ biên tập duyệt</div>
      <div class="value">${pendingCount}</div>
      <a href="/admin/queue" style="font-size:0.82rem; color:var(--admin-warning); font-weight:600;">Xem hàng chờ »</a>
    </div>
    <div class="stat-card published">
      <div class="label">Đã xuất bản</div>
      <div class="value">${publishedCount}</div>
      <a href="/admin/queue?status=published" style="font-size:0.82rem; color:var(--admin-success); font-weight:600;">Xem & Xóa bài đã duyệt »</a>
    </div>
    <div class="stat-card rejected">
      <div class="label">Bản nháp từ chối</div>
      <div class="value">${rejectedCount}</div>
      <span style="font-size:0.82rem; color:var(--admin-muted);">Nội dung bị loại</span>
    </div>
    <div class="stat-card">
      <div class="label">Tổng số bài nạp</div>
      <div class="value">${totalCount}</div>
      <span style="font-size:0.82rem; color:var(--admin-muted);">Tất cả trạng thái</span>
    </div>
  </div>

  <!-- Pipeline Status & Quick Actions -->
  <div class="editor-grid">
    <!-- RSS Pipeline Box -->
    <div class="editor-card">
      <h3 style="font-size:1.15rem; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <span>Trạng thái RSS Pipeline</span>
        <button onclick="triggerRssFetch()" class="btn btn-warning" style="font-size:0.8rem;">⚡ Quét RSS ngay</button>
      </h3>
      ${
        latestRun
          ? `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px; font-size:0.88rem; line-height:1.7;">
          <p><strong>Lần chạy gần nhất:</strong> ${new Date(latestRun.started_at).toLocaleString('vi-VN')}</p>
          <p><strong>Trạng thái:</strong> <span class="badge badge-${latestRun.status === 'success' ? 'published' : 'rejected'}">${latestRun.status}</span></p>
          <p><strong>Kết quả:</strong> ${escapeHtml(latestRun.log_summary || '')}</p>
        </div>`
          : '<p style="color:var(--admin-muted);">Chưa có tiến trình lấy tin nào được ghi nhận.</p>'
      }
    </div>

    <!-- Quick Help & Principles -->
    <div class="editor-card">
      <h3 style="font-size:1.15rem; margin-bottom:14px;">Quy chuẩn Tòa soạn AI</h3>
      <ul style="font-size:0.85rem; color:#475569; line-height:1.7; padding-left:18px;">
        <li>AI chỉ tạo bản nháp hỗ trợ, con người duyệt 100%.</li>
        <li>Kiểm tra kỹ các điểm cảnh báo "Cần kiểm chứng".</li>
        <li>Bài viết xuất bản được đưa ngay vào Sitemap & RSS.</li>
      </ul>
    </div>
  </div>

  <!-- Recent Audit Logs -->
  <div class="editor-card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <h3 style="font-size:1.15rem;">Nhật ký thao tác gần nhất</h3>
      <a href="/admin/audit" class="btn btn-outline" style="font-size:0.8rem;">Xem toàn bộ »</a>
    </div>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Người thực hiện</th>
            <th>Hành động</th>
            <th>Bài viết / ID</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          ${
            recentLogs.length === 0
              ? '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Chưa có nhật ký nào.</td></tr>'
              : recentLogs
                  .map(
                    (log) => `
            <tr>
              <td>${new Date(log.created_at).toLocaleString('vi-VN')}</td>
              <td><strong>${escapeHtml(log.actor)}</strong></td>
              <td><span class="badge badge-ai">${escapeHtml(log.action)}</span></td>
              <td>${log.article_id ? `<a href="/admin/edit/${log.article_id}">${log.article_id}</a>` : '-'}</td>
              <td style="font-size:0.8rem; color:#64748b;">${escapeHtml(log.metadata ? log.metadata.slice(0, 100) : '-')}</td>
            </tr>`
                  )
                  .join('')
          }
        </tbody>
      </table>
    </div>
  </div>
</div>
  `.trim();
}

export function renderQueueView(
  articles: Article[],
  categoryFilter?: string,
  searchQuery?: string,
  statusFilter: string = 'pending'
): string {
  const statusLabel =
    statusFilter === 'published'
      ? 'Đã xuất bản'
      : statusFilter === 'rejected'
      ? 'Đã từ chối'
      : statusFilter === 'all'
      ? 'Tất cả trạng thái'
      : 'Chờ duyệt';

  return `
<div>
  <!-- Filter & Actions Bar -->
  <div class="action-bar">
    <div class="filter-group">
      <select onchange="updateParam('status', this.value)">
        <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>⏳ Chờ duyệt (Pending)</option>
        <option value="published" ${statusFilter === 'published' ? 'selected' : ''}>✅ Đã xuất bản (Published)</option>
        <option value="rejected" ${statusFilter === 'rejected' ? 'selected' : ''}>❌ Đã từ chối (Rejected)</option>
        <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>📑 Tất cả bài viết</option>
      </select>

      <select onchange="updateParam('cat', this.value)">
        <option value="">Tất cả chuyên mục</option>
        <option value="Trí tuệ nhân tạo (AI)" ${categoryFilter === 'Trí tuệ nhân tạo (AI)' ? 'selected' : ''}>Trí tuệ nhân tạo (AI)</option>
        <option value="Phần mềm" ${categoryFilter === 'Phần mềm' ? 'selected' : ''}>Phần mềm</option>
        <option value="An ninh mạng" ${categoryFilter === 'An ninh mạng' ? 'selected' : ''}>An ninh mạng</option>
        <option value="Thiết bị" ${categoryFilter === 'Thiết bị' ? 'selected' : ''}>Thiết bị</option>
        <option value="Công nghệ mới" ${categoryFilter === 'Công nghệ mới' ? 'selected' : ''}>Công nghệ mới</option>
      </select>

      <form action="/admin/queue" method="GET" style="display:flex; gap:6px; margin:0;">
        <input type="hidden" name="status" value="${escapeHtml(statusFilter)}">
        ${categoryFilter ? `<input type="hidden" name="cat" value="${escapeHtml(categoryFilter)}">` : ''}
        <input type="text" name="q" value="${escapeHtml(searchQuery || '')}" placeholder="Tìm theo tiêu đề hoặc nguồn...">
        <button type="submit" class="btn btn-secondary">Tìm</button>
      </form>
    </div>

    <div>
      <span style="font-size:0.88rem; color:var(--admin-muted); font-weight:600;">
        <strong>${articles.length}</strong> bài viết (${statusLabel})
      </span>
    </div>
  </div>

  <!-- Queue Articles Table -->
  <div class="data-table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:38%;">Tiêu đề bài viết & Nguồn gốc</th>
          <th>Chuyên mục</th>
          <th>Trạng thái</th>
          <th>Ngày cập nhật</th>
          <th style="text-align:right;">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        ${
          articles.length === 0
            ? `<tr><td colspan="5" style="text-align:center; padding:40px; color:#94a3b8;">
                Không có bài viết nào phù hợp với bộ lọc hiện tại (${statusLabel}).
               </td></tr>`
            : articles
                .map((art) => {
                  const isPublished = art.status === 'published';
                  const isPending = art.status === 'pending';
                  const isRejected = art.status === 'rejected';
                  const hasWarning = !!art.facts_to_verify;

                  return `
            <tr>
              <td>
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  ${art.image_url ? `<img src="${escapeHtml(art.image_url)}" alt="" style="width:64px; height:48px; object-fit:cover; border-radius:4px; flex-shrink:0; border:1px solid #e2e8f0;">` : ''}
                  <div style="flex:1;">
                    <div style="font-weight:700; font-size:0.95rem; margin-bottom:4px;">
                      <a href="/admin/edit/${art.id}" style="color:var(--admin-primary);">${escapeHtml(art.title)}</a>
                    </div>
                    <div style="font-size:0.8rem; color:#64748b;">
                      Nguồn: <strong>${escapeHtml(art.source_name)}</strong> 
                      ${art.source_url ? `• <a href="${escapeHtml(art.source_url)}" target="_blank" rel="noopener noreferrer" style="color:var(--admin-accent);">Xem bài gốc ↗</a>` : ''}
                    </div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-ai">${escapeHtml(art.category)}</span></td>
              <td>
                ${
                  isPublished
                    ? '<span class="badge badge-published">✅ Đã xuất bản</span>'
                    : isPending
                    ? `<span class="badge badge-pending">⏳ Chờ duyệt</span>
                       ${hasWarning ? `<div style="font-size:0.75rem; color:#b45309; margin-top:2px;">⚠️ Cần xem lại</div>` : ''}`
                    : '<span class="badge badge-rejected">❌ Đã từ chối</span>'
                }
              </td>
              <td style="font-size:0.8rem; color:#64748b; white-space:nowrap;">
                ${art.published_at ? new Date(art.published_at).toLocaleString('vi-VN') : new Date(art.created_at).toLocaleString('vi-VN')}
              </td>
              <td style="text-align:right; white-space:nowrap;">
                ${
                  isPublished
                    ? `
                  <a href="/bai-viet/${art.slug}" target="_blank" class="btn btn-outline" style="font-size:0.78rem; padding:4px 8px;">Xem trang chủ ↗</a>
                  <a href="/admin/edit/${art.id}" class="btn btn-primary" style="font-size:0.78rem; padding:4px 8px;">Sửa bài</a>
                  <button onclick="quickDelete('${art.id}', '${escapeHtml(art.title.replace(/'/g, "\\'"))}')" class="btn btn-danger" style="font-size:0.78rem; padding:4px 8px;" title="Xóa vĩnh viễn bài này">🗑️ Xóa bài</button>
                `
                    : isPending
                    ? `
                  <a href="/admin/preview/${art.id}" target="_blank" class="btn btn-outline" style="font-size:0.78rem; padding:4px 8px;" title="Xem trước">Xem</a>
                  <a href="/admin/edit/${art.id}" class="btn btn-primary" style="font-size:0.78rem; padding:4px 8px;">Sửa & Duyệt</a>
                  <button onclick="quickPublish('${art.id}', '${escapeHtml(art.title.replace(/'/g, "\\'"))}')" class="btn btn-success" style="font-size:0.78rem; padding:4px 8px;">Duyệt</button>
                  <button onclick="quickReject('${art.id}')" class="btn btn-warning" style="font-size:0.78rem; padding:4px 8px;">Từ chối</button>
                  <button onclick="quickDelete('${art.id}', '${escapeHtml(art.title.replace(/'/g, "\\'"))}')" class="btn btn-danger" style="font-size:0.78rem; padding:4px 8px;">🗑️ Xóa</button>
                `
                    : `
                  <a href="/admin/edit/${art.id}" class="btn btn-primary" style="font-size:0.78rem; padding:4px 8px;">Xem</a>
                  <button onclick="quickDelete('${art.id}', '${escapeHtml(art.title.replace(/'/g, "\\'"))}')" class="btn btn-danger" style="font-size:0.78rem; padding:4px 8px;">🗑️ Xóa vĩnh viễn</button>
                `
                }
              </td>
            </tr>
          `;
                })
                .join('')
        }
      </tbody>
    </table>
  </div>
</div>

<script>
  function updateParam(key, val) {
    const url = new URL(window.location.href);
    if (val) url.searchParams.set(key, val);
    else url.searchParams.delete(key);
    window.location.href = url.pathname + url.search;
  }

  async function quickPublish(id, title) {
    if (!confirm('Bạn có chắc chắn muốn XUẤT BẢN bài viết:\\n"' + title + '"?')) return;
    try {
      const res = await fetch('/api/admin/articles/' + id + '/publish', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Đã xuất bản thành công bài viết lên trang chủ!');
        location.reload();
      } else {
        alert('Lỗi: ' + (data.message || 'Không thể xuất bản'));
      }
    } catch (err) {
      alert('Lỗi mạng: ' + err.message);
    }
  }

  async function quickReject(id) {
    if (!confirm('Bạn có chắc chắn muốn TỪ CHỐI bản nháp này?')) return;
    try {
      const res = await fetch('/api/admin/articles/' + id + '/reject', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        location.reload();
      } else {
        alert('Lỗi: ' + (data.message || 'Không thể từ chối'));
      }
    } catch (err) {
      alert('Lỗi mạng: ' + err.message);
    }
  }

  async function quickDelete(id, title) {
    if (!confirm('CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN bài viết:\\n"' + title + '"?\\nBài viết sẽ bị gỡ ngay khỏi trang chủ và không thể hoàn tác!')) return;
    try {
      const res = await fetch('/api/admin/articles/' + id, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Đã xóa bài viết thành công!');
        location.reload();
      } else {
        alert('Lỗi xóa: ' + (data.message || 'Không thể xóa'));
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  }
</script>
  `.trim();
}

export function renderEditorView(article: Article): string {
  let tagsList: string[] = [];
  try {
    tagsList = JSON.parse(article.tags || '[]');
  } catch {
    tagsList = (article.tags || '').split(',').map((t) => t.trim());
  }

  const categories = [
    'Trí tuệ nhân tạo (AI)',
    'Phần mềm',
    'An ninh mạng',
    'Thiết bị',
    'Công nghệ mới',
  ];

  return `
<div>
  <!-- Editor Nav Breadcrumb -->
  <div style="margin-bottom:16px;">
    <a href="/admin/queue" style="color:var(--admin-primary); font-weight:600; text-decoration:none;">« Quay lại Hàng chờ</a>
  </div>

  <div class="editor-grid">
    <!-- Left Column: Edit Form -->
    <div>
      <div class="editor-card">
        <h2 style="font-size:1.3rem; margin-bottom:20px;">Biên tập Bản nháp</h2>

        <form id="editForm">
          <div class="form-group">
            <label for="title">Tiêu đề bài viết (*)</label>
            <input type="text" id="title" name="title" value="${escapeHtml(article.title)}" required>
          </div>

          <div class="form-group">
            <label for="excerpt">Sapo / Đoạn mở đầu (Excerpt) (*)</label>
            <textarea id="excerpt" name="excerpt" rows="3" required>${escapeHtml(article.excerpt)}</textarea>
          </div>

          <div class="form-group">
            <label for="category">Chuyên mục (*)</label>
            <select id="category" name="category" required>
              ${categories
                .map(
                  (cat) =>
                    `<option value="${cat}" ${article.category === cat ? 'selected' : ''}>${cat}</option>`
                )
                .join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="tags">Từ khóa / Thẻ phân loại (ngăn cách bởi dấu phẩy)</label>
            <input type="text" id="tags" name="tags" value="${escapeHtml(tagsList.join(', '))}">
          </div>

          <div class="form-group">
            <label for="image_url">Ảnh đại diện bài viết (URL ảnh)</label>
            <input type="url" id="image_url" name="image_url" value="${escapeHtml(article.image_url || '')}" placeholder="https://..." oninput="previewEditImage(this.value)">
            <div id="edit_image_preview_box" style="margin-top:8px; ${article.image_url ? 'display:block;' : 'display:none;'}">
              <img id="edit_image_preview_img" src="${escapeHtml(article.image_url || '')}" alt="Xem trước ảnh" style="max-height:160px; border-radius:6px; border:1px solid #cbd5e1; object-fit:cover;">
            </div>
          </div>

          <div class="form-group">
            <label for="content">Nội dung bài viết (HTML) (*)</label>
            <textarea id="content" name="content" rows="14" required>${escapeHtml(article.content)}</textarea>
            <small style="color:#64748b; font-size:0.75rem;">Hỗ trợ các thẻ: &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;blockquote&gt;</small>
          </div>

          <!-- SEO Section -->
          <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
            <h4 style="margin-bottom:12px; font-size:1rem; color:#334155;">Tối ưu hóa SEO</h4>
            <div class="form-group">
              <label for="seo_title">Tiêu đề SEO (&lt; 70 ký tự)</label>
              <input type="text" id="seo_title" name="seo_title" value="${escapeHtml(article.seo_title || article.title)}">
            </div>
            <div class="form-group">
              <label for="seo_description">Thẻ mô tả SEO (&lt; 160 ký tự)</label>
              <textarea id="seo_description" name="seo_description" rows="2">${escapeHtml(article.seo_description || article.excerpt)}</textarea>
            </div>
          </div>

          <!-- Action Buttons Bar -->
          <div style="display:flex; gap:10px; margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0; flex-wrap:wrap; align-items:center;">
            <button type="button" onclick="saveDraft()" class="btn btn-secondary">💾 Lưu thay đổi</button>
            ${
              article.status === 'published'
                ? `<a href="/bai-viet/${article.slug}" target="_blank" class="btn btn-outline">🌐 Xem trên trang chủ ↗</a>`
                : `<a href="/admin/preview/${article.id}" target="_blank" class="btn btn-outline">👁️ Xem trước giao diện</a>
                   <button type="button" onclick="publishArticle()" class="btn btn-success" style="font-size:0.95rem;">🚀 Phê duyệt & Xuất bản</button>
                   <button type="button" onclick="rejectArticle()" class="btn btn-warning">❌ Từ chối</button>`
            }
            <button type="button" onclick="deleteCurrentArticle()" class="btn btn-danger" style="margin-left:auto;">🗑️ Xóa vĩnh viễn bài này</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Right Column: Original Source & Verification Box -->
    <div>
      ${
        article.facts_to_verify
          ? `
      <div class="editor-card" style="border-left:4px solid #f59e0b; background:#fffbeb;">
        <h4 style="color:#92400e; font-size:0.95rem; margin-bottom:8px;">⚠️ Thông tin AI lưu ý kiểm chứng:</h4>
        <p style="color:#78350f; font-size:0.85rem; line-height:1.6;">${escapeHtml(article.facts_to_verify)}</p>
      </div>`
          : ''
      }

      <div class="editor-card">
        <h3 style="font-size:1.05rem; margin-bottom:14px;">Thông tin Nguồn gốc</h3>
        <div style="font-size:0.85rem; line-height:1.7; color:#334155;">
          <p><strong>Nguồn:</strong> ${escapeHtml(article.source_name)}</p>
          <p><strong>Tiêu đề gốc:</strong> ${escapeHtml(article.original_title)}</p>
          <p><strong>Ngày xuất bản gốc:</strong> ${article.source_published_at || 'Không có'}</p>
          <p style="margin-top:8px;">
            <a href="${escapeHtml(article.source_url)}" target="_blank" rel="noopener noreferrer" style="color:var(--admin-accent); font-weight:600;">
              Truy cập bài gốc tại ${escapeHtml(article.source_name)} ↗
            </a>
          </p>
        </div>
      </div>

      <div class="editor-card">
        <h3 style="font-size:1.05rem; margin-bottom:14px;">Thông tin Quản trị</h3>
        <div style="font-size:0.82rem; line-height:1.6; color:#64748b;">
          <p><strong>ID bài:</strong> ${article.id}</p>
          <p><strong>Slug:</strong> ${article.slug}</p>
          <p><strong>Trạng thái:</strong> <span class="badge badge-${article.status}">${article.status}</span></p>
          <p><strong>Phương thức:</strong> ${article.ai_generated ? 'AI biên soạn nháp' : 'Khởi tạo từ metadata'}</p>
          <p><strong>Ngày nạp:</strong> ${new Date(article.created_at).toLocaleString('vi-VN')}</p>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  function getFormData() {
    return {
      title: document.getElementById('title').value.trim(),
      excerpt: document.getElementById('excerpt').value.trim(),
      category: document.getElementById('category').value,
      tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(Boolean),
      image_url: document.getElementById('image_url').value.trim(),
      content: document.getElementById('content').value.trim(),
      seo_title: document.getElementById('seo_title').value.trim(),
      seo_description: document.getElementById('seo_description').value.trim()
    };
  }

  function previewEditImage(url) {
    const box = document.getElementById('edit_image_preview_box');
    const img = document.getElementById('edit_image_preview_img');
    if (url && url.startsWith('http')) {
      img.src = url;
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
    }
  }

  async function saveDraft() {
    const data = getFormData();
    try {
      const res = await fetch('/api/admin/articles/${article.id}/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        alert('Đã lưu nháp thành công!');
      } else {
        alert('Lỗi khi lưu: ' + (result.message || 'Không thành công'));
      }
    } catch (err) {
      alert('Lỗi mạng: ' + err.message);
    }
  }

  async function publishArticle() {
    if (!confirm('Xác nhận bạn đã đối chiếu dữ kiện và muốn XUẤT BẢN bài viết này lên trang chủ công khai?')) return;
    const data = getFormData();
    try {
      // First save changes
      await fetch('/api/admin/articles/${article.id}/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // Then trigger publish
      const res = await fetch('/api/admin/articles/${article.id}/publish', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        alert('Xuất bản thành công! Bài viết đã xuất hiện trên trang chủ và sitemap.');
        window.location.href = '/admin/queue';
      } else {
        alert('Lỗi xuất bản: ' + (result.message || 'Không thành công'));
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  }

  async function rejectArticle() {
    if (!confirm('Bạn có chắc chắn muốn TỪ CHỐI bản nháp này?')) return;
    try {
      const res = await fetch('/api/admin/articles/${article.id}/reject', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        alert('Đã từ chối bản nháp.');
        window.location.href = '/admin/queue';
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  }

  async function deleteCurrentArticle() {
    if (!confirm('CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn XÓA VĨNH VIỄN bài viết này?\\nBài viết sẽ bị gỡ bỏ ngay lập tức và không thể phục hồi!')) return;
    try {
      const res = await fetch('/api/admin/articles/${article.id}', { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        alert('Đã xóa bài viết thành công!');
        window.location.href = '/admin/queue?status=${article.status}';
      } else {
        alert('Lỗi: ' + (result.message || 'Không thể xóa'));
      }
    } catch (err) {
      alert('Lỗi mạng: ' + err.message);
    }
  }
</script>
  `.trim();
}

export function renderFeedsView(feeds: Feed[]): string {
  return `
<div>
  <!-- Add New Feed Box -->
  <div class="editor-card">
    <h3 style="font-size:1.15rem; margin-bottom:16px;">Thêm nguồn RSS/Atom mới</h3>
    <form action="/api/admin/feeds" method="POST" style="display:grid; grid-template-columns: 2fr 3fr 2fr 1fr; gap:12px; align-items:flex-end;">
      <div class="form-group" style="margin-bottom:0;">
        <label for="name">Tên nguồn báo</label>
        <input type="text" id="name" name="name" placeholder="Ví dụ: VnExpress Công nghệ" required>
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label for="feed_url">URL Feed RSS/Atom</label>
        <input type="url" id="feed_url" name="feed_url" placeholder="https://..." required>
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label for="category">Chuyên mục mặc định</label>
        <select id="category" name="category">
          <option value="Trí tuệ nhân tạo (AI)">Trí tuệ nhân tạo (AI)</option>
          <option value="Phần mềm">Phần mềm</option>
          <option value="An ninh mạng">An ninh mạng</option>
          <option value="Thiết bị">Thiết bị</option>
          <option value="Công nghệ mới" selected>Công nghệ mới</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary" style="height:42px; justify-content:center;">Thêm nguồn</button>
    </form>
  </div>

  <!-- Feeds Table -->
  <div class="data-table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>Tên nguồn</th>
          <th>URL RSS</th>
          <th>Chuyên mục</th>
          <th>Trạng thái</th>
          <th>Lần nạp cuối</th>
          <th style="text-align:right;">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        ${
          feeds.length === 0
            ? '<tr><td colspan="6" style="text-align:center; padding:30px; color:#94a3b8;">Chưa có nguồn RSS nào được cấu hình.</td></tr>'
            : feeds
                .map(
                  (f) => `
            <tr>
              <td><strong>${escapeHtml(f.name)}</strong></td>
              <td style="font-size:0.8rem; word-break:break-all;"><a href="${escapeHtml(f.feed_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(f.feed_url)}</a></td>
              <td>${escapeHtml(f.category)}</td>
              <td>
                <span class="badge ${f.enabled ? 'badge-published' : 'badge-rejected'}">
                  ${f.enabled ? 'Đang bật' : 'Tạm tắt'}
                </span>
                ${f.last_error ? `<div style="font-size:0.72rem; color:#dc2626; margin-top:2px;">Lỗi: ${escapeHtml(f.last_error.slice(0, 50))}</div>` : ''}
              </td>
              <td style="font-size:0.8rem; color:#64748b;">
                ${f.last_checked_at ? new Date(f.last_checked_at).toLocaleString('vi-VN') : 'Chưa kiểm tra'}
              </td>
              <td style="text-align:right; white-space:nowrap;">
                <button onclick="toggleFeed('${f.id}')" class="btn btn-secondary" style="font-size:0.75rem; padding:4px 8px;">
                  ${f.enabled ? 'Tắt' : 'Bật'}
                </button>
                <button onclick="deleteFeed('${f.id}')" class="btn btn-danger" style="font-size:0.75rem; padding:4px 8px;">Xóa</button>
              </td>
            </tr>
          `
                )
                .join('')
        }
      </tbody>
    </table>
  </div>
</div>

<script>
  async function toggleFeed(id) {
    try {
      const res = await fetch('/api/admin/feeds/' + id + '/toggle', { method: 'POST' });
      const data = await res.json();
      if (data.success) location.reload();
      else alert('Lỗi: ' + (data.message || 'Không thể thay đổi'));
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  }

  async function deleteFeed(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa nguồn feed này?')) return;
    try {
      const res = await fetch('/api/admin/feeds/' + id + '/delete', { method: 'POST' });
      const data = await res.json();
      if (data.success) location.reload();
      else alert('Lỗi: ' + (data.message || 'Không thể xóa'));
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  }
</script>
  `.trim();
}

export function renderAuditView(logs: AuditLog[]): string {
  return `
<div>
  <div class="action-bar">
    <h3 style="font-size:1.15rem; margin:0;">Nhật ký Kiểm toán & Thao tác Hệ thống (Audit Logs)</h3>
    <span style="font-size:0.85rem; color:var(--admin-muted);">${logs.length} bản ghi</span>
  </div>

  <div class="data-table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>Thời gian (UTC+7)</th>
          <th>Tác nhân</th>
          <th>Hành động</th>
          <th>Mã bài viết</th>
          <th>Chi tiết Metadata</th>
        </tr>
      </thead>
      <tbody>
        ${
          logs.length === 0
            ? '<tr><td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">Chưa có bản ghi nhật ký nào.</td></tr>'
            : logs
                .map(
                  (log) => `
            <tr>
              <td style="white-space:nowrap;">${new Date(log.created_at).toLocaleString('vi-VN')}</td>
              <td><strong>${escapeHtml(log.actor)}</strong></td>
              <td><span class="badge badge-ai">${escapeHtml(log.action)}</span></td>
              <td>${log.article_id ? `<a href="/admin/edit/${log.article_id}">${log.article_id}</a>` : '-'}</td>
              <td style="font-family:monospace; font-size:0.8rem; color:#475569; word-break:break-all;">
                ${escapeHtml(log.metadata || '-')}
              </td>
            </tr>
          `
                )
                .join('')
        }
      </tbody>
    </table>
  </div>
</div>
  `.trim();
}

export function renderPreviewBanner(articleId: string): string {
  return `
<div class="preview-banner">
  ⚠️ ĐÂY LÀ CHẾ ĐỘ XEM TRƯỚC BẢN NHÁP NỘI BỘ (TRẠNG THÁI PENDING — BÀI CHƯA ĐƯỢC XUẤT BẢN RA CÔNG KHAI)
  <a href="/admin/edit/${articleId}" style="color:#fff; text-decoration:underline; margin-left:12px; font-weight:bold;">« Quay lại biên tập & phê duyệt</a>
</div>
  `.trim();
}
