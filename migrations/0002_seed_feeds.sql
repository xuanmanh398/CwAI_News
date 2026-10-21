-- 0002_seed_feeds.sql
-- Nguồn tin công nghệ RSS chuẩn tiếng Việt và quốc tế

INSERT OR IGNORE INTO feeds (id, name, feed_url, category, enabled, created_at) VALUES
('feed_vne_sohoa', 'VnExpress Số Hóa', 'https://vnexpress.net/rss/so-hoa.rss', 'Công nghệ mới', 1, '2025-01-01T00:00:00.000Z'),
('feed_tuoitre_nss', 'Tuổi Trẻ Nhịp Sống Số', 'https://tuoitre.vn/rss/nhip-song-so.rss', 'Công nghệ mới', 1, '2025-01-01T00:00:00.000Z'),
('feed_thanhnien_cn', 'Thanh Niên Công Nghệ', 'https://thanhnien.vn/rss/cong-nghe.rss', 'Thiết bị', 1, '2025-01-01T00:00:00.000Z'),
('feed_vietnamnet_cn', 'VietNamNet Công Nghệ', 'https://vietnamnet.vn/rss/cong-nghe.rss', 'Phần mềm', 1, '2025-01-01T00:00:00.000Z'),
('feed_dantri_sms', 'Dân Trí Sức Mạnh Số', 'https://dantri.com.vn/rss/suc-manh-so.rss', 'Trí tuệ nhân tạo (AI)', 1, '2025-01-01T00:00:00.000Z');
