// tests/ssrf.test.ts
import { describe, it, expect } from 'vitest';
import { validateSafeUrl } from '../src/security/ssrf.js';

describe('Anti-SSRF Protection', () => {
  it('Chấp nhận các URL công khai hợp lệ', () => {
    expect(validateSafeUrl('https://vnexpress.net/rss/so-hoa.rss').valid).toBe(true);
    expect(validateSafeUrl('https://feeds.arstechnica.com/arstechnica/technology-lab').valid).toBe(true);
    expect(validateSafeUrl('http://tuoitre.vn/rss/nhip-song-so.rss').valid).toBe(true);
  });

  it('Chặn các giao thức nguy hiểm (file, gopher, ftp, javascript)', () => {
    expect(validateSafeUrl('file:///etc/passwd').valid).toBe(false);
    expect(validateSafeUrl('gopher://127.0.0.1:70/').valid).toBe(false);
    expect(validateSafeUrl('javascript:alert(1)').valid).toBe(false);
    expect(validateSafeUrl('data:text/html,test').valid).toBe(false);
  });

  it('Chặn localhost, 127.0.0.1 và IPv6 loopback', () => {
    expect(validateSafeUrl('http://localhost/rss.xml').valid).toBe(false);
    expect(validateSafeUrl('http://127.0.0.1:8080/feed').valid).toBe(false);
    expect(validateSafeUrl('http://[::1]/feed').valid).toBe(false);
    expect(validateSafeUrl('http://app.localhost/feed').valid).toBe(false);
  });

  it('Chặn các dải IP mạng riêng tư (Private IP: 10.x, 192.168.x, 172.16-31.x)', () => {
    expect(validateSafeUrl('http://10.0.0.1/admin').valid).toBe(false);
    expect(validateSafeUrl('http://192.168.1.1/feed').valid).toBe(false);
    expect(validateSafeUrl('http://172.16.0.5/rss').valid).toBe(false);
    expect(validateSafeUrl('http://172.31.255.255/rss').valid).toBe(false);
  });

  it('Chặn metadata endpoint của Cloud (AWS/GCP: 169.254.169.254, metadata.google.internal)', () => {
    expect(validateSafeUrl('http://169.254.169.254/latest/meta-data/').valid).toBe(false);
    expect(validateSafeUrl('http://metadata.google.internal/computeMetadata/v1/').valid).toBe(false);
  });
});
