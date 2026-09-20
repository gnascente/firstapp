export async function onRequest(context) {
  // context.env contém as variáveis de ambiente fornecidas pelo Cloudflare
  const supabaseUrl = context.env.SUPABASE_URL || '';
  const supabaseKey = context.env.SUPABASE_PUBLISHABLE_KEY || '';

  return new Response(JSON.stringify({
    supabaseUrl,
    supabaseKey
  }), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  });
}
