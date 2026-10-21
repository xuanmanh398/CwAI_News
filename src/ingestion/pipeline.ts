// src/ingestion/pipeline.ts
// RSS ingestion pipeline with anti-duplicate, AI drafting, and safe pending queueing

import { Env, Feed, IngestionRun } from '../types/index.js';
import { fetchAndParseFeed } from './rss-parser.js';
import {
  normalizeUrl,
  normalizeTitleForDeduplication,
  computeSha256,
  generateSlug,
} from './deduplication.js';
import { generateArticleDraft } from '../ai/drafting.js';

export interface IngestionResult {
  runId: string;
  startedAt: string;
  completedAt: string;
  status: 'success' | 'failed' | 'skipped';
  message?: string;
  feedsProcessed: number;
  fetchedCount: number;
  insertedCount: number;
  duplicateCount: number;
  errorCount: number;
  errors: Array<{ feedName: string; error: string }>;
}

export async function runIngestionPipeline(
  env: Env,
  options: { maxItemsPerFeed?: number; forced?: boolean; actor?: string } = {}
): Promise<IngestionResult> {
  const { maxItemsPerFeed = 5, forced = false, actor = 'system' } = options;
  const startedAt = new Date().toISOString();
  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Concurrency Lock check: avoid running overlapping pipelines
  if (!forced) {
    const activeRun = await env.DB.prepare(
      `SELECT id, started_at FROM ingestion_runs 
       WHERE status = 'running' 
       ORDER BY started_at DESC LIMIT 1`
    ).first<{ id: string; started_at: string }>();

    if (activeRun) {
      const runStart = new Date(activeRun.started_at).getTime();
      const now = Date.now();
      // If run is younger than 5 minutes, consider it still executing
      if (now - runStart < 5 * 60 * 1000) {
        return {
          runId,
          startedAt,
          completedAt: new Date().toISOString(),
          status: 'skipped',
          message: 'Một tiến trình lấy tin RSS đang chạy. Vui lòng chờ vài phút.',
          feedsProcessed: 0,
          fetchedCount: 0,
          insertedCount: 0,
          duplicateCount: 0,
          errorCount: 0,
          errors: [],
        };
      }
    }
  }

  // 2. Insert ingestion_runs record
  await env.DB.prepare(
    `INSERT INTO ingestion_runs (id, started_at, status, fetched_count, inserted_count, duplicate_count, error_count)
     VALUES (?, ?, 'running', 0, 0, 0, 0)`
  )
    .bind(runId, startedAt)
    .run();

  // 3. Fetch enabled feeds
  const feedsResult = await env.DB.prepare(
    `SELECT * FROM feeds WHERE enabled = 1 ORDER BY created_at ASC`
  ).all<Feed>();
  const feeds = feedsResult.results || [];

  let totalFetched = 0;
  let totalInserted = 0;
  let totalDuplicates = 0;
  let totalErrors = 0;
  const errorDetails: Array<{ feedName: string; error: string }> = [];

  for (const feed of feeds) {
    const nowIso = new Date().toISOString();
    const fetchRes = await fetchAndParseFeed(feed.feed_url, {
      maxItems: maxItemsPerFeed,
      timeoutMs: 10000,
    });

    if (!fetchRes.success) {
      totalErrors++;
      errorDetails.push({ feedName: feed.name, error: fetchRes.error || 'Lỗi không xác định' });

      await env.DB.prepare(
        `UPDATE feeds SET last_checked_at = ?, last_error = ? WHERE id = ?`
      )
        .bind(nowIso, fetchRes.error || 'Fetch failed', feed.id)
        .run();
      continue;
    }

    // Update feed success status
    await env.DB.prepare(
      `UPDATE feeds SET last_checked_at = ?, last_success_at = ?, last_error = NULL WHERE id = ?`
    )
      .bind(nowIso, nowIso, feed.id)
      .run();

    totalFetched += fetchRes.items.length;

    for (const item of fetchRes.items) {
      try {
        item.title = item.title.normalize('NFC').trim();
        item.description = item.description.normalize('NFC').trim();

        // Freshness Check: Only ingest fresh news (published within last 48 hours)
        let sourcePubIso: string | null = null;
        if (item.pubDate) {
          const parsedDate = new Date(item.pubDate);
          if (!isNaN(parsedDate.getTime())) {
            const ageHours = (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60);
            if (ageHours > 48) {
              // Skip old articles to only keep fresh, current tech news
              continue;
            }
            sourcePubIso = parsedDate.toISOString();
          }
        }

        const canonicalUrl = normalizeUrl(item.link);
        const normTitle = normalizeTitleForDeduplication(item.title);
        const contentHash = await computeSha256(normTitle);

        // Check for duplicates by URL
        const existingByUrl = await env.DB.prepare(
          `SELECT id FROM articles WHERE source_url = ? LIMIT 1`
        )
          .bind(canonicalUrl)
          .first<{ id: string }>();

        if (existingByUrl) {
          totalDuplicates++;
          continue;
        }

        // Check for duplicates by content/title hash
        const existingByHash = await env.DB.prepare(
          `SELECT id FROM articles WHERE content_hash = ? LIMIT 1`
        )
          .bind(contentHash)
          .first<{ id: string }>();

        if (existingByHash) {
          totalDuplicates++;
          continue;
        }

        // Generate AI draft or fallback draft
        const { draft, aiUsed } = await generateArticleDraft(
          {
            title: item.title,
            description: item.description,
            content: item.content,
            link: canonicalUrl,
            sourceName: feed.name,
            sourceCategoryHint: feed.category,
          },
          env.AI,
          env.AI_MODEL
        );

        // Generate unique slug
        const uniqueSuffix = Math.random().toString(36).substring(2, 8);
        const slug = generateSlug(draft.title, uniqueSuffix);
        const articleId = `art_${Date.now()}_${uniqueSuffix}`;
        const itemCreatedIso = new Date().toISOString();

        // Insert new article strictly with status = 'pending'
        await env.DB.prepare(
          `INSERT INTO articles (
            id, slug, title, original_title, excerpt, content, category, tags,
            source_name, source_url, source_published_at, created_at, updated_at,
            published_at, status, content_hash, ai_generated, reviewed_by,
            seo_title, seo_description, facts_to_verify
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'pending', ?, ?, NULL, ?, ?, ?)`
        )
          .bind(
            articleId,
            slug,
            draft.title,
            item.title,
            draft.excerpt,
            draft.content,
            draft.suggestedCategory,
            JSON.stringify(draft.tags),
            feed.name,
            canonicalUrl,
            sourcePubIso,
            itemCreatedIso,
            itemCreatedIso,
            contentHash,
            aiUsed ? 1 : 0,
            draft.seoTitle,
            draft.seoDescription,
            draft.factsToVerify || null
          )
          .run();

        totalInserted++;
      } catch (itemErr: any) {
        totalErrors++;
        errorDetails.push({
          feedName: feed.name,
          error: `Lỗi xử lý bài "${item.title.slice(0, 30)}": ${itemErr.message || String(itemErr)}`,
        });
      }
    }
  }

  const completedAt = new Date().toISOString();
  const logSummary = `Thu nạp: ${totalFetched} bài, Thêm mới: ${totalInserted} bản nháp (pending), Trùng lặp: ${totalDuplicates}, Lỗi: ${totalErrors}`;

  // 4. Update ingestion_runs record
  await env.DB.prepare(
    `UPDATE ingestion_runs 
     SET completed_at = ?, status = 'success', fetched_count = ?, inserted_count = ?, duplicate_count = ?, error_count = ?, log_summary = ?
     WHERE id = ?`
  )
    .bind(
      completedAt,
      totalFetched,
      totalInserted,
      totalDuplicates,
      totalErrors,
      logSummary,
      runId
    )
    .run();

  // 5. Audit log
  await env.DB.prepare(
    `INSERT INTO audit_logs (id, actor, action, article_id, created_at, metadata)
     VALUES (?, ?, 'fetch_rss', NULL, ?, ?)`
  )
    .bind(
      `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actor,
      completedAt,
      JSON.stringify({
        runId,
        totalFetched,
        totalInserted,
        totalDuplicates,
        totalErrors,
      })
    )
    .run();

  return {
    runId,
    startedAt,
    completedAt,
    status: 'success',
    feedsProcessed: feeds.length,
    fetchedCount: totalFetched,
    insertedCount: totalInserted,
    duplicateCount: totalDuplicates,
    errorCount: totalErrors,
    errors: errorDetails,
  };
}
