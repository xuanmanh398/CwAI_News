// src/ingestion/categorizer.ts
// Automatic categorization for Vietnamese tech news articles

import { TechCategory } from '../types/index.js';
import { removeVietnameseDiacritics } from './deduplication.js';

interface CategoryRule {
  category: TechCategory;
  keywords: string[];
  weight: number;
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Trí tuệ nhân tạo (AI)',
    keywords: [
      'ai',
      'tri tue nhan tao',
      'chatgpt',
      'openai',
      'deepseek',
      'gemini',
      'claude',
      'llm',
      'machine learning',
      'hoc may',
      'generative ai',
      'copilot',
      'mo hinh ngon ngu',
      'tro ly ao',
      'robotics',
      'tri thong minh nhan tao',
      'anthropic',
      'midjourney',
      'sora',
    ],
    weight: 2,
  },
  {
    category: 'An ninh mạng',
    keywords: [
      'an ninh mang',
      'bao mat',
      'hacker',
      'tan cong mang',
      'ma doc',
      'malware',
      'ransomware',
      'lua dao mang',
      'lo hong',
      'lo hong bao mat',
      'ro ri du lieu',
      'dieu tra so',
      'mat khau',
      'phishing',
      'ddos',
      'trojan',
      'chiem quyen',
    ],
    weight: 2,
  },
  {
    category: 'Thiết bị',
    keywords: [
      'thiet bi',
      'smartphone',
      'dien thoai',
      'iphone',
      'ipad',
      'macbook',
      'laptop',
      'samsung',
      'galaxy',
      'xiaomi',
      'chip',
      'ban dan',
      'gpu',
      'cpu',
      'nvidia',
      'intel',
      'amd',
      'qualcomm',
      'snapdragon',
      'tai nghe',
      'dong ho thong minh',
      'smartwatch',
      'may tinh bang',
      'camera',
      'tv',
      'tivi',
      'man hinh',
    ],
    weight: 1.5,
  },
  {
    category: 'Phần mềm',
    keywords: [
      'phan mem',
      'ung dung',
      'app',
      'ios',
      'android',
      'windows',
      'macos',
      'linux',
      'trinh duyet',
      'chrome',
      'safari',
      'firefox',
      'cap nhat phan mem',
      'ban cap nhat',
      'zalo',
      'tiktok',
      'facebook',
      'youtube',
      'telegram',
      'lap trinh',
      'ma nguon mo',
      'developer',
    ],
    weight: 1.2,
  },
  {
    category: 'Công nghệ mới',
    keywords: [
      'cong nghe moi',
      'startup',
      'so hoa',
      'chuyen doi so',
      'vien thong',
      'mang 5g',
      '6g',
      'blockchain',
      'xe dien',
      'tesla',
      'vinfast',
      'hang khong vu tru',
      've tinh',
      'nang luong xanh',
      'iot',
    ],
    weight: 1.0,
  },
];

export function categorizeArticle(
  title: string,
  description: string = '',
  sourceCategoryHint?: string
): TechCategory {
  const textToScan = `${title} ${description} ${sourceCategoryHint || ''}`;
  const normalized = removeVietnameseDiacritics(textToScan).toLowerCase();

  let bestCategory: TechCategory = 'Công nghệ mới';
  let maxScore = 0;

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      // Word boundary regex for accurate match
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      const matches = normalized.match(regex);
      if (matches) {
        score += matches.length * rule.weight;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestCategory = rule.category;
    }
  }

  return bestCategory;
}
