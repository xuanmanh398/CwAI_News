// src/ingestion/deduplication.ts
// URL normalization, title hashing, and slug generation for Vietnamese tech news

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'ref',
  'ref_src',
  'source',
  'ysclid',
  'yclid',
  'mc_cid',
  'mc_eid',
  'spm',
  'igshid',
  'nd',
]);

/**
 * Normalizes URL by removing tracking params, trailing slashes and hash fragments
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    parsed.hash = '';

    // Filter out tracking parameters
    const keysToDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      const lower = key.toLowerCase();
      if (TRACKING_PARAMS.has(lower) || lower.startsWith('utm_')) {
        keysToDelete.push(key);
      }
    });
    for (const key of keysToDelete) {
      parsed.searchParams.delete(key);
    }

    let result = parsed.toString();
    // Remove trailing slash if path is longer than '/'
    if (parsed.pathname !== '/' && result.endsWith('/')) {
      result = result.slice(0, -1);
    }
    return result;
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Normalizes title for deduplication comparison:
 * Lowercases, strips Vietnamese accents, removes non-alphanumeric chars, collapses whitespace.
 */
export function normalizeTitleForDeduplication(title: string): string {
  return removeVietnameseDiacritics(title)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes SHA-256 hash using Web Crypto API (available in Cloudflare Workers and Node.js)
 */
export async function computeSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Removes Vietnamese diacritics / accents
 */
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Converts a Vietnamese title into a clean SEO-friendly slug
 */
export function generateSlug(title: string, suffix?: string): string {
  const ascii = removeVietnameseDiacritics(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  const baseSlug = ascii || 'tin-cong-nghe';
  if (suffix) {
    return `${baseSlug}-${suffix}`;
  }
  return baseSlug;
}
