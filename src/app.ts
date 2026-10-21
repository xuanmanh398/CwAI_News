// src/app.ts
// Main Hono application for Tin Công Nghệ

import { Hono } from 'hono';
import { Env, Article, Feed, IngestionRun, AuditLog } from './types/index.js';
import {
  authenticateAdminRequest,
  createSessionToken,
  formatSessionCookie,
  formatClearSessionCookie,
  timingSafeEqual,
} from './admin/auth.js';
import {
  renderPublicLayout,
} from './views/layout.js';
import {
  renderHomePage,
  getCategoryFromSlug,
  getCategorySlug,
} from './views/home.js';
import { renderArticlePage } from './views/article.js';
import { renderCategoryPage } from './views/category.js';
import { renderSearchPage } from './views/search.js';
import {
  renderAboutPage,
  renderEditorialPolicyPage,
  renderCorrectionPolicyPage,
  renderPrivacyPolicyPage,
  renderTermsPage,
  renderContactPage,
  renderNotFoundPage,
} from './views/pages.js';
import {
  renderAdminLayout,
} from './views/adminLayout.js';
import {
  renderAdminLoginPage,
  renderDashboardView,
  renderQueueView,
  renderEditorView,
  renderFeedsView,
  renderAuditView,
  renderPreviewBanner,
} from './views/adminViews.js';
import {
  generateSitemapXml,
  generatePublicRssFeed,
  generateRobotsTxt,
  generateNewsArticleJsonLd,
  generateBreadcrumbJsonLd,
  getCanonicalOrigin,
} from './seo/generator.js';
import { generateAdsTxt } from './ads/adsense.js';
import { validateSafeUrl } from './security/ssrf.js';
import { sanitizeHtmlContent, escapeHtml } from './security/sanitize.js';
import { runIngestionPipeline } from './ingestion/pipeline.js';
import { STYLE_CSS, ADMIN_CSS } from './views/styles.js';

