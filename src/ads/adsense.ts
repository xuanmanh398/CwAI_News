// src/ads/adsense.ts
// AdSense management: Safe placeholders, configurable ads, and ads.txt generation

import { Env } from '../types/index.js';

export function isAdSenseActive(env: Env): boolean {
  return (
    env.ADSENSE_ENABLED === 'true' &&
    typeof env.ADSENSE_CLIENT === 'string' &&
    env.ADSENSE_CLIENT.startsWith('ca-pub-') &&
    env.ADSENSE_CLIENT.length > 10
  );
}

export function renderAdSenseHeaderScript(env: Env): string {
  if (!isAdSenseActive(env)) {
    return '<!-- AdSense: Chế độ thử nghiệm / Chưa kích hoạt cấu hình nhà xuất bản -->';
  }
  const client = env.ADSENSE_CLIENT!;
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>`;
}

export function renderAdSlot(
  env: Env,
  slotId: string,
  slotType: 'header-banner' | 'in-article' | 'sidebar' | 'footer'
): string {
  const active = isAdSenseActive(env);

  if (!active) {
    // Development / non-configured placeholder
    return `
<div class="ad-container ad-${slotType}">
  <div class="ad-placeholder" role="complementary" aria-label="Khu vực quảng cáo">
    <span class="ad-badge">QUẢNG CÁO</span>
    <span class="ad-note">Vị trí: ${slotType} (${slotId}) — Hiển thị tự động khi kích hoạt Google AdSense</span>
  </div>
</div>
    `.trim();
  }

  // Active production AdSense slot
  return `
<div class="ad-container ad-${slotType}">
  <div class="ad-label">QUẢNG CÁO</div>
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="${env.ADSENSE_CLIENT}"
       data-ad-slot="${slotId}"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
  `.trim();
}

/**
 * Generates ads.txt content according to Google AdSense specification
 */
export function generateAdsTxt(env: Env): string {
  if (isAdSenseActive(env) && env.ADSENSE_CLIENT) {
    // Format: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
    const pubId = env.ADSENSE_CLIENT.replace(/^ca-/, '');
    return `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;
  }
  return `# ads.txt - Tin Công Nghệ\n# Cấu hình ADSENSE_CLIENT trong Cloudflare Settings để tự động cập nhật ID nhà xuất bản hợp lệ.\n`;
}
