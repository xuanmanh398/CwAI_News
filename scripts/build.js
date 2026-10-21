// scripts/build.js
import fs from 'node:fs';
import path from 'node:path';

console.log('[Build] Bắt đầu kiểm tra và chuẩn bị thư mục xuất bản Cloudflare Pages...');

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Ensure static css folder exists
const cssDir = path.join(publicDir, 'static', 'css');
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

console.log('[Build] Thư mục public đã sẵn sàng cho Cloudflare Pages.');
console.log('[Build] Hoàn tất build!');