export function createApp() {
  const app = new Hono<{ Bindings: Env; Variables: { actor?: string } }>();

  // Security Headers Middleware
  app.use('*', async (c, next) => {
    await next();
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'SAMEORIGIN');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  });

  // Request Body Size Guard (max 500KB)
  app.use('*', async (c, next) => {
    const contentLength = c.req.header('content-length');
    if (contentLength && parseInt(contentLength, 10) > 512 * 1024) {
      return c.text('Request body quá lớn (tối đa 512KB)', 413);
    }
    await next();
  });

  // Helper to fetch breaking news
  async function getBreakingNews(env: Env) {
    try {
      const res = await env.DB.prepare(
        `SELECT title, slug FROM articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 3`
      ).all<{ title: string; slug: string }>();
      return res.results || [];
    } catch {
      return [];
    }
  }

  // ==========================================
  // PUBLIC SEO & FEED ENDPOINTS
  // ==========================================

  // Static Stylesheets Routes
  app.get('/static/css/style.css', (c) => {
    return c.text(STYLE_CSS, 200, {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    });
  });

  app.get('/static/css/admin.css', (c) => {
    return c.text(ADMIN_CSS, 200, {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    });
  });

  // Sitemap.xml (Dynamic)
  app.get('/sitemap.xml', async (c) => {
    const origin = getCanonicalOrigin(c.env, c.req.url);
    const sitemap = await generateSitemapXml(c.env, origin);
    return c.text(sitemap, 200, {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
  });

  // Robots.txt
  app.get('/robots.txt', (c) => {
    const origin = getCanonicalOrigin(c.env, c.req.url);
    return c.text(generateRobotsTxt(origin), 200, {
      'Content-Type': 'text/plain; charset=utf-8',
    });
  });

  // RSS 2.0 Feed (/rss.xml and /feed)
  const rssHandler = async (c: any) => {
    const origin = getCanonicalOrigin(c.env, c.req.url);
    const rss = await generatePublicRssFeed(c.env, origin);
    return c.text(rss, 200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    });
  };
  app.get('/rss.xml', rssHandler);
  app.get('/feed', rssHandler);

  // ads.txt
  app.get('/ads.txt', (c) => {
    const adsTxt = generateAdsTxt(c.env);
    return c.text(adsTxt, 200, {
      'Content-Type': 'text/plain; charset=utf-8',
    });
  });

  // ==========================================
  // PUBLIC WEBSITE ROUTES (ONLY PUBLISHED ARTICLES)
  // ==========================================

  // Home Page
  app.get('/', async (c) => {
    const origin = getCanonicalOrigin(c.env, c.req.url);
    const breaking = await getBreakingNews(c.env);

    // Fetch published articles
    const articlesRes = await c.env.DB.prepare(
      `SELECT * FROM articles 
       WHERE status = 'published' 
       ORDER BY published_at DESC LIMIT 25`
    ).all<Article>();
    const articles = articlesRes.results || [];

    // Fetch trending articles (by most recent in AI/security)
    const trendingRes = await c.env.DB.prepare(
      `SELECT * FROM articles 
       WHERE status = 'published' 
       ORDER BY published_at DESC LIMIT 5`
    ).all<Article>();
    const trending = trendingRes.results || [];

    const homeHtml = renderHomePage(articles, trending, c.env);

    const fullHtml = renderPublicLayout(
      homeHtml,
      {
        title: 'Tin Công Nghệ — Thời báo Trí tuệ nhân tạo & Công nghệ số',
        description: c.env.SITE_DESCRIPTION,
        canonicalUrl: origin,
        breakingNews: breaking,
      },
      c.env
    );

    return c.html(fullHtml);
  });

  // Article Detail Page
  app.get('/bai-viet/:slug', async (c) => {
    const slug = c.req.param('slug');
    const origin = getCanonicalOrigin(c.env, c.req.url);
    const breaking = await getBreakingNews(c.env);

    // CRITICAL SECURITY RULE: Only allow published articles to be publicly viewed
    const article = await c.env.DB.prepare(
      `SELECT * FROM articles WHERE slug = ? AND status = 'published' LIMIT 1`
    )
      .bind(slug)
      .first<Article>();

    if (!article) {
      // 404 page if not found or if pending/rejected
      const notFoundHtml = renderPublicLayout(
        renderNotFoundPage(),
        {
          title: '404 - Không tìm thấy bài viết',
          canonicalUrl: `${origin}/404`,
        },
        c.env
      );
      return c.html(notFoundHtml, 404);
    }

    // Fetch related articles in the same category
    const relatedRes = await c.env.DB.prepare(
      `SELECT * FROM articles 
       WHERE category = ? AND status = 'published' AND id != ? 
       ORDER BY published_at DESC LIMIT 4`
    )
      .bind(article.category, article.id)
      .all<Article>();
    const relatedArticles = relatedRes.results || [];

    const jsonLd = generateNewsArticleJsonLd(article, origin, c.env.SITE_NAME || 'Tin Công Nghệ');
    const articleHtml = renderArticlePage(article, relatedArticles, c.env, origin);

    const fullHtml = renderPublicLayout(
      articleHtml,
      {
        title: article.seo_title || article.title,
        description: article.seo_description || article.excerpt,
        canonicalUrl: `${origin}/bai-viet/${article.slug}`,
        ogType: 'article',
        jsonLd,
        activeCategory: article.category,
        breakingNews: breaking,
      },
      c.env
    );

    return c.html(fullHtml);
  });

  // Category Archive Page
  app.get('/chuyen-muc/:catSlug', async (c) => {
    const catSlug = c.req.param('catSlug');
    const categoryName = getCategoryFromSlug(catSlug);
    const origin = getCanonicalOrigin(c.env, c.req.url);
    const breaking = await getBreakingNews(c.env);

    const pageStr = c.req.query('page') || '1';
    const page = Math.max(1, parseInt(pageStr, 10) || 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    // Count published articles in category
    const countRes = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM articles WHERE category = ? AND status = 'published'`
    )
      .bind(categoryName)
      .first<{ total: number }>();
    const total = countRes?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch articles
    const articlesRes = await c.env.DB.prepare(
      `SELECT * FROM articles 
       WHERE category = ? AND status = 'published' 
       ORDER BY published_at DESC LIMIT ? OFFSET ?`
    )
      .bind(categoryName, limit, offset)
      .all<Article>();
    const articles = articlesRes.results || [];

    const breadcrumbsJson = generateBreadcrumbJsonLd([
      { name: 'Trang chủ', url: origin },
      { name: categoryName, url: `${origin}/chuyen-muc/${catSlug}` },
    ]);

    const catHtml = renderCategoryPage(categoryName, catSlug, articles, page, totalPages, c.env);
    const fullHtml = renderPublicLayout(
      catHtml,
      {
        title: `Tin ${categoryName} mới nhất`,
        description: `Cập nhật tin tức mới nhất về ${categoryName} tại Tin Công Nghệ.`,
        canonicalUrl: `${origin}/chuyen-muc/${catSlug}`,
        activeCategory: categoryName,
        jsonLd: breadcrumbsJson,
        breakingNews: breaking,
      },
      c.env
    );

    return c.html(fullHtml);
  });

  // Search Page
  app.get('/tim-kiem', async (c) => {
    const q = (c.req.query('q') || '').trim();
    const origin = getCanonicalOrigin(c.env, c.req.url);

    let articles: Article[] = [];
    if (q) {
      const searchRes = await c.env.DB.prepare(
        `SELECT * FROM articles 
         WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ? OR category LIKE ?) 
         ORDER BY published_at DESC LIMIT 20`
      )
        .bind(`%${q}%`, `%${q}%`, `%${q}%`)
        .all<Article>();
      articles = searchRes.results || [];
    }

    const searchHtml = renderSearchPage(q, articles, c.env);
    const fullHtml = renderPublicLayout(
      searchHtml,
      {
        title: `Tìm kiếm: ${q || 'Tin tức'}`,
        canonicalUrl: `${origin}/tim-kiem`,
      },
      c.env
    );

    return c.html(fullHtml);
  });

  // Static Policy & Legal Pages
  app.get('/gioi-thieu', (c) => {
    const origin = getCanonicalOrigin(c.env, c.req.url);
    return c.html(
      renderPublicLayout(
        renderAboutPage(),
        { title: 'Giới thiệu Tòa soạn', canonicalUrl: `${origin}/gioi-thieu` },
        c.env
      )
    );
  });

  app.get('/nguyen-tac-bien-tap', (c) => {
    const origin = getCanonicalOrigin(c.env, c.req.url);
    return c.html(
      renderPublicLayout(
        renderEditorialPolicyPage(),
        { title: 'Nguyên tắc biên tập & Đạo đức AI', canonicalUrl: `${origin}/nguyen-tac-bien-tap` },
        c.env
      )
    );
  });

  app.get('/chinh-sach-dinh-chinh', (c) => {
    const origin = getCanonicalOrigin(c.env, c.req.url);
    return c.html(
      renderPublicLayout(
        renderCorrectionPolicyPage(),
        { title: 'Chính sách sửa lỗi & Đính chính', canonicalUrl: `${origin}/chinh-sach-dinh-chinh` },
        c.env
      )
    );
  });

  app.get('/chinh-sach-bao-mat', (c) => {
    const origin = getCanonicalOrigin(c.env, c.req.url);
    return c.html(
      renderPublicLayout(
        renderPrivacyPolicyPage(),
        { title: 'Chính sách bảo mật', canonicalUrl: `${origin}/chinh-sach-bao-mat` },
        c.env
      )
    );
  });

  app.get('/dieu-khoan-su-dung', (c) => {
    const origin = getCanonicalOrigin(c.env, c.req.url);
    return c.html(
      renderPublicLayout(
        renderTermsPage(),
        { title: 'Điều khoản sử dụng', canonicalUrl: `${origin}/dieu-khoan-su-dung` },
        c.env
      )
    );
  });

  app.get('/lien-he', (c) => {
    const origin = getCanonicalOrigin(c.env, c.req.url);
    return c.html(
      renderPublicLayout(
        renderContactPage(),
        { title: 'Liên hệ Tòa soạn', canonicalUrl: `${origin}/lien-he` },
        c.env
      )
    );
  });

  // ==========================================
  // ADMIN AUTHENTICATION & LOGIN/LOGOUT
  // ==========================================

  // Admin Login Page
  app.get('/admin/login', async (c) => {
    const auth = await authenticateAdminRequest(c.req.raw, c.env);
    if (auth.authenticated) {
      return c.redirect('/admin');
    }
    const err = c.req.query('error');
    return c.html(renderAdminLoginPage(err));
  });

  // Admin Login POST API
  app.post('/api/admin/login', async (c) => {
    let token = '';
    const contentType = c.req.header('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await c.req.json().catch(() => ({}));
      token = body.token || '';
    } else {
      const body = await c.req.parseBody();
      token = (body.token as string) || '';
    }

    const adminToken = c.env.ADMIN_TOKEN || 'admin-secret-default-key-change-me';
    const sessionSecret = c.env.ADMIN_SESSION_SECRET || adminToken;

    if (!timingSafeEqual(token.trim(), adminToken)) {
      if (contentType.includes('application/json')) {
        return c.json({ success: false, message: 'Mã khóa quản trị không chính xác' }, 401);
      }
      return c.redirect('/admin/login?error=' + encodeURIComponent('Mã khóa không chính xác'));
    }

    // Generate signed session token
    const sessionToken = await createSessionToken(sessionSecret);
    const cookieHeader = formatSessionCookie(sessionToken);

    // Set Set-Cookie header
    c.header('Set-Cookie', cookieHeader);

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'Đăng nhập thành công' });
    }
    return c.redirect('/admin');
  });

  // Admin Logout POST API
  app.post('/api/admin/logout', (c) => {
    c.header('Set-Cookie', formatClearSessionCookie());
    return c.redirect('/admin/login');
  });

  // ==========================================
  // ADMIN MIDDLEWARE
  // ==========================================

  app.use('/admin/*', async (c, next) => {
    if (c.req.path === '/admin/login') {
      return next();
    }
    const auth = await authenticateAdminRequest(c.req.raw, c.env);
    if (!auth.authenticated) {
      return c.redirect('/admin/login');
    }
    c.set('actor', auth.actor || 'admin');
    await next();
  });

  app.use('/api/admin/*', async (c, next) => {
    if (c.req.path === '/api/admin/login') {
      return next();
    }
    const auth = await authenticateAdminRequest(c.req.raw, c.env);
    if (!auth.authenticated) {
      return c.json({ success: false, message: 'Chưa xác thực hoặc phiên làm việc đã hết hạn' }, 401);
    }
    c.set('actor', auth.actor || 'admin');
    await next();
  });

  // Helper for pending count in admin layout
  async function getPendingCount(env: Env): Promise<number> {
    try {
      const res = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM articles WHERE status = 'pending'`
      ).first<{ count: number }>();
      return res?.count || 0;
    } catch {
      return 0;
    }
  }

  // ==========================================
  // ADMIN CMS VIEWS
  // ==========================================

  // Dashboard View
  app.get('/admin', async (c) => {
    const pendingCount = await getPendingCount(c.env);

    // Stats
    const totalRes = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM articles`).first<{ count: number }>();
    const pubRes = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM articles WHERE status = 'published'`).first<{ count: number }>();
    const rejRes = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM articles WHERE status = 'rejected'`).first<{ count: number }>();

    // Latest ingestion run
    const latestRun = await c.env.DB.prepare(
      `SELECT * FROM ingestion_runs ORDER BY started_at DESC LIMIT 1`
    ).first<IngestionRun>();

    // Recent audit logs
    const logsRes = await c.env.DB.prepare(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5`
    ).all<AuditLog>();

    const dashboardHtml = renderDashboardView({
      totalCount: totalRes?.count || 0,
      pendingCount,
      publishedCount: pubRes?.count || 0,
      rejectedCount: rejRes?.count || 0,
      latestRun,
      recentLogs: logsRes.results || [],
    });

    return c.html(
      renderAdminLayout(dashboardHtml, {
        title: 'Bảng điều khiển',
        activeNav: 'dashboard',
        pendingCount,
      })
    );
  });

  // Queue View
  app.get('/admin/queue', async (c) => {
    const cat = c.req.query('cat') || '';
    const q = c.req.query('q') || '';
    const pendingCount = await getPendingCount(c.env);

    let query = `SELECT * FROM articles WHERE status = 'pending'`;
    const params: string[] = [];

    if (cat) {
      query += ` AND category = ?`;
      params.push(cat);
    }
    if (q) {
      query += ` AND (title LIKE ? OR original_title LIKE ? OR source_name LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT 100`;

    const stmt = c.env.DB.prepare(query);
    const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
    const articlesRes = await boundStmt.all<Article>();

    const queueHtml = renderQueueView(articlesRes.results || [], cat, q);

    return c.html(
      renderAdminLayout(queueHtml, {
        title: 'Hàng chờ biên tập duyệt bài',
        activeNav: 'queue',
        pendingCount,
      })
    );
  });

  // Editor View
  app.get('/admin/edit/:id', async (c) => {
    const id = c.req.param('id');
    const pendingCount = await getPendingCount(c.env);

    const article = await c.env.DB.prepare(`SELECT * FROM articles WHERE id = ?`).bind(id).first<Article>();
    if (!article) {
      return c.redirect('/admin/queue');
    }

    const editorHtml = renderEditorView(article);
    return c.html(
      renderAdminLayout(editorHtml, {
        title: `Biên tập: ${article.title.slice(0, 30)}...`,
        activeNav: 'queue',
        pendingCount,
      })
    );
  });

  // Internal Preview (strictly authenticated)
  app.get('/admin/preview/:id', async (c) => {
    const id = c.req.param('id');
    const origin = getCanonicalOrigin(c.env, c.req.url);

    const article = await c.env.DB.prepare(`SELECT * FROM articles WHERE id = ?`).bind(id).first<Article>();
    if (!article) {
      return c.text('Không tìm thấy bài viết', 404);
    }

    // Render with public article view but prepend a warning banner
    const bannerHtml = renderPreviewBanner(article.id);
    const articleHtml = renderArticlePage(article, [], c.env, origin);

    const fullHtml = renderPublicLayout(
      bannerHtml + articleHtml,
      {
        title: `[XEM TRƯỚC] ${article.title}`,
        canonicalUrl: `${origin}/bai-viet/${article.slug}`,
      },
      c.env
    );

    return c.html(fullHtml);
  });

  // Feeds Management View
  app.get('/admin/feeds', async (c) => {
    const pendingCount = await getPendingCount(c.env);
    const feedsRes = await c.env.DB.prepare(`SELECT * FROM feeds ORDER BY created_at ASC`).all<Feed>();

    const feedsHtml = renderFeedsView(feedsRes.results || []);
    return c.html(
      renderAdminLayout(feedsHtml, {
        title: 'Quản lý nguồn RSS',
        activeNav: 'feeds',
        pendingCount,
      })
    );
  });

  // Audit Logs View
  app.get('/admin/audit', async (c) => {
    const pendingCount = await getPendingCount(c.env);
    const logsRes = await c.env.DB.prepare(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`
    ).all<AuditLog>();

    const auditHtml = renderAuditView(logsRes.results || []);
    return c.html(
      renderAdminLayout(auditHtml, {
        title: 'Nhật ký kiểm toán',
        activeNav: 'audit',
        pendingCount,
      })
    );
  });

  // ==========================================
  // ADMIN CMS APIs (EDIT, PUBLISH, REJECT, DELETE)
  // ==========================================

  // Save Draft API
  app.post('/api/admin/articles/:id/save', async (c) => {
    const id = c.req.param('id');
    const actor = c.get('actor') || 'admin';
    const body = await c.req.json().catch(() => null);

    if (!body || !body.title || !body.content) {
      return c.json({ success: false, message: 'Dữ liệu không đầy đủ (tiêu đề và nội dung là bắt buộc)' }, 400);
    }

    const safeTitle = escapeHtml(body.title.trim());
    const safeExcerpt = escapeHtml(body.excerpt?.trim() || '');
    const safeContent = sanitizeHtmlContent(body.content);
    const category = body.category?.trim() || 'Công nghệ mới';
    const tagsJson = JSON.stringify(body.tags || []);
    const seoTitle = body.seo_title?.trim() || safeTitle;
    const seoDesc = body.seo_description?.trim() || safeExcerpt;
    const nowIso = new Date().toISOString();

    await c.env.DB.prepare(
      `UPDATE articles 
       SET title = ?, excerpt = ?, content = ?, category = ?, tags = ?, 
           seo_title = ?, seo_description = ?, updated_at = ?
       WHERE id = ?`
    )
      .bind(safeTitle, safeExcerpt, safeContent, category, tagsJson, seoTitle, seoDesc, nowIso, id)
      .run();

    // Audit log
    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, actor, action, article_id, created_at, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        actor,
        'edit',
        id,
        nowIso,
        JSON.stringify({ title: safeTitle })
      )
      .run();

    return c.json({ success: true, message: 'Đã lưu bản nháp thành công' });
  });

  // Approve & Publish API (CRITICAL PUBLISHING RULE)
  app.post('/api/admin/articles/:id/publish', async (c) => {
    const id = c.req.param('id');
    const actor = c.get('actor') || 'admin';

    // Verify article exists and is pending
    const article = await c.env.DB.prepare(`SELECT * FROM articles WHERE id = ?`).bind(id).first<Article>();
    if (!article) {
      return c.json({ success: false, message: 'Không tìm thấy bài viết' }, 404);
    }

    if (!article.title || article.title.trim().length < 5) {
      return c.json({ success: false, message: 'Tiêu đề không hợp lệ để xuất bản' }, 400);
    }

    if (!article.content || article.content.trim().length < 20) {
      return c.json({ success: false, message: 'Nội dung bài viết quá ngắn để xuất bản' }, 400);
    }

    const nowIso = new Date().toISOString();

    // Transition state strictly from pending -> published
    await c.env.DB.prepare(
      `UPDATE articles 
       SET status = 'published', published_at = ?, updated_at = ?, reviewed_by = ?
       WHERE id = ?`
    )
      .bind(nowIso, nowIso, actor, id)
      .run();

    // Audit log
    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, actor, action, article_id, created_at, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        actor,
        'publish',
        id,
        nowIso,
        JSON.stringify({ title: article.title, source: article.source_name })
      )
      .run();

    return c.json({ success: true, message: 'Bài viết đã được xuất bản công khai!' });
  });

  // Reject Draft API
  app.post('/api/admin/articles/:id/reject', async (c) => {
    const id = c.req.param('id');
    const actor = c.get('actor') || 'admin';
    const nowIso = new Date().toISOString();

    await c.env.DB.prepare(
      `UPDATE articles SET status = 'rejected', updated_at = ?, reviewed_by = ? WHERE id = ?`
    )
      .bind(nowIso, actor, id)
      .run();

    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, actor, action, article_id, created_at, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        actor,
        'reject',
        id,
        nowIso,
        JSON.stringify({ articleId: id })
      )
      .run();

    return c.json({ success: true, message: 'Đã từ chối bản nháp' });
  });

  // Delete Article API
  app.delete('/api/admin/articles/:id', async (c) => {
    const id = c.req.param('id');
    const actor = c.get('actor') || 'admin';
    const nowIso = new Date().toISOString();

    await c.env.DB.prepare(`DELETE FROM articles WHERE id = ?`).bind(id).run();

    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, actor, action, article_id, created_at, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        actor,
        'delete',
        id,
        nowIso,
        JSON.stringify({ articleId: id })
      )
      .run();

    return c.json({ success: true, message: 'Đã xóa bài viết' });
  });

  // Feed Management APIs
  app.post('/api/admin/feeds', async (c) => {
    const actor = c.get('actor') || 'admin';
    const body = await c.req.parseBody();

    const name = String(body.name || '').trim();
    const feedUrl = String(body.feed_url || '').trim();
    const category = String(body.category || 'Công nghệ mới').trim();

    if (!name || !feedUrl) {
      return c.json({ success: false, message: 'Tên và URL feed là bắt buộc' }, 400);
    }

    // SSRF Check
    const ssrf = validateSafeUrl(feedUrl);
    if (!ssrf.valid) {
      return c.json({ success: false, message: `URL không hợp lệ: ${ssrf.reason}` }, 400);
    }

    const feedId = `feed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    try {
      await c.env.DB.prepare(
        `INSERT INTO feeds (id, name, feed_url, category, enabled, created_at)
         VALUES (?, ?, ?, ?, 1, ?)`
      )
        .bind(feedId, name, feedUrl, category, nowIso)
        .run();

      await c.env.DB.prepare(
        `INSERT INTO audit_logs (id, actor, action, article_id, created_at, metadata)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(
          `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          actor,
          'create_feed',
          null,
          nowIso,
          JSON.stringify({ feedId, name, feedUrl })
        )
        .run();

      return c.redirect('/admin/feeds');
    } catch (err: any) {
      return c.json({ success: false, message: `Lỗi: ${err.message || String(err)}` }, 500);
    }
  });

  app.post('/api/admin/feeds/:id/toggle', async (c) => {
    const id = c.req.param('id');
    const actor = c.get('actor') || 'admin';
    const nowIso = new Date().toISOString();

    const feed = await c.env.DB.prepare(`SELECT enabled FROM feeds WHERE id = ?`).bind(id).first<{ enabled: number }>();
    if (!feed) {
      return c.json({ success: false, message: 'Không tìm thấy nguồn' }, 404);
    }

    const newEnabled = feed.enabled === 1 ? 0 : 1;
    await c.env.DB.prepare(`UPDATE feeds SET enabled = ? WHERE id = ?`).bind(newEnabled, id).run();

    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, actor, action, article_id, created_at, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        actor,
        'toggle_feed',
        null,
        nowIso,
        JSON.stringify({ feedId: id, newEnabled })
      )
      .run();

    return c.json({ success: true, enabled: newEnabled });
  });

  app.post('/api/admin/feeds/:id/delete', async (c) => {
    const id = c.req.param('id');
    const actor = c.get('actor') || 'admin';
    const nowIso = new Date().toISOString();

    await c.env.DB.prepare(`DELETE FROM feeds WHERE id = ?`).bind(id).run();

    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, actor, action, article_id, created_at, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        actor,
        'delete_feed',
        null,
        nowIso,
        JSON.stringify({ feedId: id })
      )
      .run();

    return c.json({ success: true });
  });

  // Immediate RSS Ingestion Trigger
  app.post('/api/admin/ingest', async (c) => {
    const actor = c.get('actor') || 'admin';
    try {
      const result = await runIngestionPipeline(c.env, { forced: true, actor });
      return c.json({ success: true, result });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || String(err) }, 500);
    }
  });

  // Protected Cron Trigger Endpoint (/api/cron/ingest)
  app.post('/api/cron/ingest', async (c) => {
    const cronSecret = c.env.CRON_SECRET || 'cron-secret-token-change-in-production';
    const authHeader = c.req.header('Authorization');
    const querySecret = c.req.query('secret');

    let authorized = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (timingSafeEqual(token, cronSecret)) authorized = true;
    } else if (querySecret && timingSafeEqual(querySecret, cronSecret)) {
      authorized = true;
    }

    if (!authorized) {
      return c.json({ success: false, message: 'Unauthorized cron request' }, 401);
    }

    try {
      const result = await runIngestionPipeline(c.env, { actor: 'cron_scheduler' });
      return c.json({ success: true, result });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || String(err) }, 500);
    }
  });

  // Catch-all 404 for undefined routes
  app.notFound((c) => {
    const origin = getCanonicalOrigin(c.env, c.req.url);
    const html = renderPublicLayout(
      renderNotFoundPage(),
      {
        title: '404 - Không tìm thấy trang',
        canonicalUrl: `${origin}/404`,
      },
      c.env
    );
    return c.html(html, 404);
  });

  // Error Handler
  app.onError((err, c) => {
    console.error('[Unhandled Error]', err);
    return c.html(
      `<!DOCTYPE html><html><body style="font-family:sans-serif; text-align:center; padding:50px;">
        <h2>Đã có lỗi hệ thống xảy ra</h2>
        <p>Vui lòng thử lại sau giây lát hoặc liên hệ ban quản trị.</p>
        <a href="/">« Về trang chủ</a>
      </body></html>`,
      500
    );
  });

  return app;
}
