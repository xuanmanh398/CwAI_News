// src/views/home.ts
// Home page template for Tin Công Nghệ

import { Article, Env } from '../types/index.js';
import { renderAdSlot } from '../ads/adsense.js';
import { escapeHtml } from '../security/sanitize.js';

export function renderHomePage(
  articles: Article[],
  trending: Article[],
  env: Env
): string {
  if (articles.length === 0) {
    return `
<div style="background:#fff; padding:60px 20px; border-radius:8px; text-align:center; margin:40px 0; border:1px solid #e5e7eb;">
  <h2 style="font-size:1.6rem; color:#1f2937; margin-bottom:12px;">Chào mừng bạn đến với Tin Tức Việt</h2>
  <p style="color:#6b7280; max-width:600px; margin:0 auto;">
    Hệ thống đang cập nhật các bản tin công nghệ mới nhất từ các cơ quan báo chí chính thống. Quý độc giả vui lòng quay lại sau ít phút.
  </p>
</div>
    `;
  }

  const hero = articles[0];
  const subFeatures = articles.slice(1, 4);
  const remaining = articles.slice(4);

  // Group remaining by category
  const categoriesList = [
    'Trí tuệ nhân tạo (AI)',
    'Phần mềm',
    'An ninh mạng',
    'Thiết bị',
    'Công nghệ mới',
  ];

  return `
<div class="main-layout">
  <!-- Left Main Column (8 cols) -->
  <div class="content-col">

    <!-- Top Featured Story -->
    <div class="hero-feature">
      <div class="hero-feature-content">
        <span class="category-badge">${escapeHtml(hero.category)}</span>
        <h1 class="hero-title">
          <a href="/bai-viet/${hero.slug}">${escapeHtml(hero.title)}</a>
        </h1>
        <p class="hero-sapo">${escapeHtml(hero.excerpt)}</p>
        <div class="meta-info">
          <span>📅 ${hero.published_at ? new Date(hero.published_at).toLocaleDateString('vi-VN') : ''}</span>
          <span>📰 Nguồn: ${escapeHtml(hero.source_name)}</span>
        </div>
      </div>
    </div>

    <!-- Sub Features Grid -->
    ${
      subFeatures.length > 0
        ? `
    <div class="sub-grid">
      ${subFeatures
        .map(
          (art) => `
        <article class="news-card">
          <div>
            <span class="category-badge">${escapeHtml(art.category)}</span>
            <h3><a href="/bai-viet/${art.slug}">${escapeHtml(art.title)}</a></h3>
            <p>${escapeHtml(art.excerpt.slice(0, 130))}...</p>
          </div>
          <div class="meta-info">
            <span>📅 ${art.published_at ? new Date(art.published_at).toLocaleDateString('vi-VN') : ''}</span>
          </div>
        </article>
      `
        )
        .join('')}
    </div>`
        : ''
    }

    <!-- In-feed Ad Banner -->
    ${renderAdSlot(env, 'ad_infeed_home', 'in-article')}

    <!-- Categorized News Sections -->
    ${categoriesList
      .map((catName) => {
        const catArticles = articles.filter((a) => a.category === catName).slice(0, 3);
        if (catArticles.length === 0) return '';

        return `
      <section class="category-block">
        <div class="section-header">
          <h2>${escapeHtml(catName)}</h2>
          <a href="/chuyen-muc/${getCategorySlug(catName)}">Xem tất cả »</a>
        </div>
        <div class="sub-grid">
          ${catArticles
            .map(
              (art) => `
            <article class="news-card">
              <div>
                <h3><a href="/bai-viet/${art.slug}">${escapeHtml(art.title)}</a></h3>
                <p>${escapeHtml(art.excerpt.slice(0, 110))}...</p>
              </div>
              <div class="meta-info">
                <span>📅 ${art.published_at ? new Date(art.published_at).toLocaleDateString('vi-VN') : ''}</span>
                <span>${escapeHtml(art.source_name)}</span>
              </div>
            </article>
          `
            )
            .join('')}
        </div>
      </section>
      `;
      })
      .join('')}

    <!-- Latest News Stream (Other articles) -->
    ${
      remaining.length > 0
        ? `
    <section class="category-block">
      <div class="section-header">
        <h2>Dòng sự kiện công nghệ</h2>
      </div>
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${remaining.slice(0, 6).map(
          (art) => `
          <div style="background:#fff; border:1px solid #e5e7eb; border-radius:6px; padding:16px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="category-badge" style="margin-bottom:0;">${escapeHtml(art.category)}</span>
              <span style="font-size:0.8rem; color:#6b7280;">📅 ${art.published_at ? new Date(art.published_at).toLocaleDateString('vi-VN') : ''}</span>
            </div>
            <h3 style="font-size:1.15rem; font-weight:700;"><a href="/bai-viet/${art.slug}">${escapeHtml(art.title)}</a></h3>
            <p style="font-size:0.92rem; color:#4b5563;">${escapeHtml(art.excerpt)}</p>
          </div>
        `
        ).join('')}
      </div>
    </section>
    `
        : ''
    }

  </div>

  <!-- Right Sidebar (4 cols) -->
  <aside class="sidebar-col">
    <!-- Sidebar Ad Slot -->
    ${renderAdSlot(env, 'ad_sidebar_top', 'sidebar')}

    <!-- Trending Stories Widget -->
    <div class="sidebar-widget">
      <h3 class="widget-title">Đọc nhiều nhất</h3>
      <ul class="trending-list">
        ${(trending.length > 0 ? trending : articles.slice(0, 5))
          .map(
            (art, idx) => `
          <li class="trending-item">
            <span class="trending-num">0${idx + 1}</span>
            <div class="trending-text">
              <a href="/bai-viet/${art.slug}">${escapeHtml(art.title)}</a>
              <div style="font-size:0.75rem; color:#9ca3af; margin-top:4px;">
                ${escapeHtml(art.category)} • ${escapeHtml(art.source_name)}
              </div>
            </div>
          </li>
        `
          )
          .join('')}
      </ul>
    </div>

    <!-- Quick RSS Subscribe / About Box -->
    <div class="sidebar-widget" style="background:#f8fafc; border:1px solid #cbd5e1;">
      <h3 class="widget-title" style="border-bottom-color:#b31217;">Về Tin Tức Việt</h3>
      <p style="font-size:0.85rem; color:#4b5563; line-height:1.6; margin-bottom:12px;">
        Chuyên trang tin tức và phân tích chuyên sâu các chuyển động công nghệ mới, trí tuệ nhân tạo, an ninh số và thiết bị thông minh tại Việt Nam và toàn cầu.
      </p>
      <a href="/gioi-thieu" style="font-size:0.82rem; font-weight:700; color:#b31217;">Tìm hiểu về tòa soạn »</a>
    </div>

    <!-- Bottom Sidebar Ad Slot -->
    ${renderAdSlot(env, 'ad_sidebar_bottom', 'sidebar')}
  </aside>
</div>
  `.trim();
}

export function getCategorySlug(categoryName: string): string {
  switch (categoryName) {
    case 'Trí tuệ nhân tạo (AI)':
      return 'tri-tue-nhan-tao';
    case 'Phần mềm':
      return 'phan-mem';
    case 'An ninh mạng':
      return 'an-ninh-mang';
    case 'Thiết bị':
      return 'thiet-bi';
    case 'Công nghệ mới':
    default:
      return 'cong-nghe-moi';
  }
}

export function getCategoryFromSlug(slug: string): string {
  switch (slug) {
    case 'tri-tue-nhan-tao':
      return 'Trí tuệ nhân tạo (AI)';
    case 'phan-mem':
      return 'Phần mềm';
    case 'an-ninh-mang':
      return 'An ninh mạng';
    case 'thiet-bi':
      return 'Thiết bị';
    case 'cong-nghe-moi':
    default:
      return 'Công nghệ mới';
  }
}
