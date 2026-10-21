// src/ai/drafting.ts
// AI drafting pipeline with Zod schema validation and zero-cost fallback mode

import { z } from 'zod';
import { AiDraftOutput, TechCategory } from '../types/index.js';
import { categorizeArticle } from '../ingestion/categorizer.js';
import { sanitizeHtmlContent, escapeHtml } from '../security/sanitize.js';

// Schema for AI JSON response validation
export const AiDraftResponseSchema = z.object({
  title: z.string().min(10).max(200),
  excerpt: z.string().min(20).max(500),
  content: z.string().min(100),
  suggestedCategory: z.enum([
    'Trí tuệ nhân tạo (AI)',
    'Phần mềm',
    'An ninh mạng',
    'Thiết bị',
    'Công nghệ mới',
  ]),
  tags: z.array(z.string()).min(1).max(10),
  factsToVerify: z.string().nullable().optional(),
  seoTitle: z.string().min(10).max(120),
  seoDescription: z.string().min(30).max(200),
});

const SYSTEM_PROMPT = `Bạn là Trợ lý Biên tập viên Công nghệ cao cấp cho chuyên trang "Tin Công Nghệ" (Việt Nam).
Nhiệm vụ của bạn là đọc thông tin tóm tắt và metadata từ bản tin gốc, sau đó biên soạn một bản nháp tin tức công nghệ tiếng Việt chuẩn mực báo chí.

QUY TẮC BẮT BUỘC:
1. Viết tiếng Việt tự nhiên, gãy gọn, khách quan, chuẩn ngữ pháp báo chí.
2. Tiêu đề mới (title): Hấp dẫn, chính xác, TUYỆT ĐỐI không bóp méo sự kiện, không giật tít sai sự thật.
3. Sapo (excerpt): Tóm tắt 2-3 câu ngắn nêu bật thông điệp quan trọng nhất.
4. Thân bài (content): Định dạng bằng các thẻ HTML an toàn (<p>, <h3>, <ul>, <li>, <strong>, <em>, <blockquote>). Chia thành các đoạn rõ ràng:
   - Diễn biến sự kiện chính.
   - Bối cảnh và ý nghĩa đối với thị trường hoặc người dùng công nghệ Việt Nam.
   - Các điểm cần lưu ý hoặc mốc thời gian tiếp theo (nếu có).
5. TUYỆT ĐỐI KHÔNG bịa đặt số liệu, phát ngôn, tên nhân vật, ngày tháng không có trong nguồn cung cấp.
6. Nếu dữ kiện trong nguồn quá ngắn hoặc có điểm chưa rõ ràng, BẮT BUỘC ghi vào trường "factsToVerify" để nhắc biên tập viên người thật kiểm chứng trước khi duyệt.
7. Đề xuất đúng 1 chuyên mục trong 5 chuyên mục: "Trí tuệ nhân tạo (AI)", "Phần mềm", "An ninh mạng", "Thiết bị", "Công nghệ mới".
8. Cung cấp danh sách 3-6 từ khóa tags, seoTitle (< 70 ký tự), và seoDescription (< 160 ký tự).
9. BẮT BUỘC TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON HỢP LỆ, KHÔNG KÈM THEO BẤT KỲ VĂN BẢN NÀO KHÁC NGOÀI JSON:
{
  "title": "string",
  "excerpt": "string",
  "content": "string (html)",
  "suggestedCategory": "Trí tuệ nhân tạo (AI)" | "Phần mềm" | "An ninh mạng" | "Thiết bị" | "Công nghệ mới",
  "tags": ["tag1", "tag2"],
  "factsToVerify": "string hoặc null",
  "seoTitle": "string",
  "seoDescription": "string"
}`;

/**
 * Creates an editorial fallback draft directly from source metadata when AI is unavailable or rate-limited.
 */
