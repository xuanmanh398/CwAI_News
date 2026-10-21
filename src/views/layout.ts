// src/views/layout.ts
// Public Electronic Newspaper Layout (Báo điện tử chuẩn Việt Nam)

import { Env } from '../types/index.js';
import { renderAdSenseHeaderScript, renderAdSlot } from '../ads/adsense.js';
import { escapeHtml } from '../security/sanitize.js';
import { STYLE_CSS } from './styles.js';

export interface LayoutOptions {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  jsonLd?: string;
  activeCategory?: string;
  breakingNews?: Array<{ title: string; slug: string }>;
}

export function formatVietnameseDate(d: Date = new Date()): string {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[d.getDay()];
  const date = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${dayName}, ngày ${date}/${month}/${year}`;
}

export function renderPublicLayout(
  content: string,
  options: LayoutOptions,
  env: Env
): string {
  const siteName = env.SITE_NAME || 'Tin Tức Việt';
  const siteDesc =
    options.description ||
    env.SITE_DESCRIPTION ||
    'Chuyên trang tin tức công nghệ, trí tuệ nhân tạo (AI), phần mềm và an ninh mạng.';
  const pageTitle = options.title.includes(siteName)
    ? options.title
    : `${options.title} | ${siteName}`;
  const canonical = options.canonicalUrl || env.CANONICAL_ORIGIN || 'https://tincongnghe.pages.dev';

  const categories = [
    { name: 'Trí tuệ nhân tạo (AI)', slug: 'tri-tue-nhan-tao' },
    { name: 'Phần mềm', slug: 'phan-mem' },
    { name: 'An ninh mạng', slug: 'an-ninh-mang' },
    { name: 'Thiết bị', slug: 'thiet-bi' },
    { name: 'Công nghệ mới', slug: 'cong-nghe-moi' },
  ];

  const breaking = options.breakingNews && options.breakingNews.length > 0 ? options.breakingNews[0] : null;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(siteDesc)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="alternate" type="application/rss+xml" title="${escapeHtml(siteName)} RSS Feed" href="/rss.xml">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${options.ogType || 'website'}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(siteDesc)}">
  <meta property="og:site_name" content="${escapeHtml(siteName)}">
  <meta property="og:locale" content="vi_VN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(siteDesc)}">

  <!-- Stylesheet -->
  <link rel="stylesheet" href="/static/css/style.css">
  <style>${STYLE_CSS}</style>

  <!-- AdSense Script (conditional) -->
  ${renderAdSenseHeaderScript(env)}

  <!-- Schema.org JSON-LD -->
  ${options.jsonLd ? `<script type="application/ld+json">${options.jsonLd}</script>` : ''}
</head>
<body>

  <!-- Top Bar -->
  <div class="top-bar">
    <div class="container top-bar-inner">
      <div>
        <span class="live-dot"></span>
        <span>${formatVietnameseDate()}</span>
      </div>
      <div>
        <a href="/rss.xml" title="Theo dõi RSS">📡 RSS Feed</a>
      </div>
    </div>
  </div>

  <!-- Main Header -->
  <header class="main-header">
    <div class="container header-brand">
      <div>
        <a href="/" class="logo-title">TIN TỨC VIỆT</a>
        <div class="logo-slogan">Thời báo công nghệ & Trí tuệ nhân tạo</div>
      </div>
      <form class="header-search" action="/tim-kiem" method="GET">
        <input type="text" name="q" placeholder="Tìm kiếm tin công nghệ..." required>
        <button type="submit">Tìm</button>
      </form>
    </div>
  </header>

  <!-- Sticky Navigation -->
  <nav class="main-nav">
    <div class="container">
      <ul class="nav-list">
        <li class="nav-item ${!options.activeCategory ? 'active' : ''}"><a href="/">Trang chủ</a></li>
        ${categories
          .map(
            (c) => `
          <li class="nav-item ${options.activeCategory === c.name ? 'active' : ''}">
            <a href="/chuyen-muc/${c.slug}">${escapeHtml(c.name)}</a>
          </li>`
          )
          .join('')}
      </ul>
    </div>
  </nav>

  <!-- Breaking News Ticker -->
  ${
    breaking
      ? `
  <div class="news-ticker">
    <div class="container ticker-inner">
      <span class="ticker-badge">Điểm tin</span>
      <a href="/bai-viet/${breaking.slug}" class="ticker-link">${escapeHtml(breaking.title)}</a>
    </div>
  </div>`
      : ''
  }

  <!-- Header Leaderboard Ad Slot -->
  <div class="container">
    ${renderAdSlot(env, 'ad_header_leaderboard', 'header-banner')}
  </div>

  <!-- Page Body Content -->
  <main class="container">
    ${content}
  </main>

  <!-- Footer Banner Ad Slot -->
  <div class="container">
    ${renderAdSlot(env, 'ad_footer_banner', 'footer')}
  </div>

  <!-- Footer -->
  <footer class="main-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Về Tin Tức Việt</h4>
          <p style="margin-bottom: 12px; font-size: 0.85rem; line-height: 1.6;">
            Chuyên trang thông tin tổng hợp công nghệ, cập nhật liên tục bước tiến của Trí tuệ nhân tạo (AI), an ninh số và thiết bị thông minh.
          </p>
          <p style="font-size: 0.82rem; color: #6b7280;">Hệ thống biên tập tin tức tự động hóa hỗ trợ bởi AI — Quyết định xuất bản bởi con người.</p>
        </div>
        <div class="footer-col">
          <h4>Chuyên mục</h4>
          <ul>
            <li><a href="/chuyen-muc/tri-tue-nhan-tao">Trí tuệ nhân tạo (AI)</a></li>
            <li><a href="/chuyen-muc/phan-mem">Phần mềm & Ứng dụng</a></li>
            <li><a href="/chuyen-muc/an-ninh-mang">An ninh mạng & Bảo mật</a></li>
            <li><a href="/chuyen-muc/thiet-bi">Thiết bị & Phần cứng</a></li>
            <li><a href="/chuyen-muc/cong-nghe-moi">Công nghệ mới & Khởi nghiệp</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Chính sách & Tòa soạn</h4>
          <ul>
            <li><a href="/gioi-thieu">Giới thiệu tòa soạn</a></li>
            <li><a href="/nguyen-tac-bien-tap">Nguyên tắc biên tập & Đạo đức AI</a></li>
            <li><a href="/chinh-sach-dinh-chinh">Chính sách sửa lỗi & Đính chính</a></li>
            <li><a href="/chinh-sach-bao-mat">Chính sách bảo mật</a></li>
            <li><a href="/dieu-khoan-su-dung">Điều khoản sử dụng</a></li>
            <li><a href="/lien-he">Liên hệ & Hợp tác</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} Tin Tức Việt. Tất cả quyền được bảo lưu. Vận hành trên nền tảng Cloudflare Edge Serverless.</p>
      </div>
    </div>
  </footer>

</body>
</html>`;
}
