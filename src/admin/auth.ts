// src/admin/auth.ts
// Secure Admin Authentication & Session Management

import { Env } from '../types/index.js';

export const ADMIN_COOKIE_NAME = 'tcn_admin_session';

/**
 * Timing-safe string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Creates a signed session token: timestamp.signature
 */
export async function createSessionToken(secret: string): Promise<string> {
  const timestamp = Date.now().toString();
  const signature = await signMessage(timestamp, secret);
  return `${timestamp}.${signature}`;
}

/**
 * Verifies if session token is valid and not expired (24 hour lifetime)
 */
export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, providedSig] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // 24 hour expiry (86,400,000 ms)
  const maxAgeMs = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAgeMs) {
    return false;
  }

  const expectedSig = await signMessage(timestampStr, secret);
  return timingSafeEqual(providedSig, expectedSig);
}

/**
 * HMAC-SHA256 signature using Web Crypto
 */
async function signMessage(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates request against either Admin Session Cookie or Authorization Header
 */
export async function authenticateAdminRequest(
  request: Request,
  env: Env
): Promise<{ authenticated: boolean; actor?: string; reason?: string }> {
  const adminToken = env.ADMIN_TOKEN || 'admin-secret-default-key-change-me';
  const sessionSecret = env.ADMIN_SESSION_SECRET || adminToken;

  // 1. Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    if (timingSafeEqual(bearerToken, adminToken)) {
      return { authenticated: true, actor: 'api_admin' };
    }
  }

  // 2. Check HttpOnly Cookie
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    const sessionCookie = cookies[ADMIN_COOKIE_NAME];
    if (sessionCookie) {
      const isValid = await verifySessionToken(sessionCookie, sessionSecret);
      if (isValid) {
        return { authenticated: true, actor: 'cms_admin' };
      }
    }
  }

  return { authenticated: false, reason: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn' };
}

/**
 * Cookie parser helper
 */
export function parseCookies(header: string): Record<string, string> {
  const list: Record<string, string> = {};
  header.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('=').trim());
    }
  });
  return list;
}

/**
 * Formats Set-Cookie header for secure Admin Session
 */
export function formatSessionCookie(token: string, maxAgeSeconds: number = 86400): string {
  // SameSite=Strict and HttpOnly protect against CSRF and XSS token theft
  return `${ADMIN_COOKIE_NAME}=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Strict`;
}

export function formatClearSessionCookie(): string {
  return `${ADMIN_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`;
}
