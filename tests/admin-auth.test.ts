// tests/admin-auth.test.ts
import { describe, it, expect } from 'vitest';
import {
  timingSafeEqual,
  createSessionToken,
  verifySessionToken,
  parseCookies,
  formatSessionCookie,
  authenticateAdminRequest,
  ADMIN_COOKIE_NAME,
} from '../src/admin/auth.js';
import { Env } from '../src/types/index.js';

describe('Admin Authentication & Security', () => {
  const secret = 'test-super-secret-key-for-admin-session-32chars';

  it('timingSafeEqual so sánh chuỗi bảo mật an toàn', () => {
    expect(timingSafeEqual('my-token-123', 'my-token-123')).toBe(true);
    expect(timingSafeEqual('my-token-123', 'my-token-456')).toBe(false);
    expect(timingSafeEqual('my-token-123', 'short')).toBe(false);
  });

  it('Tạo và xác thực Session Token hợp lệ', async () => {
    const token = await createSessionToken(secret);
    expect(token).toContain('.');

    const isValid = await verifySessionToken(token, secret);
    expect(isValid).toBe(true);
  });

  it('Từ chối token bị can thiệp hoặc sai secret', async () => {
    const token = await createSessionToken(secret);
    const tampered = token.replace(/a/g, 'b');

    const isValidWithTampered = await verifySessionToken(tampered, secret);
    expect(isValidWithTampered).toBe(false);

    const isValidWithWrongSecret = await verifySessionToken(token, 'wrong-secret-key');
    expect(isValidWithWrongSecret).toBe(false);
  });

  it('Định dạng Cookie bảo mật (HttpOnly, SameSite=Strict)', () => {
    const cookieHeader = formatSessionCookie('sample-token', 86400);
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('SameSite=Strict');
    expect(cookieHeader).toContain('Max-Age=86400');
    expect(cookieHeader).toContain(`${ADMIN_COOKIE_NAME}=sample-token`);
  });

  it('9. Người chưa xác thực không thể gọi API quản trị', async () => {
    const mockEnv: Partial<Env> = {
      ADMIN_TOKEN: 'correct-admin-secret-token',
      ADMIN_SESSION_SECRET: 'session-secret-key',
    };

    // 1. Request without any headers
    const reqNoAuth = new Request('https://example.com/api/admin/articles/123/publish', {
      method: 'POST',
    });
    const result1 = await authenticateAdminRequest(reqNoAuth, mockEnv as Env);
    expect(result1.authenticated).toBe(false);

    // 2. Request with wrong Bearer token
    const reqWrongToken = new Request('https://example.com/api/admin/articles/123/publish', {
      method: 'POST',
      headers: { Authorization: 'Bearer wrong-secret-token' },
    });
    const result2 = await authenticateAdminRequest(reqWrongToken, mockEnv as Env);
    expect(result2.authenticated).toBe(false);

    // 3. Request with correct Bearer token
    const reqCorrectToken = new Request('https://example.com/api/admin/articles/123/publish', {
      method: 'POST',
      headers: { Authorization: 'Bearer correct-admin-secret-token' },
    });
    const result3 = await authenticateAdminRequest(reqCorrectToken, mockEnv as Env);
    expect(result3.authenticated).toBe(true);
    expect(result3.actor).toBe('api_admin');
  });
});
