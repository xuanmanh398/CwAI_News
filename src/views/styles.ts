// src/views/styles.ts
// Embedded stylesheets for instant First Contentful Paint (FCP) and resilient Cloudflare Pages routing

export const STYLE_CSS = `
:root {
  --primary: #b31217;
  --primary-dark: #8c0c10;
  --secondary: #004d80;
  --text-main: #1f2937;
  --text-muted: #6b7280;
  --bg-body: #f8fafc;
  --bg-card: #ffffff;
  --border-color: #e5e7eb;
  --accent: #d97706;
  --font-serif: "Merriweather", "Georgia", "Times New Roman", serif;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-sans); background-color: var(--bg-body); color: var(--text-main); line-height: 1.6; }
a { color: inherit; text-decoration: none; }
a:hover { color: var(--primary); }
.container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }

/* Top Header Bar */
.top-bar { background: #ffffff; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-muted); padding: 6px 0; }
.top-bar-inner { display: flex; justify-content: space-between; align-items: center; }
.live-dot { display: inline-block; width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; margin-right: 6px; animation: pulse 2s infinite; }
@keyframes pulse { 0% { transform: scale(0.95); opacity: 0.7; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.7; } }

/* Main Header */
.main-header { background: #ffffff; padding: 20px 0; border-bottom: 2px solid var(--primary); }
.header-brand { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
.logo-title { font-size: 2.2rem; font-weight: 900; color: var(--primary); letter-spacing: -0.5px; text-transform: uppercase; }
.logo-title span { color: var(--secondary); }
.logo-slogan { font-size: 0.82rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

.header-search { display: flex; align-items: center; }
.header-search input { padding: 8px 14px; border: 1px solid var(--border-color); border-radius: 20px 0 0 20px; font-size: 0.9rem; outline: none; width: 220px; }
.header-search button { background: var(--primary); color: #fff; border: none; padding: 8px 16px; border-radius: 0 20px 20px 0; cursor: pointer; font-weight: bold; }

/* Nav Bar */
.main-nav { background: #ffffff; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 4px rgba(0,0,0,0.03); }
.nav-list { display: flex; list-style: none; overflow-x: auto; white-space: nowrap; gap: 20px; padding: 10px 0; }
.nav-item a { font-weight: 700; font-size: 0.95rem; text-transform: uppercase; color: #374151; padding-bottom: 4px; transition: color 0.15s ease; }
.nav-item a:hover, .nav-item.active a { color: var(--primary); border-bottom: 2px solid var(--primary); }

/* Breaking News Ticker */
.news-ticker { background: #f1f5f9; border-bottom: 1px solid var(--border-color); padding: 6px 0; font-size: 0.88rem; }
.ticker-inner { display: flex; align-items: center; gap: 12px; }
.ticker-badge { background: var(--primary); color: #fff; font-weight: 700; font-size: 0.75rem; padding: 2px 8px; border-radius: 3px; text-transform: uppercase; }
.ticker-link { font-weight: 500; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Ad Slots */
.ad-container { margin: 16px 0; text-align: center; }
.ad-placeholder { border: 1px dashed #cbd5e1; background: #f8fafc; padding: 16px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
.ad-badge { font-size: 0.65rem; background: #94a3b8; color: #fff; padding: 1px 6px; border-radius: 3px; font-weight: 600; }
.ad-note { font-size: 0.8rem; color: #64748b; }

/* Layout Grid */
.main-layout { display: grid; grid-template-columns: 8fr 4fr; gap: 30px; margin-top: 24px; margin-bottom: 40px; }
@media (max-width: 900px) { .main-layout { grid-template-columns: 1fr; } }

/* Hero Feature */
.hero-feature { background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.hero-feature-content { padding: 24px; }
.category-badge { display: inline-block; background: #fee2e2; color: var(--primary-dark); font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 10px; }
.hero-title { font-size: 1.85rem; font-weight: 800; line-height: 1.3; margin-bottom: 12px; color: #111827; }
.hero-sapo { font-size: 1.05rem; color: #4b5563; line-height: 1.6; margin-bottom: 14px; }
.meta-info { display: flex; align-items: center; gap: 16px; font-size: 0.82rem; color: var(--text-muted); }

/* Sub Grid */
.sub-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 30px; }
.news-card { background: #ffffff; border: 1px solid var(--border-color); border-radius: 6px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.news-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.06); }
.news-card h3 { font-size: 1.1rem; font-weight: 700; line-height: 1.4; margin: 8px 0; }
.news-card p { font-size: 0.9rem; color: #4b5563; line-height: 1.5; margin-bottom: 12px; }

/* Category Block */
.category-block { margin-bottom: 36px; }
.section-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--primary); padding-bottom: 8px; margin-bottom: 18px; }
.section-header h2 { font-size: 1.3rem; font-weight: 800; color: var(--primary); text-transform: uppercase; }
.section-header a { font-size: 0.85rem; font-weight: 600; color: var(--secondary); }

/* Sidebar */
.sidebar-widget { background: #ffffff; border: 1px solid var(--border-color); border-radius: 6px; padding: 20px; margin-bottom: 24px; }
.widget-title { font-size: 1.1rem; font-weight: 800; border-bottom: 2px solid var(--secondary); padding-bottom: 8px; margin-bottom: 16px; text-transform: uppercase; color: #1f2937; }
.trending-list { list-style: none; }
.trending-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px dashed var(--border-color); }
.trending-item:last-child { border-bottom: none; }
.trending-num { font-size: 1.4rem; font-weight: 900; color: var(--primary); line-height: 1; }
.trending-text a { font-size: 0.92rem; font-weight: 600; line-height: 1.4; color: #1f2937; }

/* Article Detail */
.article-detail { background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 30px; margin-bottom: 30px; }
.breadcrumbs { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px; }
.article-headline { font-family: var(--font-serif); font-size: 2.1rem; font-weight: 800; line-height: 1.35; color: #111827; margin-bottom: 16px; }
.article-lead { font-size: 1.15rem; font-weight: 600; color: #374151; line-height: 1.6; margin-bottom: 20px; border-left: 3px solid var(--primary); padding-left: 14px; }
.article-meta-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 10px 0; margin-bottom: 24px; font-size: 0.85rem; color: var(--text-muted); }
.ai-editorial-badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px; font-size: 0.88rem; display: flex; align-items: center; gap: 10px; }
.article-body { font-size: 1.08rem; line-height: 1.8; color: #27272a; }
.article-body p { margin-bottom: 18px; }
.article-body h3 { font-size: 1.4rem; font-weight: 700; margin: 28px 0 14px 0; color: #111827; }
.article-body ul, .article-body ol { margin: 16px 0 20px 24px; }
.article-body li { margin-bottom: 8px; }
.article-body blockquote { border-left: 4px solid var(--secondary); background: #f8fafc; padding: 14px 20px; font-style: italic; margin: 20px 0; }
.source-box { background: #f1f5f9; border-left: 4px solid #64748b; padding: 14px 18px; border-radius: 0 6px 6px 0; margin: 30px 0; font-size: 0.9rem; }
.tags-cloud { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.tag-pill { background: #f3f4f6; color: #4b5563; padding: 4px 10px; border-radius: 14px; font-size: 0.8rem; font-weight: 500; }

/* Footer */
.main-footer { background: #111827; color: #9ca3af; padding: 40px 0 20px; margin-top: 60px; font-size: 0.9rem; }
.footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 30px; margin-bottom: 30px; }
.footer-col h4 { color: #ffffff; font-size: 1rem; margin-bottom: 14px; text-transform: uppercase; }
.footer-col ul { list-style: none; }
.footer-col li { margin-bottom: 8px; }
.footer-col a:hover { color: #ffffff; }
.footer-bottom { border-top: 1px solid #374151; padding-top: 20px; text-align: center; font-size: 0.82rem; }

@media (max-width: 768px) {
  .logo-title { font-size: 1.6rem; }
  .header-search { width: 100%; }
  .header-search input { width: 100%; }
  .article-headline { font-size: 1.6rem; }
  .hero-title { font-size: 1.4rem; }
}
`;

