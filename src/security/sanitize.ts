// src/security/sanitize.ts
// Anti-XSS Sanitizer for Vietnamese News Content

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
