// src/views/adminLayout.ts
// Secure Admin CMS Layout

import { escapeHtml } from '../security/sanitize.js';
import { ADMIN_CSS } from './styles.js';

export interface AdminLayoutOptions {
  title: string;
  activeNav?: 'dashboard' | 'queue' | 'feeds' | 'audit';
  pendingCount?: number;
  message?: { type: 'success' | 'error' | 'warning'; text: string };
}

export function renderAdminLayout(
  content: string,
  options: AdminLayoutOptions
): string {
  const pendingBadge = options.pendingCount && options.pendingCount > 0
    ? `<span style="background:#ea580c; color:#fff; padding:1px 6px; border-radius:10px; font-size:0.75rem; margin-left:4px;">${options.pendingCount}</span>`
    : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)} | Tin Tức Việt CMS</title>
  <link rel="stylesheet" href="/static/css/admin.css">
  <style>${ADMIN_CSS}</style>
</head>
<body class="admin-body">

  <!-- Header -->
  <header class="admin-header">
    <div class="admin-brand">
      <h1>Tin Tức Việt</h1>
      <span>Tòa Soạn AI</span>
    </div>
    <nav class="admin-nav">
      <a href="/admin" class="${options.activeNav === 'dashboard' ? 'active' : ''}">Bảng điều khiển</a>
      <a href="/admin/create" class="btn btn-success" style="font-size:0.82rem; padding:4px 10px; color:#fff;">✍️ Viết bài mới</a>
      <a href="/admin/queue" class="${options.activeNav === 'queue' ? 'active' : ''}">Quản lý bài viết ${pendingBadge}</a>
      <a href="/admin/feeds" class="${options.activeNav === 'feeds' ? 'active' : ''}">Quản lý RSS</a>
      <a href="/admin/audit" class="${options.activeNav === 'audit' ? 'active' : ''}">Nhật ký</a>
      <button onclick="triggerRssFetch()" class="btn btn-warning" style="font-size:0.8rem; padding:4px 10px;">⚡ Lấy tin RSS ngay</button>
      <a href="/" target="_blank" style="font-size:0.85rem; opacity:0.8;">🌐 Xem Website</a>
      <form action="/api/admin/logout" method="POST" style="display:inline; margin:0;">
        <button type="submit" class="btn btn-outline" style="color:#fff; border-color:rgba(255,255,255,0.4); font-size:0.8rem; padding:4px 10px;">Đăng xuất</button>
      </form>
    </nav>
  </header>

  <!-- Flash Message -->
  ${
    options.message
      ? `
  <div class="admin-container" style="margin-bottom:0; padding-bottom:0;">
    <div class="alert-box alert-${options.message.type === 'error' ? 'warning' : 'info'}" style="margin-bottom:16px;">
      ${escapeHtml(options.message.text)}
    </div>
  </div>`
      : ''
  }

  <!-- Main Admin Container -->
  <main class="admin-container">
    ${content}
  </main>

  <script>
    async function triggerRssFetch() {
      if (!confirm('Bạn có muốn bắt đầu quá trình quét các nguồn RSS để tạo bản nháp mới?')) return;
      const btn = event.target;
      const origText = btn.innerText;
      btn.innerText = 'Đang quét RSS...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/admin/ingest', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          alert('Kết quả quét RSS:\\n- Thu nạp: ' + data.result.fetchedCount + ' bài\\n- Thêm mới (pending): ' + data.result.insertedCount + ' bài\\n- Trùng lặp: ' + data.result.duplicateCount + ' bài');
          window.location.reload();
        } else {
          alert('Thông báo: ' + (data.message || 'Không thể lấy tin'));
          btn.innerText = origText;
          btn.disabled = false;
        }
      } catch (err) {
        alert('Lỗi kết nối máy chủ: ' + err.message);
        btn.innerText = origText;
        btn.disabled = false;
      }
    }
  </script>

</body>
</html>`;
}
