// src/security/ssrf.ts
// SSRF prevention: Ensures external feed URLs are safe before fetching

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'instance-data',
]);

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  // 127.0.0.0/8 (Loopback)
  if (parts[0] === 127) return true;

  // 10.0.0.0/8 (Private)
  if (parts[0] === 10) return true;

  // 172.16.0.0/12 (Private: 172.16.x.x - 172.31.x.x)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (parts[0] === 192 && parts[1] === 168) return true;

  // 169.254.0.0/16 (Link-local / Cloud metadata: 169.254.169.254)
  if (parts[0] === 169 && parts[1] === 254) return true;

  // 0.0.0.0/8 (Current network)
  if (parts[0] === 0) return true;

  return false;
}

export function validateSafeUrl(rawUrl: string): { valid: boolean; reason?: string; url?: URL } {
  try {
    const parsed = new URL(rawUrl);

    // Only allow HTTP and HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Chỉ chấp nhận giao thức HTTP hoặc HTTPS' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check blocked hostnames
    if (BLOCKED_HOSTNAMES.has(hostname)) {
      return { valid: false, reason: 'Hostname không được phép truy cập (localhost/metadata)' };
    }

    if (
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return { valid: false, reason: 'Tên miền nội bộ không được phép truy cập' };
    }

    // Check private IPv4
    if (isPrivateIpv4(hostname)) {
      return { valid: false, reason: 'Dải IP riêng tư (Private IP) bị chặn để phòng chống SSRF' };
    }

    // Check IPv6 loopback / unique local
    if (
      hostname.startsWith('[fe80:') ||
      hostname.startsWith('[fc') ||
      hostname.startsWith('[fd') ||
      hostname === '[::1]'
    ) {
      return { valid: false, reason: 'Địa chỉ IPv6 nội bộ bị chặn' };
    }

    return { valid: true, url: parsed };
  } catch {
    return { valid: false, reason: 'URL không hợp lệ' };
  }
}
