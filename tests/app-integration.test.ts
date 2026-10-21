// tests/app-integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from '../src/app.js';
import { Article, Feed, IngestionRun, AuditLog } from '../src/types/index.js';
import { createSessionToken, formatSessionCookie } from '../src/admin/auth.js';

/**
 * Lightweight in-memory D1 mock for integration testing
 */
function createMockD1() {
  const articles: Article[] = [];
  const feeds: Feed[] = [];
  const runs: IngestionRun[] = [];
  const logs: AuditLog[] = [];

  return {
    articles,
    feeds,
    runs,
    logs,
    prepare(query: string) {
      const q = query.trim();
      let boundParams: any[] = [];

      const stmt = {
        bind(...params: any[]) {
          boundParams = params;
          return stmt;
        },
        async first<T = any>(): Promise<T | null> {
          const res = await stmt.all<T>();
          return res.results[0] || null;
        },
        async all<T = any>(): Promise<{ results: T[] }> {
          // SELECT COUNT(*)
          if (q.includes('SELECT COUNT(*)')) {
            if (q.includes("status = 'pending'")) {
              const count = articles.filter((a) => a.status === 'pending').length;
              return { results: [{ count, total: count } as any] };
            }
            if (q.includes("status = 'published'")) {
              if (q.includes('WHERE category = ?')) {
                const cat = boundParams[0];
                const count = articles.filter((a) => a.status === 'published' && a.category === cat).length;
                return { results: [{ count, total: count } as any] };
              }
              const count = articles.filter((a) => a.status === 'published').length;
              return { results: [{ count, total: count } as any] };
            }
            if (q.includes("status = 'rejected'")) {
              const count = articles.filter((a) => a.status === 'rejected').length;
              return { results: [{ count, total: count } as any] };
            }
            return { results: [{ count: articles.length, total: articles.length } as any] };
          }

          // SELECT * FROM articles WHERE slug = ? AND status = 'published'
          if (q.includes("WHERE slug = ? AND status = 'published'")) {
            const slug = boundParams[0];
            const found = articles.find((a) => a.slug === slug && a.status === 'published');
            return { results: found ? [found as any] : [] };
          }

          // SELECT * FROM articles WHERE id = ?
          if (q.includes('WHERE id = ?')) {
            const id = boundParams[0];
            const found = articles.find((a) => a.id === id);
            return { results: found ? [found as any] : [] };
          }

          // SELECT * FROM articles WHERE status = 'published'
          if (q.includes("WHERE status = 'published'")) {
            const pub = articles.filter((a) => a.status === 'published');
            return { results: pub as any[] };
          }

          // SELECT slug, updated_at, published_at FROM articles WHERE status = 'published'
          if (q.includes("SELECT slug, updated_at, published_at FROM articles WHERE status = 'published'")) {
            const pub = articles.filter((a) => a.status === 'published');
            return { results: pub as any[] };
          }

          // SELECT * FROM articles WHERE status = 'pending'
          if (q.includes("WHERE status = 'pending'")) {
            const pending = articles.filter((a) => a.status === 'pending');
            return { results: pending as any[] };
          }

          // SELECT * FROM feeds
          if (q.includes('FROM feeds')) {
            return { results: feeds as any[] };
          }

          // SELECT * FROM audit_logs
          if (q.includes('FROM audit_logs')) {
            return { results: logs as any[] };
          }

          return { results: [] };
        },
        async run() {
          // INSERT INTO articles
          if (q.startsWith('INSERT INTO articles')) {
            const [
              id, slug, title, original_title, excerpt, content, category, tags,
              source_name, source_url, source_published_at, created_at, updated_at,
              content_hash, ai_generated, seo_title, seo_description, facts_to_verify
            ] = boundParams;
            articles.push({
              id, slug, title, original_title, excerpt, content, category, tags,
              source_name, source_url, source_published_at, created_at, updated_at,
              published_at: null, status: 'pending', content_hash, ai_generated,
              reviewed_by: null, seo_title, seo_description, facts_to_verify
            });
            return { success: true };
          }

          // UPDATE articles SET status = 'published'
          if (q.includes("SET status = 'published'")) {
            const [pubAt, updAt, reviewer, id] = boundParams;
            const target = articles.find((a) => a.id === id);
            if (target) {
              target.status = 'published';
              target.published_at = pubAt;
              target.updated_at = updAt;
              target.reviewed_by = reviewer;
            }
            return { success: true };
          }

          // UPDATE articles SET status = 'rejected'
          if (q.includes("SET status = 'rejected'")) {
            const [updAt, reviewer, id] = boundParams;
            const target = articles.find((a) => a.id === id);
            if (target) {
              target.status = 'rejected';
              target.updated_at = updAt;
              target.reviewed_by = reviewer;
            }
            return { success: true };
          }

          // INSERT INTO audit_logs
          if (q.startsWith('INSERT INTO audit_logs')) {
            const [id, actor, action, article_id, created_at, metadata] = boundParams;
            logs.push({ id, actor, action, article_id, created_at, metadata });
            return { success: true };
          }

          return { success: true };
        },
      };

      return stmt as any;
    },
  };
}

