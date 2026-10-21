// tests/rss-parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseXmlFeed } from '../src/ingestion/rss-parser.js';

describe('RSS / Atom Feed Parser', () => {
  it('1. Đọc và phân tích RSS 2.0 hợp lệ', () => {
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tin Công Nghệ Test Feed</title>
    <link>https://example.com</link>
    <description>Kênh tin thử nghiệm</description>
    <item>
      <title>OpenAI ra mắt mô hình GPT-5 mới</title>
      <link>https://example.com/ai/gpt-5?utm_source=rss</link>
      <description><![CDATA[Mô hình AI mới đạt kỷ lục về tư duy logic.]]></description>
      <pubDate>Mon, 20 Oct 2025 08:00:00 GMT</pubDate>
      <guid>https://example.com/ai/gpt-5</guid>
      <category>Trí tuệ nhân tạo (AI)</category>
    </item>
    <item>
      <title>Apple công bố chip M4 Pro siêu mạnh</title>
      <link>https://example.com/hardware/m4-pro</link>
      <description>Chip tiến trình 3nm tối ưu cho máy tính bảng và laptop.</description>
      <pubDate>Mon, 20 Oct 2025 09:30:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

    const result = parseXmlFeed(rssXml, 10);
    expect(result.success).toBe(true);
    expect(result.feedTitle).toBe('Tin Công Nghệ Test Feed');
    expect(result.items.length).toBe(2);

    expect(result.items[0].title).toBe('OpenAI ra mắt mô hình GPT-5 mới');
    expect(result.items[0].link).toBe('https://example.com/ai/gpt-5?utm_source=rss');
    expect(result.items[0].description).toBe('Mô hình AI mới đạt kỷ lục về tư duy logic.');
    expect(result.items[0].categories).toContain('Trí tuệ nhân tạo (AI)');

    expect(result.items[1].title).toBe('Apple công bố chip M4 Pro siêu mạnh');
  });

  it('2. Đọc và phân tích Atom feed hợp lệ', () => {
    const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Ars Technica Tech Atom Feed</title>
  <link href="https://arstechnica.com" />
  <updated>2025-10-20T10:00:00Z</updated>
  <id>tag:arstechnica.com,2025:feed</id>
  <entry>
    <title>Phát hiện lỗ hổng Zero-day nguy hiểm trong trình duyệt</title>
    <link rel="alternate" href="https://arstechnica.com/security/zero-day-chrome" />
    <id>tag:arstechnica.com,2025:entry1</id>
    <published>2025-10-20T09:00:00Z</published>
    <summary>Chuyên gia bảo mật khuyến cáo người dùng cập nhật khẩn cấp bản vá mới.</summary>
    <category term="An ninh mạng" />
  </entry>
</feed>`;

    const result = parseXmlFeed(atomXml, 10);
    expect(result.success).toBe(true);
    expect(result.feedTitle).toBe('Ars Technica Tech Atom Feed');
    expect(result.items.length).toBe(1);
    expect(result.items[0].title).toBe('Phát hiện lỗ hổng Zero-day nguy hiểm trong trình duyệt');
    expect(result.items[0].link).toBe('https://arstechnica.com/security/zero-day-chrome');
    expect(result.items[0].description).toContain('Chuyên gia bảo mật');
  });

  it('3. Xử lý feed lỗi và XML sai định dạng', () => {
    // Malformed XML
    const malformedXml = `<rss><channel><title>Chưa đóng thẻ XML`;
    const res1 = parseXmlFeed(malformedXml);
    // Should fail gracefully without uncaught crash
    expect(res1.items.length).toBe(0);

    // Empty string
    const res2 = parseXmlFeed('');
    expect(res2.success).toBe(false);
    expect(res2.error).toContain('XML rỗng');

    // Non-feed XML
    const notAFeedXml = `<?xml version="1.0"?><note><to>User</to><from>Admin</from></note>`;
    const res3 = parseXmlFeed(notAFeedXml);
    expect(res3.success).toBe(false);
    expect(res3.error).toContain('không phải RSS 2.0 hoặc Atom hợp lệ');
  });
});
