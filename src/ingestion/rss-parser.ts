// src/ingestion/rss-parser.ts
// Robust RSS 2.0 and Atom parser for Cloudflare Workers runtime

import { XMLParser } from 'fast-xml-parser';
import { ParsedFeedItem } from '../types/index.js';
import { validateSafeUrl } from '../security/ssrf.js';
import { stripHtmlToPlainText, decodeHtmlEntities } from '../security/sanitize.js';

export interface FeedFetchResult {
  success: boolean;
  items: ParsedFeedItem[];
  error?: string;
  feedTitle?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  textNodeName: '#text',
  parseTagValue: false,
  trimValues: true,
});

function extractText(node: any): string {
  if (!node) return '';
  let text = '';
  if (typeof node === 'string') text = node;
  else if (typeof node === 'number') text = String(node);
  else if (node.__cdata) text = String(node.__cdata);
  else if (node['#text']) text = String(node['#text']);
  else if (Array.isArray(node)) {
    text = node.map(extractText).join(' ').trim();
  }
  return text ? text.normalize('NFC') : '';
}

function extractLink(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node.trim();
  if (node.__cdata) return String(node.__cdata).trim();
  if (node['#text']) return String(node['#text']).trim();
  // Atom link handling: <link rel="alternate" href="..." /> or <link href="..." />
  if (node['@_href']) return String(node['@_href']).trim();
  if (Array.isArray(node)) {
    // Look for alternate link or first href
    const alternate = node.find((l: any) => l['@_rel'] === 'alternate' || !l['@_rel']);
    if (alternate && alternate['@_href']) return String(alternate['@_href']).trim();
    if (node[0]?.['@_href']) return String(node[0]['@_href']).trim();
    return extractText(node[0]);
  }
  return '';
}

export function parseXmlFeed(xmlString: string, maxItems: number = 10): FeedFetchResult {
  try {
    if (!xmlString || typeof xmlString !== 'string' || xmlString.trim().length === 0) {
      return { success: false, items: [], error: 'XML rỗng' };
    }

    const doc = parser.parse(xmlString);
    const items: ParsedFeedItem[] = [];
    let feedTitle = '';

    // Check RSS 2.0 / RSS 0.9 / RDF
    if (doc.rss?.channel || doc['rdf:RDF']) {
      const channel = doc.rss ? doc.rss.channel : doc['rdf:RDF'];
      feedTitle = extractText(channel.title);

      const rawItems = channel.item || [];
      const itemArray = Array.isArray(rawItems) ? rawItems : [rawItems];

      for (const item of itemArray.slice(0, maxItems)) {
        const title = extractText(item.title);
        const link = extractLink(item.link);
        const rawDesc = extractText(item.description);
        const content = extractText(item['content:encoded'] || item.content);
        const pubDate = extractText(item.pubDate || item['dc:date']);
        const guid = extractText(item.guid);

        // Extract categories if present
        let categories: string[] = [];
        if (item.category) {
          const rawCats = Array.isArray(item.category) ? item.category : [item.category];
          categories = rawCats.map((c: any) => extractText(c)).filter(Boolean);
        }

        if (title && link) {
          const cleanTitle = decodeHtmlEntities(title.trim()).normalize('NFC');
          const cleanDesc = decodeHtmlEntities(stripHtmlToPlainText(rawDesc || content || '')).slice(0, 500).normalize('NFC');
          items.push({
            title: cleanTitle,
            link: link.trim(),
            description: cleanDesc,
            content: content ? decodeHtmlEntities(content.trim()).normalize('NFC') : undefined,
            pubDate: pubDate ? pubDate.trim() : undefined,
            guid: guid || link,
            categories,
          });
        }
      }

      return { success: true, items, feedTitle };
    }

    // Check Atom Feed
    if (doc.feed) {
      const feed = doc.feed;
      feedTitle = extractText(feed.title);

      const rawEntries = feed.entry || [];
      const entryArray = Array.isArray(rawEntries) ? rawEntries : [rawEntries];

      for (const entry of entryArray.slice(0, maxItems)) {
        const title = extractText(entry.title);
        const link = extractLink(entry.link);
        const rawSummary = extractText(entry.summary || entry.content);
        const pubDate = extractText(entry.published || entry.updated);
        const guid = extractText(entry.id);

        let categories: string[] = [];
        if (entry.category) {
          const rawCats = Array.isArray(entry.category) ? entry.category : [entry.category];
          categories = rawCats
            .map((c: any) => c['@_term'] || extractText(c))
            .filter(Boolean);
        }

        if (title && link) {
          const cleanTitle = decodeHtmlEntities(title.trim()).normalize('NFC');
          const cleanSummary = decodeHtmlEntities(stripHtmlToPlainText(rawSummary)).slice(0, 500).normalize('NFC');
          items.push({
            title: cleanTitle,
            link: link.trim(),
            description: cleanSummary,
            pubDate: pubDate ? pubDate.trim() : undefined,
            guid: guid || link,
            categories,
          });
        }
      }

      return { success: true, items, feedTitle };
    }

    return {
      success: false,
      items: [],
      error: 'Định dạng XML không phải RSS 2.0 hoặc Atom hợp lệ',
    };
  } catch (err: any) {
    return {
      success: false,
      items: [],
      error: `Lỗi phân tích XML: ${err.message || String(err)}`,
    };
  }
}

/**
 * Fetches and parses an RSS/Atom feed from URL with SSRF protection, timeout, and headers
 */
export async function fetchAndParseFeed(
  feedUrl: string,
  options: { timeoutMs?: number; maxItems?: number } = {}
): Promise<FeedFetchResult> {
  const { timeoutMs = 10000, maxItems = 10 } = options;

  // SSRF validation
  const validation = validateSafeUrl(feedUrl);
  if (!validation.valid) {
    return {
      success: false,
      items: [],
      error: `Chặn URL không an toàn: ${validation.reason}`,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'TinCongNgheNewsBot/1.0 (+https://tincongnghe.pages.dev; News Ingestion Pipeline)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        items: [],
        error: `HTTP error: status ${response.status} ${response.statusText}`,
      };
    }

    const xmlText = await response.text();
    return parseXmlFeed(xmlText, maxItems);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        items: [],
        error: `Hết thời gian chờ kết nối (${timeoutMs}ms)`,
      };
    }
    return {
      success: false,
      items: [],
      error: `Lỗi mạng khi tải feed: ${err.message || String(err)}`,
    };
  }
}
