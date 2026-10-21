// worker-cron/index.ts
// Standalone Cloudflare Worker for scheduled Cron Triggers

export interface Env {
  PAGES_API_URL: string; // e.g. "https://tincongnghe.pages.dev/api/cron/ingest"
  CRON_SECRET: string;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const url = env.PAGES_API_URL || 'https://tincongnghe.pages.dev/api/cron/ingest';
    const secret = env.CRON_SECRET;

    console.log(`[Cron Trigger] Bắt đầu kích hoạt RSS ingestion tại ${url}...`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secret}`,
          'User-Agent': 'Cloudflare-Worker-Cron-Scheduler/1.0',
        },
      });

      const data = await response.json();
      console.log('[Cron Trigger Result]', JSON.stringify(data));
    } catch (err: any) {
      console.error('[Cron Trigger Error]', err.message || String(err));
    }
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    return new Response('Tin Cong Nghe Cron Worker is active.', { status: 200 });
  },
};
