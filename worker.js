export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/env') {
      return new Response(JSON.stringify({
        supabaseUrl: env.SUPABASE_URL || '',
        supabaseKey: env.SUPABASE_PUBLISHABLE_KEY || ''
      }), {
        headers: { "content-type": "application/json;charset=UTF-8" }
      });
    }
    if (url.pathname === '/api/upload' && request.method === 'PUT') {
      try {
        const uploadId = request.headers.get('X-Upload-Id');
        const chunkIndex = parseInt(request.headers.get('X-Chunk-Index'), 10);
        const totalChunks = parseInt(request.headers.get('X-Total-Chunks'), 10);
        const fileName = request.headers.get('X-File-Name');
        const authHeader = request.headers.get('Authorization');
        const contentType = request.headers.get('X-Content-Type');

        if (!uploadId || isNaN(chunkIndex) || isNaN(totalChunks) || !fileName || !authHeader) {
          return new Response(JSON.stringify({ error: 'Missing headers' }), { status: 400 });
        }

        const supabaseUrl = env.SUPABASE_URL;
        const supabaseKey = env.SUPABASE_PUBLISHABLE_KEY; // Em um cenário real seria melhor usar Service Role para upload, mas usaremos a pub key + auth token do usuário

        // Ler o chunk recebido
        const chunkData = await request.arrayBuffer();

        // 1. Salvar o chunk temporário
        const tempPath = `temp/${uploadId}/${chunkIndex}`;
        const tempUploadUrl = `${supabaseUrl}/storage/v1/object/firstappfiles/${tempPath}`;

        const uploadTempRes = await fetch(tempUploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': authHeader, // Auth do usuario
            'apikey': supabaseKey,
            'Content-Type': 'application/octet-stream'
          },
          body: chunkData
        });

        if (!uploadTempRes.ok) {
           const errText = await uploadTempRes.text();
           return new Response(JSON.stringify({ error: 'Failed to upload chunk', details: errText }), { status: 500 });
        }

        // Se for o último chunk, processa o arquivo final
        if (chunkIndex === totalChunks - 1) {
           // Baixa todos os chunks
           let finalArrayBuffer = new Uint8Array(0);

           for (let i = 0; i < totalChunks; i++) {
               const getChunkUrl = `${supabaseUrl}/storage/v1/object/authenticated/firstappfiles/temp/${uploadId}/${i}`;
               const chunkRes = await fetch(getChunkUrl, {
                  headers: {
                    'Authorization': authHeader,
                    'apikey': supabaseKey
                  }
               });

               if (!chunkRes.ok) {
                  return new Response(JSON.stringify({ error: 'Failed to retrieve chunk ' + i }), { status: 500 });
               }

               const chunkBytes = new Uint8Array(await chunkRes.arrayBuffer());
               const newFinalBuffer = new Uint8Array(finalArrayBuffer.length + chunkBytes.length);
               newFinalBuffer.set(finalArrayBuffer);
               newFinalBuffer.set(chunkBytes, finalArrayBuffer.length);
               finalArrayBuffer = newFinalBuffer;
           }

           // Faz o upload final
           const finalUploadUrl = `${supabaseUrl}/storage/v1/object/firstappfiles/${fileName}`;
           const finalRes = await fetch(finalUploadUrl, {
               method: 'POST',
               headers: {
                 'Authorization': authHeader,
                 'apikey': supabaseKey,
                 'Content-Type': contentType || 'application/octet-stream'
               },
               body: finalArrayBuffer
           });

           if (!finalRes.ok) {
               const errText = await finalRes.text();
               return new Response(JSON.stringify({ error: 'Failed final upload', details: errText }), { status: 500 });
           }

           // Tentar limpar chunks temporários (falha não deve quebrar)
           for (let i = 0; i < totalChunks; i++) {
               fetch(`${supabaseUrl}/storage/v1/object/firstappfiles/temp/${uploadId}/${i}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': authHeader, 'apikey': supabaseKey }
               }).catch(() => {});
           }

           return new Response(JSON.stringify({ final: true, path: `firstappfiles/${fileName}` }), {
               status: 200,
               headers: { "content-type": "application/json" }
           });
        }

        return new Response(JSON.stringify({ final: false }), {
           status: 200,
           headers: { "content-type": "application/json" }
        });

      } catch (err) {
         return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // Fallback para os assets estáticos
    return env.ASSETS.fetch(request);
  }
};
