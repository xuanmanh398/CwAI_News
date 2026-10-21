// functions/[[path]].ts
// Cloudflare Pages Functions Entry Point

import { handle } from 'hono/cloudflare-pages';
import { createApp } from '../src/app.js';

const app = createApp();

export const onRequest = handle(app);
