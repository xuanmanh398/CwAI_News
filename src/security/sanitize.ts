// src/security/sanitize.ts
// Anti-XSS Sanitizer for Vietnamese News Content

export function decodeHtmlEntities(str: string): string {
  if (!str) return '';

  const NAMED_ENTITIES: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    '&eacute;': 'é',
    '&Eacute;': 'É',
    '&agrave;': 'à',
    '&Agrave;': 'À',
    '&aacute;': 'á',
    '&Aacute;': 'Á',
    '&oacute;': 'ó',
    '&Oacute;': 'Ó',
    '&ograve;': 'ò',
    '&Ograve;': 'Ò',
    '&ecirc;': 'ê',
    '&Ecirc;': 'Ê',
    '&iacute;': 'í',
    '&Iacute;': 'Í',
    '&igrave;': 'ì',
    '&Igrave;': 'Ì',
    '&uacute;': 'ú',
    '&Uacute;': 'Ú',
    '&ugrave;': 'ù',
    '&Ugrave;': 'Ù',
    '&yacute;': 'ý',
    '&Yacute;': 'Ý',
    '&atilde;': 'ã',
    '&Atilde;': 'Ã',
    '&otilde;': 'õ',
    '&Otilde;': 'Õ',
    '&ntilde;': 'ñ',
    '&Ntilde;': 'Ñ',
  };

  let decoded = str;

  // Replace named entities
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    decoded = decoded.split(entity).join(char);
  }

  // Replace decimal entities &#123;
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) => {
    try {
      return String.fromCharCode(parseInt(dec, 10));
    } catch {
      return _;
    }
  });

  // Replace hex entities &#x1a;
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return _;
    }
  });

  return decoded.normalize('NFC');
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFC')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeHtmlContent(html: string): string {
  if (!html) return '';

  let sanitized = html.normalize('NFC');

  // 1. Remove dangerous tags and their content: script, style, iframe, object, embed, applet, form, svg, base
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
  sanitized = sanitized.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');

  // 2. Remove dangerous standalone tags
  sanitized = sanitized.replace(/<\/?(?:script|style|iframe|object|embed|applet|meta|link|base|form|input|button|textarea|select)\b[^>]*>/gi, '');

  // 3. Remove inline javascript event handlers (e.g., onclick, onerror, onload, onmouseover...)
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 4. Remove javascript: and data: pseudo-protocols in href and src attributes
  sanitized = sanitized.replace(/(href|src)\s*=\s*['"]\s*(?:javascript|data|vbscript):[^'"]*?['"]/gi, '$1="#"');

  return sanitized.trim();
}

export function stripHtmlToPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
