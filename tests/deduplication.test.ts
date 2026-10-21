// tests/deduplication.test.ts
import { describe, it, expect } from 'vitest';
import {
  normalizeUrl,
  normalizeTitleForDeduplication,
  computeSha256,
  generateSlug,
} from '../src/ingestion/deduplication.js';

describe('Deduplication & Normalization', () => {
  it('4. Chuẩn hóa URL và loại bỏ tracking parameters', () => {
    const dirtyUrl = 'https://vnexpress.net/cong-nghe/ai-dot-pha-12345.html?utm_source=facebook&utm_medium=cpc&fbclid=IwAR123#comments';
    const clean = normalizeUrl(dirtyUrl);
    expect(clean).toBe('https://vnexpress.net/cong-nghe/ai-dot-pha-12345.html');

    const withTrailingSlash = 'https://tuoitre.vn/nhip-song-so/iphone-17-pro/';
    expect(normalizeUrl(withTrailingSlash)).toBe('https://tuoitre.vn/nhip-song-so/iphone-17-pro');
  });

  it('5. Chống trùng theo hash nội dung tiêu đề', async () => {
    const title1 = 'Đột Phá Mới Trong Trí Tuệ Nhân Tạo Năm 2025!';
    const title2 = '  dot pha moi trong tri tue nhan tao nam 2025   ';
    const title3 = 'ĐỘT PHÁ MỚI trong trí tuệ nhân tạo năm 2025.';

    const norm1 = normalizeTitleForDeduplication(title1);
    const norm2 = normalizeTitleForDeduplication(title2);
    const norm3 = normalizeTitleForDeduplication(title3);

    expect(norm1).toBe(norm2);
    expect(norm2).toBe(norm3);

    const hash1 = await computeSha256(norm1);
    const hash2 = await computeSha256(norm2);
    const hash3 = await computeSha256(norm3);

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
    expect(hash1.length).toBe(64); // SHA-256 hex length
  });

  it('Tạo slug tiếng Việt thân thiện với SEO', () => {
    const slug1 = generateSlug('Đột phá AI mới của OpenAI năm 2025');
    expect(slug1).toBe('dot-pha-ai-moi-cua-openai-nam-2025');

    const slugWithSuffix = generateSlug('Giá iPhone 16 Pro Max tại Việt Nam', 'x9b2a1');
    expect(slugWithSuffix).toBe('gia-iphone-16-pro-max-tai-viet-nam-x9b2a1');
  });
});
