// src/views/category.ts
// Category archive view with breadcrumbs and pagination

import { Article, Env } from '../types/index.js';
import { renderAdSlot } from '../ads/adsense.js';
import { escapeHtml } from '../security/sanitize.js';

export function renderCategoryPage(
  categoryName: string,
  categorySlug: string,
  articles: Article[],
  page: number,
  totalPages: number,
  env: Env
): string {
  return `
<div class="main-layout">
  <div class="content-col">
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Đường dẫn">
      <a href="/">Trang chủ</a> &gt; 
      <span>${escapeHtml(categoryName)}</span>
    </nav>

    <div class="section-header" style="margin-top: 10px;">
      <h2>Chuyên mục: ${escapeHtml(categoryName)}</h2>
    </div>

    ${
      articles.length === 0
        ? `
      <div style="background:#fff; padding:40px; border-radius:6px; text-align:center; border:1px solid #e5e7eb;">
        <p style="color:#6b7280; font-size:1.1rem;">Chưa có bài viết nào trong chuyên mục này.</p>
        <a href="/" style="display:inline-block; margin-top:12px; color:var(--primary); font-weight:600;">« Quay lại trang chủ</a>
      </div>`
        : `
      <div style="display:flex; flex-direction:column; gap:20px;">
        ${articles
          .map(
            (art) => `
          <article style="background:#fff; border:1px solid #e5e7eb; border-radius:6px; padding:20px; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="category-badge" style="margin-bottom:0;">${escapeHtml(art.category)}</span>
              <span style="font-size:0.8rem; color:#6b7280;">📅 ${art.published_at ? new Date(art.published_at).toLocaleDateString('vi-VN') : ''}</span>
              <span style="font-size:0.8rem; color:#6b7280;">• Nguồn: ${escapeHtml(art.source_name)}</span>
            </div>
            <h3 style="font-size:1.25rem; font-weight:700; line-height:1.4;">
              <a href="/bai-viet/${art.slug}">${escapeHtml(art.title)}</a>
            </h3>
            <p style="font-size:0.95rem; color:#4b5563; line-height:1.6;">${escapeHtml(art.excerpt)}</p>
          </article>
        `
          )
          .join('')}
      </div>

      <!-- Pagination -->
      ${
        totalPages > 1
          ? `
      <div style="margin-top:30px; display:flex; justify-content:center; gap:8px;">
        ${page > 1 ? `<a href="/chuyen-muc/${categorySlug}?page=${page - 1}" style="padding:8px 14px; background:#fff; border:1px solid #cbd5e1; border-radius:4px; font-weight:600;">« Trang trước</a>` : ''}
        <span style="padding:8px 14px; background:var(--primary); color:#fff; border-radius:4px; font-weight:600;">Trang ${page} / ${totalPages}</span>
        ${page < totalPages ? `<a href="/chuyen-muc/${categorySlug}?page=${page + 1}" style="padding:8px 14px; background:#fff; border:1px solid #cbd5e1; border-radius:4px; font-weight:600;">Trang sau »</a>` : ''}
      </div>`
          : ''
      }
    `
    }
  </div>

  <aside class="sidebar-col">
    ${renderAdSlot(env, 'ad_cat_sidebar', 'sidebar')}

    <div class="sidebar-widget">
      <h3 class="widget-title">Các chuyên mục khác</h3>
      <ul style="list-style:none; line-height:2.2; font-size:0.92rem; font-weight:600;">
        <li><a href="/chuyen-muc/tri-tue-nhan-tao">» Trí tuệ nhân tạo (AI)</a></li>
        <li><a href="/chuyen-muc/phan-mem">» Phần mềm & Ứng dụng</a></li>
        <li><a href="/chuyen-muc/an-ninh-mang">» An ninh mạng & Bảo mật</a></li>
        <li><a href="/chuyen-muc/thiet-bi">» Thiết bị & Phần cứng</a></li>
        <li><a href="/chuyen-muc/cong-nghe-moi">» Công nghệ mới & Đổi mới</a></li>
      </ul>
    </div>
  </aside>
</div>
  `.trim();
}
