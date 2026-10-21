// src/seo/generator.ts
// Dynamic Sitemap, RSS 2.0 Feed, Robots.txt, and Schema.org JSON-LD generators

import { Article, Env } from '../types/index.js';
import { escapeHtml } from '../security/sanitize.js';

export function getCanonicalOrigin(env: Env, requestUrl?: string): string {
  if (env.CANONICAL_ORIGIN && !env.CANONICAL_ORIGIN.includes('localhost')) {
    return env.CANONICAL_ORIGIN.replace(/\/$/, '');
  }
  if (requestUrl) {
    try {
      const u = new URL(requestUrl);
      return `${u.protocol}//${u.host}`;
    } catch {
      // fallback
    }
  }
  return env.CANONICAL_ORIGIN || 'http://localhost:8788';
}

/**
 * Dynamic XML Sitemap with published articles and essential static pages
 */
export async function generateSitemapXml(env: Env, origin: string): Promise<string> {
  // Query ONLY published articles
  const articlesResult = await env.DB.prepare(
    `SELECT slug, updated_at, published_at FROM articles 
     WHERE status = 'published' 
     ORDER BY published_at DESC LIMIT 1000`
  ).all<{ slug: string; updated_at: string; published_at: string }>();

  const articles = articlesResult.results || [];

  const staticRoutes = [
    { loc: '/', changefreq: 'always', priority: '1.0' },
    { loc: '/chuyen-muc/tri-tue-nhan-tao', changefreq: 'hourly', priority: '0.9' },
    { loc: '/chuyen-muc/phan-mem', changefreq: 'hourly', priority: '0.8' },
    { loc: '/chuyen-muc/an-ninh-mang', changefreq: 'hourly', priority: '0.8' },
    { loc: '/chuyen-muc/thiet-bi', changefreq: 'hourly', priority: '0.8' },
    { loc: '/chuyen-muc/cong-nghe-moi', changefreq: 'hourly', priority: '0.8' },
    { loc: '/gioi-thieu', changefreq: 'monthly', priority: '0.5' },
    { loc: '/lien-he', changefreq: 'monthly', priority: '0.5' },
    { loc: '/chinh-sach-bao-mat', changefreq: 'monthly', priority: '0.5' },
    { loc: '/dieu-khoan-su-dung', changefreq: 'monthly', priority: '0.5' },
    { loc: '/nguyen-tac-bien-tap', changefreq: 'monthly', priority: '0.5' },
    { loc: '/chinh-sach-dinh-chinh', changefreq: 'monthly', priority: '0.5' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${origin}${route.loc}</loc>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  for (const art of articles) {
    const lastMod = art.updated_at || art.published_at || new Date().toISOString();
    xml += `  <url>\n`;
    xml += `    <loc>${origin}/bai-viet/${art.slug}</loc>\n`;
    xml += `    <lastmod>${lastMod.split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

/**
 * Dynamic RSS 2.0 feed for readers and aggregators
 */
export async function generatePublicRssFeed(env: Env, origin: string): Promise<string> {
  const articlesResult = await env.DB.prepare(
    `SELECT title, slug, excerpt, category, published_at, source_name 
     FROM articles 
     WHERE status = 'published' 
     ORDER BY published_at DESC LIMIT 30`
  ).all<Article>();

  const articles = articlesResult.results || [];
  const siteTitle = env.SITE_NAME || 'Tin Tức Việt';
  const siteDesc =
    env.SITE_DESCRIPTION ||
    'Chuyên trang tin tức công nghệ, trí tuệ nhân tạo, an ninh mạng và thiết bị số.';

  let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
  rss += `  <channel>\n`;
  rss += `    <title>${escapeHtml(siteTitle)}</title>\n`;
  rss += `    <link>${origin}</link>\n`;
  rss += `    <description>${escapeHtml(siteDesc)}</description>\n`;
  rss += `    <language>vi-VN</language>\n`;
  rss += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
  rss += `    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />\n`;

  for (const art of articles) {
    const artUrl = `${origin}/bai-viet/${art.slug}`;
    const pubDate = art.published_at ? new Date(art.published_at).toUTCString() : new Date().toUTCString();

    rss += `    <item>\n`;
    rss += `      <title><![CDATA[${art.title}]]></title>\n`;
    rss += `      <link>${artUrl}</link>\n`;
    rss += `      <guid isPermaLink="true">${artUrl}</guid>\n`;
    rss += `      <description><![CDATA[${art.excerpt}]]></description>\n`;
    rss += `      <category><![CDATA[${art.category}]]></category>\n`;
    rss += `      <pubDate>${pubDate}</pubDate>\n`;
    rss += `    </item>\n`;
  }

  rss += `  </channel>\n`;
  rss += `</rss>`;
  return rss;
}

/**
 * Dynamic robots.txt
 */
export function generateRobotsTxt(origin: string): string {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`;
}

/**
 * Generates Schema.org NewsArticle JSON-LD
 */
export function generateNewsArticleJsonLd(article: Article, origin: string, siteName: string): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${origin}/bai-viet/${article.slug}`,
    },
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    articleSection: article.category,
    author: {
      '@type': 'Organization',
      name: siteName,
      url: origin,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: origin,
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/static/images/logo.png`,
      },
    },
    isAccessibleForFree: 'True',
  };

  return JSON.stringify(schema);
}

/**
 * Generates BreadcrumbList JSON-LD
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return JSON.stringify(schema);
}