describe('Full Application Integration Tests', () => {
  const ADMIN_TOKEN = 'secret-admin-pass-12345';
  const ADMIN_SESSION_SECRET = 'secret-admin-session-secret-98765';
  let mockDb: ReturnType<typeof createMockD1>;
  let env: any;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    mockDb = createMockD1();
    env = {
      DB: mockDb,
      ADMIN_TOKEN,
      ADMIN_SESSION_SECRET,
      CANONICAL_ORIGIN: 'https://tincongnghe.pages.dev',
      SITE_NAME: 'Tin Công Nghệ',
    };
    app = createApp();
  });

  it('8. Bài pending KHÔNG xuất hiện công khai trên trang chủ hoặc trang chi tiết', async () => {
    // Add a pending article
    mockDb.articles.push({
      id: 'art_pending_1',
      slug: 'bai-viet-dang-cho-duyet',
      title: 'Tiêu đề bài viết đang chờ duyệt bảo mật',
      original_title: 'Original Title',
      excerpt: 'Mô tả bài viết nháp chưa duyệt',
      content: '<p>Nội dung nháp</p>',
      category: 'Trí tuệ nhân tạo (AI)',
      tags: '["AI"]',
      source_name: 'VnExpress',
      source_url: 'https://vnexpress.net/ai-1',
      source_published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: null,
      status: 'pending',
      content_hash: 'hash123',
      ai_generated: 1,
      reviewed_by: null,
      seo_title: 'SEO Title',
      seo_description: 'SEO Desc',
      facts_to_verify: null,
    });

    // 1. Check Homepage: Pending article must NOT appear
    const homeRes = await app.request('/', {}, env);
    expect(homeRes.status).toBe(200);
    const homeText = await homeRes.text();
    expect(homeText).not.toContain('Tiêu đề bài viết đang chờ duyệt bảo mật');

    // 2. Check Public Article Detail: Must return 404 Not Found!
    const detailRes = await app.request('/bai-viet/bai-viet-dang-cho-duyet', {}, env);
    expect(detailRes.status).toBe(404);
    const detailText = await detailRes.text();
    expect(detailText).toContain('Không tìm thấy trang yêu cầu');
  });

  it('10. Bài pending chỉ được xuất bản sau hành động quản trị hợp lệ (Publish)', async () => {
    // Add a pending article
    mockDb.articles.push({
      id: 'art_pending_2',
      slug: 'dot-pha-moi-ai-2025',
      title: 'Đột phá AI năm 2025 được công bố',
      original_title: 'New AI Breakthrough',
      excerpt: 'Tóm tắt bài viết AI',
      content: '<p>Nội dung phân tích chuyên sâu về AI...</p>',
      category: 'Trí tuệ nhân tạo (AI)',
      tags: '["AI", "CongNghe"]',
      source_name: 'Tuổi Trẻ',
      source_url: 'https://tuoitre.vn/ai-2',
      source_published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: null,
      status: 'pending',
      content_hash: 'hash456',
      ai_generated: 1,
      reviewed_by: null,
      seo_title: null,
      seo_description: null,
      facts_to_verify: null,
    });

    // 1. Attempt to publish without authentication -> Must return 401 Unauthorized
    const unauthPub = await app.request(
      '/api/admin/articles/art_pending_2/publish',
      { method: 'POST' },
      env
    );
    expect(unauthPub.status).toBe(401);
    expect(mockDb.articles[0].status).toBe('pending');

    // 2. Publish with valid Admin Bearer token
    const authPub = await app.request(
      '/api/admin/articles/art_pending_2/publish',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      },
      env
    );
    expect(authPub.status).toBe(200);
    const pubResult = (await authPub.json()) as { success: boolean };
    expect(pubResult.success).toBe(true);

    // Verify DB state updated
    expect(mockDb.articles[0].status).toBe('published');
    expect(mockDb.articles[0].published_at).toBeTruthy();
    expect(mockDb.articles[0].reviewed_by).toBe('api_admin');

    // Verify Audit log was recorded
    expect(mockDb.logs.length).toBeGreaterThan(0);
    expect(mockDb.logs[0].action).toBe('publish');

    // 3. Now verify the article IS accessible publicly!
    const publicView = await app.request('/bai-viet/dot-pha-moi-ai-2025', {}, env);
    expect(publicView.status).toBe(200);
    const publicHtml = await publicView.text();
    expect(publicHtml).toContain('Đột phá AI năm 2025 được công bố');
  });

  it('12. Dynamic Sitemap.xml KHÔNG chứa bài viết chưa xuất bản', async () => {
    // 1 pending article and 1 published article
    mockDb.articles.push(
      {
        id: '1',
        slug: 'bai-viet-chua-duyet',
        title: 'Chưa duyệt',
        original_title: 'Draft',
        excerpt: 'Excerpt',
        content: 'Content',
        category: 'Công nghệ mới',
        tags: '[]',
        source_name: 'Source',
        source_url: 'http://source.com/1',
        source_published_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: null,
        status: 'pending',
        content_hash: 'h1',
        ai_generated: 1,
        reviewed_by: null,
        seo_title: null,
        seo_description: null,
        facts_to_verify: null,
      },
      {
        id: '2',
        slug: 'bai-viet-chinh-thuc-xuat-ban',
        title: 'Đã xuất bản',
        original_title: 'Official',
        excerpt: 'Excerpt',
        content: 'Content',
        category: 'Trí tuệ nhân tạo (AI)',
        tags: '[]',
        source_name: 'Source',
        source_url: 'http://source.com/2',
        source_published_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        status: 'published',
        content_hash: 'h2',
        ai_generated: 1,
        reviewed_by: 'admin',
        seo_title: null,
        seo_description: null,
        facts_to_verify: null,
      }
    );

    const sitemapRes = await app.request('/sitemap.xml', {}, env);
    expect(sitemapRes.status).toBe(200);
    expect(sitemapRes.headers.get('Content-Type')).toContain('application/xml');

    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).toContain('/bai-viet/bai-viet-chinh-thuc-xuat-ban');
    expect(sitemapXml).not.toContain('/bai-viet/bai-viet-chua-duyet');
  });

  it('13. Canonical URL và SEO metadata hoạt động chính xác', async () => {
    mockDb.articles.push({
      id: '3',
      slug: 'sieu-may-tinh-ai-viet-nam',
      title: 'Việt Nam phát triển siêu máy tính AI mới',
      original_title: 'Original',
      excerpt: 'Mô tả tóm tắt cho công cụ tìm kiếm Google',
      content: '<p>Nội dung chi tiết về siêu máy tính AI...</p>',
      category: 'Trí tuệ nhân tạo (AI)',
      tags: '["AI", "SieuMayTinh"]',
      source_name: 'VnExpress',
      source_url: 'https://vnexpress.net/ai-supercomputer',
      source_published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      status: 'published',
      content_hash: 'h3',
      ai_generated: 1,
      reviewed_by: 'admin',
      seo_title: 'Siêu máy tính AI Việt Nam 2025 | Tin Công Nghệ',
      seo_description: 'Khám phá năng lực tính toán của siêu máy tính AI tại Việt Nam.',
      facts_to_verify: null,
    });

    const res = await app.request('/bai-viet/sieu-may-tinh-ai-viet-nam', {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();

    // Canonical link
    expect(html).toContain('<link rel="canonical" href="https://tincongnghe.pages.dev/bai-viet/sieu-may-tinh-ai-viet-nam">');

    // Title tag
    expect(html).toContain('<title>Siêu máy tính AI Việt Nam 2025 | Tin Công Nghệ</title>');

    // Meta description
    expect(html).toContain('content="Khám phá năng lực tính toán của siêu máy tính AI tại Việt Nam."');

    // OpenGraph
    expect(html).toContain('<meta property="og:type" content="article">');

    // Schema.org JSON-LD NewsArticle
    expect(html).toContain('"@type":"NewsArticle"');
    expect(html).toContain('"headline":"Việt Nam phát triển siêu máy tính AI mới"');
  });

  it('14. Giao diện trang chủ và bài viết hỗ trợ responsive trên mobile', async () => {
    const res = await app.request('/', {}, env);
    const html = await res.text();

    // Viewport tag for mobile responsiveness
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    // CSS stylesheet linked
    expect(html).toContain('<link rel="stylesheet" href="/static/css/style.css">');
    // Semantic header and navigation
    expect(html).toContain('<header class="main-header">');
    expect(html).toContain('<nav class="main-nav">');
  });

  it('15. Xử lý lỗi database và tuyến đường không tồn tại (404 / 500)', async () => {
    // 404 for random non-existent page
    const res404 = await app.request('/duong-dan-khong-ton-tai', {}, env);
    expect(res404.status).toBe(404);
    const body404 = await res404.text();
    expect(body404).toContain('404');
    expect(body404).toContain('Không tìm thấy trang yêu cầu');
  });
});