export const ADMIN_CSS = `
:root {
  --admin-primary: #1e3a8a;
  --admin-primary-light: #3b82f6;
  --admin-accent: #0284c7;
  --admin-success: #16a34a;
  --admin-warning: #ea580c;
  --admin-danger: #dc2626;
  --admin-bg: #f3f4f6;
  --admin-card: #ffffff;
  --admin-border: #e2e8f0;
  --admin-text: #0f172a;
  --admin-muted: #64748b;
}

body.admin-body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: var(--admin-bg); color: var(--admin-text); line-height: 1.5; margin: 0; padding: 0; }
.admin-header { background: var(--admin-primary); color: #ffffff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000; }
.admin-brand { display: flex; align-items: center; gap: 12px; }
.admin-brand h1 { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.5px; }
.admin-brand span { background: #2563eb; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.admin-nav { display: flex; gap: 16px; align-items: center; }
.admin-nav a { color: #e2e8f0; text-decoration: none; font-weight: 500; font-size: 0.9rem; padding: 6px 12px; border-radius: 4px; transition: all 0.15s; }
.admin-nav a:hover, .admin-nav a.active { background: rgba(255, 255, 255, 0.15); color: #ffffff; }
.admin-container { max-width: 1300px; margin: 24px auto; padding: 0 20px; }

/* Stat Cards */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px; }
.stat-card { background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.stat-card .label { font-size: 0.85rem; color: var(--admin-muted); text-transform: uppercase; font-weight: 600; }
.stat-card .value { font-size: 2rem; font-weight: 800; margin-top: 6px; }
.stat-card.pending .value { color: var(--admin-warning); }
.stat-card.published .value { color: var(--admin-success); }
.stat-card.rejected .value { color: var(--admin-danger); }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 0.88rem; border: none; cursor: pointer; transition: opacity 0.15s; text-decoration: none; }
.btn:hover { opacity: 0.9; }
.btn-primary { background: var(--admin-primary-light); color: #fff; }
.btn-success { background: var(--admin-success); color: #fff; }
.btn-warning { background: var(--admin-warning); color: #fff; }
.btn-danger { background: var(--admin-danger); color: #fff; }
.btn-secondary { background: #e2e8f0; color: #334155; }
.btn-outline { background: transparent; border: 1px solid var(--admin-border); color: #334155; }

/* Filter & Action Bar */
.action-bar { background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 8px; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.filter-group { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.filter-group select, .filter-group input { padding: 8px 12px; border: 1px solid var(--admin-border); border-radius: 6px; font-size: 0.88rem; }

/* Table */
.data-table-container { background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 8px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.data-table th { background: #f8fafc; padding: 12px 16px; font-weight: 600; color: var(--admin-muted); border-bottom: 1px solid var(--admin-border); }
.data-table td { padding: 14px 16px; border-bottom: 1px solid var(--admin-border); vertical-align: top; }
.data-table tr:hover { background: #f8fafc; }

/* Badges */
.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.badge-pending { background: #ffedd5; color: #9a3412; }
.badge-published { background: #dcfce7; color: #166534; }
.badge-rejected { background: #fee2e2; color: #991b1b; }
.badge-ai { background: #dbeafe; color: #1e40af; }
.badge-manual { background: #f1f5f9; color: #475569; }

/* Editor Grid */
.editor-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
@media (max-width: 900px) { .editor-grid { grid-template-columns: 1fr; } }
.editor-card { background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 8px; padding: 24px; margin-bottom: 24px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-weight: 600; font-size: 0.88rem; margin-bottom: 6px; color: #334155; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid var(--admin-border); border-radius: 6px; font-size: 0.92rem; box-sizing: border-box; }
.form-group textarea { font-family: inherit; resize: vertical; }

.alert-box { padding: 14px 18px; border-radius: 6px; margin-bottom: 20px; font-size: 0.9rem; }
.alert-warning { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
.alert-info { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
.preview-banner { background: #f59e0b; color: #ffffff; padding: 10px; text-align: center; font-weight: 700; font-size: 0.9rem; position: sticky; top: 0; z-index: 999; }
`;
