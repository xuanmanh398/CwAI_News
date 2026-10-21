// src/views/search.ts
// Search page view for Tin Công Nghệ

import { Article, Env } from '../types/index.js';
import { renderAdSlot } from '../ads/adsense.js';
import { escapeHtml } from '../security/sanitize.js';

export function renderSearchPage(
  query: string,
  articles: Article[],
  env: Env
): string {
  const cleanQuery = escapeHtml(query);

  return `
<div class="main-layout">
  <div class="content-col">
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Đường dẫn">
      <a href="/">Trang chủ</a> &gt; 
      <span>Tìm kiếm</span>
    </nav>

    <div class="section-header" style="margin-top: 10px;">
      <h2>Kết quả tìm kiếm cho: "${cleanQuery}"</h2>
    </div>

    <!-- Search input form -->
    <form action="/tim-kiem" method="GET" style="display:flex; gap:10px; margin-bottom:24px;">
      <input type="text" name="q" value="${cleanQuery}" style="flex:1; padding:10px 14px; border:1px solid #cbd5e1; border-radius:6px; font-size:1rem;" required>
      <button type="submit" style="background:var(--primary); color:#fff; border:none; padding:10px 20px; border-radius:6px; font-weight:700; cursor:pointer;">Tìm kiếm</button>
    </form>

    ${
      articles.length === 0
        ? `
      <div style="background:#fff; padding:40px; border-radius:6px; text-align:center; border:1px solid #e5e7eb;">
        <p style="color:#6b7280; font-size:1.1rem; margin-bottom:12px;">Không tìm thấy bài viết nào phù hợp với từ khóa "${cleanQuery}".</p>
        <p style="font-size:0.9rem; color:#9ca3af;">Hãy thử tìm kiếm với các từ khóa ngắn gọn hoặc chuyên mục khác (ví dụ: AI, chip, bảo mật, iPhone...).</p>
      </div>`
        : `
      <p style="margin-bottom:16px; font-size:0.9rem; color:#6b7280;">Tìm thấy <strong>${articles.length}</strong> bài viết phù hợp:</p>
      <div style="display:flex; flex-direction:column; gap:20px;">
        ${articles
          .map(
            (art) => `
          <article class="category-article-card">
            ${
              art.image_url
                ? `
            <a href="/bai-viet/${art.slug}" class="category-card-thumb-wrap">
              <img src="${escapeHtml(art.image_url)}" alt="${escapeHtml(art.title)}" class="category-card-thumb" loading="lazy" />
            </a>`
                : ''
            }
            <div class="category-card-content">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="category-badge" style="margin-bottom:0;">${escapeHtml(art.category)}</span>
                <span style="font-size:0.8rem; color:#6b7280;">📅 ${art.published_at ? new Date(art.published_at).toLocaleDateString('vi-VN') : ''}</span>
                <span style="font-size:0.8rem; color:#6b7280;">• Nguồn: ${escapeHtml(art.source_name)}</span>
              </div>
              <h3 style="font-size:1.25rem; font-weight:700; line-height:1.4;">
                <a href="/bai-viet/${art.slug}">${escapeHtml(art.title)}</a>
              </h3>
              <p style="font-size:0.95rem; color:#4b5563; line-height:1.6;">${escapeHtml(art.excerpt)}</p>
            </div>
          </article>
        `
          )
          .join('')}
      </div>`
    }
  </div>

  <aside class="sidebar-col">
    ${renderAdSlot(env, 'ad_search_sidebar', 'sidebar')}
  </aside>
</div>
  `.trim();
}
