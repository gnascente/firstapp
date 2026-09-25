export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/env') {
      return new Response(JSON.stringify({
        supabaseUrl: env.SUPABASE_URL,
        supabaseKey: env.SUPABASE_PUBLISHABLE_KEY
      }), { headers: { 'Content-Type': 'application/json' } });
    }
    return env.ASSETS.fetch(request);
  }
}
