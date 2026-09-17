# Public countdown idea submissions

The site now reads and writes public ideas through `/api/ideas`.

## Cloudflare Worker setup

1. Install Wrangler and log in:

   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Create the KV namespace:

   ```bash
   npx wrangler kv namespace create IDEAS
   ```

3. Replace `REPLACE_WITH_KV_NAMESPACE_ID` in `wrangler.toml` with the returned namespace ID.

4. Deploy the worker:

   ```bash
   npx wrangler deploy
   ```

5. Configure the Worker route or custom domain so the worker receives `/api/ideas` on the same domain as the site. If the site is deployed with Cloudflare Pages, configure `/api/*` to route to this Worker.

The Worker validates and limits submitted fields, but the endpoint is intentionally public. Add rate limiting, Turnstile, or moderation before using it for a high-traffic or untrusted audience.
