// tests/categorizer.test.ts
import { describe, it, expect } from 'vitest';
import { categorizeArticle } from '../src/ingestion/categorizer.js';

describe('Auto Categorizer', () => {
  it('Phân loại chính xác tin tức Trí tuệ nhân tạo (AI)', () => {
    const cat = categorizeArticle('OpenAI ra mắt mô hình GPT-4o hỗ trợ giọng nói tự nhiên', 'Mô hình LLM thông minh mới');
    expect(cat).toBe('Trí tuệ nhân tạo (AI)');

    const cat2 = categorizeArticle('DeepSeek công bố thuật toán AI mới đạt hiệu năng vượt trội');
    expect(cat2).toBe('Trí tuệ nhân tạo (AI)');
  });

  it('Phân loại chính xác tin tức An ninh mạng', () => {
    const cat = categorizeArticle('Hacker tấn công mã độc tống tiền ransomware vào ngân hàng lớn', 'Cảnh báo lừa đảo mạng và rò rỉ dữ liệu');
    expect(cat).toBe('An ninh mạng');

    const cat2 = categorizeArticle('Phát hiện lỗ hổng bảo mật nghiêm trọng trong máy chủ');
    expect(cat2).toBe('An ninh mạng');
  });

  it('Phân loại chính xác tin tức Thiết bị', () => {
    const cat = categorizeArticle('Đánh giá iPhone 16 Pro Max: Camera và chip A18 Pro đỉnh cao', 'Chiếc smartphone cao cấp nhất của Apple');
    expect(cat).toBe('Thiết bị');

    const cat2 = categorizeArticle('Nvidia xuất xưởng GPU Blackwell mới cho trung tâm dữ liệu');
    expect(cat2).toBe('Thiết bị');
  });

  it('Phân loại chính xác tin tức Phần mềm', () => {
    const cat = categorizeArticle('Microsoft tung bản cập nhật Windows 11 với nhiều tính năng mới', 'Hệ điều hành và trình duyệt Edge được nâng cấp');
    expect(cat).toBe('Phần mềm');

    const cat2 = categorizeArticle('Zalo bổ sung tính năng gửi file dung lượng lớn trên ứng dụng');
    expect(cat2).toBe('Phần mềm');
  });

  it('Gán mặc định Công nghệ mới khi không có từ khóa đặc thù', () => {
    const cat = categorizeArticle('Startup xe điện VinFast mở rộng mạng lưới trạm sạc');
    expect(cat).toBe('Công nghệ mới');
  });
});
