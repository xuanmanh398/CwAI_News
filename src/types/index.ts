// src/types/index.ts

export type ArticleStatus = 'pending' | 'published' | 'rejected';

export type TechCategory =
  | 'Trí tuệ nhân tạo (AI)'
  | 'Phần mềm'
  | 'An ninh mạng'
  | 'Thiết bị'
  | 'Công nghệ mới';

export interface Article {
  id: string;
  slug: string;
  title: string;
  original_title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string; // JSON string of string[]
  source_name: string;
  source_url: string;
  source_published_at: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  status: ArticleStatus;
  content_hash: string;
  ai_generated: number; // 1 or 0
  reviewed_by: string | null;
  seo_title: string | null;
  seo_description: string | null;
  facts_to_verify: string | null;
}

export interface Feed {
  id: string;
  name: string;
  feed_url: string;
  category: string;
  enabled: number; // 1 or 0
  last_checked_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  created_at: string;
}

export interface IngestionRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'success' | 'failed';
  fetched_count: number;
  inserted_count: number;
  duplicate_count: number;
  error_count: number;
  log_summary: string | null;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  article_id: string | null;
  created_at: string;
  metadata: string | null;
}

export interface ParsedFeedItem {
  title: string;
  link: string;
  description: string;
  content?: string;
  pubDate?: string;
  guid?: string;
  categories?: string[];
}

export interface AiDraftOutput {
  title: string;
  excerpt: string;
  content: string;
  suggestedCategory: TechCategory;
  tags: string[];
  factsToVerify: string | null;
  seoTitle: string;
  seoDescription: string;
}

export interface Env {
  DB: D1Database;
  AI?: {
    run: (model: string, inputs: Record<string, unknown>) => Promise<any>;
  };
  SITE_NAME?: string;
  SITE_DESCRIPTION?: string;
  CANONICAL_ORIGIN?: string;
  ADMIN_TOKEN?: string;
  ADMIN_SESSION_SECRET?: string;
  CRON_SECRET?: string;
  AI_MODEL?: string;
  FALLBACK_TO_METADATA?: string;
  ADSENSE_ENABLED?: string;
  ADSENSE_CLIENT?: string;
}
