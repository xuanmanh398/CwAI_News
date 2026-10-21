// tests/ai-drafting.test.ts
import { describe, it, expect } from 'vitest';
import {
  generateArticleDraft,
  createMetadataFallbackDraft,
  AiDraftResponseSchema,
} from '../src/ai/drafting.js';

describe('AI Drafting & Fallback Pipeline', () => {
  it('7. Hoạt động dự phòng khi AI không khả dụng (Workers AI is undefined/null)', async () => {
    const item = {
      title: 'Google ra mắt chip lượng tử mới Willow',
      description: 'Chip Willow có khả năng giảm cấp số nhân lỗi trong điện toán lượng tử.',
      link: 'https://vnexpress.net/google-ra-mat-chip-luong-tu-willow.html',
      sourceName: 'VnExpress',
      sourceCategoryHint: 'Công nghệ',
    };

    // Call without AI binding
    const { draft, aiUsed } = await generateArticleDraft(item, undefined);

    expect(aiUsed).toBe(false);
    expect(draft.title).toBe('Google ra mắt chip lượng tử mới Willow');
    expect(draft.excerpt).toContain('Chip Willow');
    expect(draft.suggestedCategory).toBe('Thiết bị');
    expect(draft.factsToVerify).toContain('Cần xác minh');
    expect(draft.content).toContain('Chi tiết và bối cảnh phát triển');
  });

  it('Hoạt động dự phòng khi Workers AI ném ngoại lệ (network timeout / rate limit)', async () => {
    const item = {
      title: 'Cảnh báo lỗ hổng mới trên hệ thống đám mây',
      description: 'Chuyên gia bảo mật phát hiện nguy cơ tấn công',
      link: 'https://example.com/sec',
      sourceName: 'Thanh Niên',
    };

    const failingAiBinding = {
      run: async () => {
        throw new Error('429 Rate Limit Exceeded or Model Overloaded');
      },
    };

    const { draft, aiUsed } = await generateArticleDraft(item, failingAiBinding);

    expect(aiUsed).toBe(false);
    expect(draft.suggestedCategory).toBe('An ninh mạng');
    expect(draft.factsToVerify).toBeTruthy();
  });

  it('6. Xử lý khi AI trả về JSON sai cú pháp hoặc chuỗi văn bản không đúng schema', async () => {
    const item = {
      title: 'DeepSeek mở mã nguồn mô hình suy luận',
      description: 'Mô hình R1 có khả năng tư duy cao',
      link: 'https://example.com/deepseek',
      sourceName: 'Tuổi Trẻ',
    };

    // AI returns non-JSON conversational text
    const malformedAiBinding = {
      run: async () => {
        return 'Xin chào, đây là bài viết tôi vừa viết nhưng tôi không trả về JSON: Tiêu đề rất hay!';
      },
    };

    const { draft, aiUsed } = await generateArticleDraft(item, malformedAiBinding);

    // Must gracefully fall back without throwing an uncaught exception
    expect(aiUsed).toBe(false);
    expect(draft.title).toBe(item.title);
    expect(draft.factsToVerify).toContain('Cần xác minh');
  });

  it('Xác thực schema khi AI trả về JSON hợp lệ', async () => {
    const item = {
      title: 'OpenAI ra mắt GPT-5',
      description: 'Bản nâng cấp lớn',
      link: 'https://example.com/gpt5',
      sourceName: 'Ars Technica',
    };

    const validAiResponse = {
      title: 'OpenAI chính thức giới thiệu mô hình GPT-5 với năng lực vượt trội',
      excerpt: 'Mô hình thế hệ mới mang lại bước nhảy vọt về khả năng lập luận và giải quyết bài toán phức tạp.',
      content: '<p>Hôm nay OpenAI đã công bố thông tin chi tiết về thế hệ AI mới với khả năng tính toán vượt bậc, mở ra kỷ nguyên ứng dụng thực tiễn trong công nghệ tự động hóa.</p>',
      suggestedCategory: 'Trí tuệ nhân tạo (AI)',
      tags: ['OpenAI', 'GPT-5', 'Trí tuệ nhân tạo'],
      factsToVerify: null,
      seoTitle: 'OpenAI ra mắt GPT-5 đột phá | Tin Công Nghệ',
      seoDescription: 'Khám phá bước tiến mới của GPT-5 với năng lực lập luận cao.',
    };

    const workingAiBinding = {
      run: async () => {
        return JSON.stringify(validAiResponse);
      },
    };

    const { draft, aiUsed } = await generateArticleDraft(item, workingAiBinding);

    expect(aiUsed).toBe(true);
    expect(draft.title).toBe(validAiResponse.title);
    expect(draft.suggestedCategory).toBe('Trí tuệ nhân tạo (AI)');
    expect(draft.tags).toContain('GPT-5');
  });
});
