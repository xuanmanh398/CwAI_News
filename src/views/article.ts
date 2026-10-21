// src/views/article.ts
// Article detail view with SEO, AI transparency, source citation, and related news

import { Article, Env } from '../types/index.js';
import { renderAdSlot } from '../ads/adsense.js';
import { escapeHtml } from '../security/sanitize.js';
import { getCategorySlug } from './home.js';

export function renderArticlePage(
  article: Article,
  relatedArticles: Article[],
  env: Env,
  origin: string
): string {
  const catSlug = getCategorySlug(article.category);
  const articleUrl = `${origin}/bai-viet/${article.slug}`;

  // Parse tags
  let tagsList: string[] = [];
  try {
    tagsList = JSON.parse(article.tags || '[]');
  } catch {
    tagsList = (article.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
  }

  const pubDateFormatted = article.published_at
    ? new Date(article.published_at).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  const updatedDateFormatted =
    article.updated_at && article.updated_at !== article.published_at
      ? new Date(article.updated_at).toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null;

  return `
<div class="main-layout">
  <!-- Article Column (8 cols) -->
  <article class="article-detail content-col">
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Đường dẫn bài viết">
      <a href="/">Trang chủ</a> &gt; 
      <a href="/chuyen-muc/${catSlug}">${escapeHtml(article.category)}</a> &gt; 
      <span>${escapeHtml(article.title.slice(0, 40))}...</span>
    </nav>

    <!-- Headline -->
    <h1 class="article-headline">${escapeHtml(article.title)}</h1>

    <!-- Lead / Sapo -->
    <p class="article-lead">${escapeHtml(article.excerpt)}</p>

    <!-- Meta Information Bar -->
    <div class="article-meta-bar">
      <div>
        <span class="category-badge" style="margin-bottom:0;">${escapeHtml(article.category)}</span>
        <span style="margin-left: 10px;">📅 Xuất bản: ${pubDateFormatted}</span>
        ${updatedDateFormatted ? `<span style="margin-left: 8px;">(Cập nhật: ${updatedDateFormatted})</span>` : ''}
      </div>
      <div>
        <span>Nguồn: <strong>${escapeHtml(article.source_name)}</strong></span>
      </div>
    </div>

    <!-- AI Editorial Transparency Notice -->
    <div class="ai-editorial-badge">
      <span style="font-size: 1.2rem;">🤖</span>
      <div>
        <strong>Minh bạch biên tập:</strong> Bản tin được ban biên tập <em>Tin Công Nghệ</em> tổng hợp và biên soạn với sự hỗ trợ của trí tuệ nhân tạo (AI), dữ kiện được đối chiếu từ nguồn tin gốc.
      </div>
    </div>

    <!-- Article Body -->
    <div class="article-body">
      ${article.content}
    </div>

    <!-- In-article Ad Slot -->
    ${renderAdSlot(env, 'ad_inarticle_body', 'in-article')}

    <!-- Reference Source Box -->
    <div class="source-box">
      <strong>Nguồn tham khảo:</strong> Thông tin tổng hợp từ bài báo gốc của <em>${escapeHtml(article.source_name)}</em>: 
      <a href="${escapeHtml(article.source_url)}" target="_blank" rel="noopener noreferrer nofollow" style="color:var(--secondary); font-weight:600; text-decoration:underline;">
        Xem bài viết gốc tại ${escapeHtml(article.source_name)} ↗
      </a>
    </div>

    <!-- Tags Cloud -->
    ${
      tagsList.length > 0
        ? `
    <div class="tags-cloud">
      <span style="font-size:0.85rem; font-weight:bold; color:#6b7280; align-self:center;">Chủ đề:</span>
      ${tagsList
        .map(
          (tag) => `
        <span class="tag-pill">#${escapeHtml(tag)}</span>
      `
        )
        .join('')}
    </div>`
        : ''
    }

    <!-- Social Share Buttons -->
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
      <span style="font-size:0.85rem; font-weight:bold; color:#4b5563;">Chia sẻ:</span>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}" target="_blank" rel="noopener noreferrer" style="background:#1877f2; color:#fff; padding:6px 14px; border-radius:4px; font-size:0.82rem; font-weight:600;">Facebook</a>
      <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}" target="_blank" rel="noopener noreferrer" style="background:#0f1419; color:#fff; padding:6px 14px; border-radius:4px; font-size:0.82rem; font-weight:600;">X (Twitter)</a>
      <button onclick="navigator.clipboard.writeText('${articleUrl}'); alert('Đã sao chép liên kết vào bộ nhớ tạm!');" style="background:#e2e8f0; color:#334155; padding:6px 14px; border-radius:4px; font-size:0.82rem; font-weight:600; border:none; cursor:pointer;">Sao chép liên kết</button>
    </div>

    <!-- Related Articles -->
    ${
      relatedArticles.length > 0
        ? `
    <section style="margin-top: 40px; padding-top: 24px; border-top: 2px solid var(--primary);">
      <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); text-transform: uppercase; margin-bottom: 16px;">
        Bài viết cùng chuyên mục
      </h3>
      <div class="sub-grid">
        ${relatedArticles
          .map(
            (rel) => `
          <div class="news-card">
            <div>
              <h4 style="font-size:1rem; font-weight:700; margin-bottom:6px;">
                <a href="/bai-viet/${rel.slug}">${escapeHtml(rel.title)}</a>
              </h4>
              <p style="font-size:0.85rem; color:#6b7280;">${escapeHtml(rel.excerpt.slice(0, 90))}...</p>
            </div>
            <div class="meta-info">
              <span>📅 ${rel.published_at ? new Date(rel.published_at).toLocaleDateString('vi-VN') : ''}</span>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </section>`
        : ''
    }

  </article>

  <!-- Sidebar Column (4 cols) -->
  <aside class="sidebar-col">
    <!-- Sidebar Top Ad -->
    ${renderAdSlot(env, 'ad_article_sidebar', 'sidebar')}

    <!-- Editorial Policy Widget -->
    <div class="sidebar-widget">
      <h3 class="widget-title">Chính sách biên tập</h3>
      <p style="font-size:0.85rem; color:#4b5563; line-height:1.6; margin-bottom:12px;">
        Website tuân thủ nguyên tắc báo chí trung thực, khách quan và minh bạch về việc sử dụng AI.
      </p>
      <ul style="font-size:0.85rem; line-height:1.8; padding-left:18px; color:#4b5563;">
        <li>Con người chịu trách nhiệm xuất bản</li>
        <li>Không bịa đặt số liệu hoặc phát ngôn</li>
        <li>Trích dẫn nguồn công khai rõ ràng</li>
      </ul>
      <a href="/nguyen-tac-bien-tap" style="display:inline-block; margin-top:12px; font-size:0.82rem; font-weight:700; color:var(--primary);">Xem chi tiết quy chuẩn »</a>
    </div>

    <!-- Correction Contact Box -->
    <div class="sidebar-widget" style="background:#fffbeb; border:1px solid #fef3c7;">
      <h3 class="widget-title" style="border-bottom-color:#d97706; color:#92400e;">Góp ý & Đính chính</h3>
      <p style="font-size:0.83rem; color:#78350f; line-height:1.5;">
        Nếu phát hiện thông tin chưa chính xác trong bài viết này, quý độc giả vui lòng thông báo cho ban biên tập để chúng tôi kịp thời kiểm tra và đính chính.
      </p>
      <a href="/chinh-sach-dinh-chinh" style="display:inline-block; margin-top:8px; font-size:0.82rem; font-weight:700; color:#b45309;">Gửi yêu cầu đính chính »</a>
    </div>
  </aside>
</div>
  `.trim();
}
