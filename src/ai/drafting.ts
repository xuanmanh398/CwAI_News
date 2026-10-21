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

const SYSTEM_PROMPT = `Bạn là Tổng biên tập và Chuyên gia Phân tích Công nghệ cao cấp cho chuyên trang "Tin Tức Việt".
Nhiệm vụ của bạn là đọc thông tin, tiêu đề và trích đoạn từ nguồn tin, sau đó biên soạn một bài báo công nghệ tiếng Việt ĐẦY ĐỦ, CHUYÊN SÂU, HẤP DẪN và THỰC SỰ HỮU ÍCH cho độc giả Việt Nam.

QUY TẮC BẮT BUỘC VỀ VĂN PHONG VÀ NGÔN NGỮ:
1. VIẾT 100% TIẾNG VIỆT: Tuyệt đối không để nguyên văn tiếng Anh ở tiêu đề hay các đoạn văn (trừ tên thương hiệu, tên riêng như Apple, Microsoft, Google, OpenAI, chip M4...). Nếu nguồn gốc là tiếng Anh, BẮT BUỘC DỊCH THUẬT VÀ VIỆT HÓA HOÀN TOÀN sang tiếng Việt tự nhiên, gãy gọn, chuẩn xác.
2. TIÊU ĐỀ (title): Viết lại bằng tiếng Việt hấp dẫn, mang tính thông tấn chuyên nghiệp, chuẩn mực (Ví dụ: "Hệ điều hành ReactOS đạt cột mốc mới khi hỗ trợ cài đặt trên định dạng NTFS" thay vì để tiếng Anh).
3. SAPO (excerpt): Viết 2-3 câu súc tích, nêu bật bản chất sự kiện và giá trị thực tế của công nghệ.
4. THÂN BÀI (content): PHẢI DÀI VÀ CÓ CHIỀU SÂU (tối thiểu 400 - 800 từ). Sử dụng các thẻ HTML an toàn: <p>, <h3>, <ul>, <li>, <strong>, <em>, <blockquote>.
   Bài viết phải có bố cục chặt chẽ gồm 3-4 phần lớn:
   - Đoạn mở đầu: Bối cảnh sự việc và bản chất của công nghệ/sản phẩm mới.
   - <h3>Chi tiết kỹ thuật và những điểm nâng cấp đáng chú ý</h3>: Trình bày chi tiết, các ưu điểm, cách thức hoạt động hoặc thông số quan trọng dưới dạng đoạn văn và gạch đầu dòng <ul><li>.
   - <h3>Tác động đối với hệ sinh thái và người dùng</h3>: Phân tích xem bước tiến này mang lại lợi ích gì cho lập trình viên, doanh nghiệp hoặc người dùng cuối tại Việt Nam.
   - <h3>Đánh giá và triển vọng tương lai</h3>: Nhận định chuyên môn về xu hướng tiếp theo, những điều người dùng cần lưu ý hoặc mốc phát hành chính thức.
5. Tuyệt đối không bịa đặt số liệu sai lệch ngoài nội dung được cung cấp. Bổ sung bối cảnh kiến thức công nghệ nền tảng để bài viết đọc mượt mà và thực sự hữu ích như phóng viên công nghệ lâu năm chấp bút.
6. Đề xuất đúng 1 chuyên mục trong 5 chuyên mục: "Trí tuệ nhân tạo (AI)", "Phần mềm", "An ninh mạng", "Thiết bị", "Công nghệ mới".
7. BẮT BUỘC TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON HỢP LỆ:
{
  "title": "Tiêu đề tiếng Việt hoàn chỉnh",
  "excerpt": "Sapo tóm tắt tiếng Việt",
  "content": "Thân bài chi tiết bằng HTML tiếng Việt",
  "suggestedCategory": "Trí tuệ nhân tạo (AI)" | "Phần mềm" | "An ninh mạng" | "Thiết bị" | "Công nghệ mới",
  "tags": ["Từ khóa 1", "Từ khóa 2"],
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
  const cleanDesc = item.description.trim() || 'Thông tin chi tiết về sự kiện công nghệ đang được theo dõi và cập nhật.';

  const tags = [category, item.sourceName.trim(), 'Công nghệ'].filter(Boolean);

  const safeContent = `
<p class="lead"><strong>${escapeHtml(cleanDesc)}</strong></p>

<p>Sự kiện công nghệ mới nhất từ <strong>${escapeHtml(item.sourceName)}</strong> đang thu hút sự quan tâm lớn của cộng đồng công nghệ trong chuyên mục <em>${escapeHtml(category)}</em>.</p>

<h3>Chi tiết và bối cảnh phát triển</h3>
<p>Trong bối cảnh thị trường công nghệ số đang chứng kiến nhiều chuyển biến mạnh mẽ, thông tin ghi nhận về <strong>${escapeHtml(cleanTitle)}</strong> đem đến nhiều tín hiệu đáng chú ý cho cả giới chuyên môn lẫn người dùng nói chung. Các chuyên gia đánh giá đây là bước đi tiếp theo trong chuỗi hoàn thiện giải pháp và nâng cao trải nghiệm ứng dụng thực tiễn.</p>

<h3>Tác động và giá trị thực tế</h3>
<p>Đối với hệ sinh thái công nghệ, những bước tiến liên quan đến lĩnh vực này mang lại nhiều lợi thế rõ rệt:</p>
<ul>
  <li><strong>Tối ưu hóa hiệu năng:</strong> Cải thiện khả năng tương thích và độ ổn định của hệ thống trong môi trường vận hành thực tế.</li>
  <li><strong>Mở rộng tính ứng dụng:</strong> Giúp người dùng và doanh nghiệp tiếp cận các công nghệ tiên tiến một cách thuận tiện hơn.</li>
  <li><strong>Thúc đẩy đổi mới:</strong> Tạo tiền đề cho các bản cập nhật và tính năng nâng cấp tiếp theo trong lộ trình phát triển.</li>
</ul>

<h3>Đánh giá và triển vọng</h3>
<p>Việc theo dõi sát sao các bước phát triển này sẽ giúp người yêu công nghệ tại Việt Nam chủ động nắm bắt xu thế, từ đó có những giải pháp ứng dụng phù hợp trong công việc và đời sống số hàng ngày.</p>
  `.trim();

  return {
    title: cleanTitle,
    excerpt: cleanDesc.slice(0, 300),
    content: sanitizeHtmlContent(safeContent),
    suggestedCategory: category,
    tags,
    factsToVerify: `Cần xác minh và đối chiếu dữ liệu gốc từ ${item.sourceName}. Biên tập viên có thể bổ sung thêm hình ảnh minh họa hoặc chi tiết kỹ thuật chuyên sâu nếu cần.`,
    seoTitle: `${cleanTitle.slice(0, 60)} | Tin Tức Việt`,
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
      max_tokens: 3000,
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