export function createMetadataFallbackDraft(item: {
  title: string;
  description: string;
  link: string;
  sourceName: string;
  sourceCategoryHint?: string;
}): AiDraftOutput {
  const category = categorizeArticle(item.title, item.description, item.sourceCategoryHint);
  const cleanTitle = item.title.trim();
  const cleanDesc = item.description.trim() || 'Thông tin chi tiết đang được cập nhật từ nguồn gốc.';

  const tags = [category, item.sourceName.trim(), 'Công nghệ'].filter(Boolean);

  const safeContent = `
<p class="lead"><strong>${escapeHtml(cleanDesc)}</strong></p>
<p>Bản ghi nhận thông tin nhanh từ nguồn <strong>${escapeHtml(item.sourceName)}</strong> liên quan đến chủ đề <em>${escapeHtml(category)}</em>.</p>
<h3>Bối cảnh sự kiện</h3>
<p>Thông tin ghi nhận ban đầu cho thấy sự kiện này đang thu hút sự chú ý trong giới công nghệ. Biên tập viên của chuyên trang Tin Công Nghệ đang tiếp tục theo dõi các tài liệu kỹ thuật và thông cáo báo chí chính thức để hoàn thiện nội dung phân tích chi tiết.</p>
<div class="editorial-notice-box">
  <p><strong>Ghi chú biên tập:</strong> Bản nháp này được khởi tạo tự động từ metadata nguồn công khai do hệ thống AI đang ở chế độ dự phòng hoặc chưa kích hoạt. Quản trị viên vui lòng đối chiếu bài viết gốc tại <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.sourceName)}</a> trước khi xuất bản.</p>
</div>
  `.trim();

  return {
    title: cleanTitle,
    excerpt: cleanDesc.slice(0, 300),
    content: sanitizeHtmlContent(safeContent),
    suggestedCategory: category,
    tags,
    factsToVerify: `Cần xác minh dữ liệu đầy đủ từ bài gốc (${item.sourceName}) trước khi phê duyệt xuất bản.`,
    seoTitle: `${cleanTitle.slice(0, 60)} | Tin Công Nghệ`,
    seoDescription: cleanDesc.slice(0, 155),
  };
}

/**
 * Generates an article draft using Cloudflare Workers AI with fallback to metadata-based draft
 */
export async function generateArticleDraft(
  item: {
    title: string;
    description: string;
    content?: string;
    link: string;
    sourceName: string;
    sourceCategoryHint?: string;
  },
  aiBinding?: {
    run: (model: string, inputs: Record<string, unknown>) => Promise<any>;
  },
  aiModel: string = '@cf/meta/llama-3.1-8b-instruct'
): Promise<{ draft: AiDraftOutput; aiUsed: boolean }> {
  // If AI binding is not provided, immediately return robust fallback
  if (!aiBinding || typeof aiBinding.run !== 'function') {
    return {
      draft: createMetadataFallbackDraft(item),
      aiUsed: false,
    };
  }

  const userPrompt = `
Tiêu đề gốc: ${item.title}
Nguồn tin: ${item.sourceName}
URL gốc: ${item.link}
Tóm tắt từ nguồn: ${item.description || 'Không có mô tả'}
${item.content ? `Nội dung trích đoạn: ${item.content.slice(0, 1500)}` : ''}

Hãy biên soạn bản nháp tin tức theo đúng định dạng JSON yêu cầu.
  `.trim();

  try {
    const aiResponse = await aiBinding.run(aiModel, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const rawText =
      typeof aiResponse === 'string'
        ? aiResponse
        : aiResponse?.response || aiResponse?.result?.response || JSON.stringify(aiResponse);

    // Extract JSON block from potential markdown code fences ```json ... ```
    let jsonStr = rawText.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonStr = jsonMatch[1].trim();
    } else {
      // Find outermost braces
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
      }
    }

    const parsedJson = JSON.parse(jsonStr);
    const validated = AiDraftResponseSchema.parse(parsedJson);

    // Sanitize HTML content to prevent XSS injection
    validated.content = sanitizeHtmlContent(validated.content);

    return {
      draft: {
        ...validated,
        factsToVerify: validated.factsToVerify || null,
      },
      aiUsed: true,
    };
  } catch (err: any) {
    // If AI fails, fallback safely to metadata draft
    console.warn(`[AI Draft Fallback] Lỗi Workers AI: ${err.message || String(err)}. Chuyển sang fallback metadata.`);
    return {
      draft: createMetadataFallbackDraft(item),
      aiUsed: false,
    };
  }
}
