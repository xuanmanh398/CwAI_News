-- 0003_add_image_url.sql
-- Thêm cột lưu đường dẫn hình ảnh đại diện của bài viết

ALTER TABLE articles ADD COLUMN image_url TEXT;
