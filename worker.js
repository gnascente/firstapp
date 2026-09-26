export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/env') {
      return new Response(JSON.stringify({
        supabaseUrl: env.SUPABASE_URL,
        supabaseKey: env.SUPABASE_PUBLISHABLE_KEY
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'PUT' && url.pathname === '/api/upload') {
      try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
          return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const chunkIndex = parseInt(request.headers.get('X-Chunk-Index') || '0', 10);
        const totalChunks = parseInt(request.headers.get('X-Total-Chunks') || '1', 10);
        const fileName = request.headers.get('X-File-Name');
        const contentType = request.headers.get('X-Content-Type') || 'application/octet-stream';

        if (!fileName) {
          return new Response(JSON.stringify({ error: 'Missing file name' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const supabaseUrl = env.SUPABASE_URL;
        const encodedFileName = encodeURIComponent(fileName);
        const bucketPath = `firstappfiles/${encodedFileName}`;
        const storageApiUrl = `${supabaseUrl}/storage/v1/object/${bucketPath}`;
        const storageDownloadUrl = `${supabaseUrl}/storage/v1/object/authenticated/${bucketPath}`;

        const chunkBuffer = await request.arrayBuffer();

        if (chunkIndex === 0) {
          // Upload the first chunk as a new file (or overwrite if exists)
          const uploadRes = await fetch(storageApiUrl, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': contentType,
              'x-upsert': 'true'
            },
            body: chunkBuffer
          });

          if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            return new Response(JSON.stringify({ error: `Supabase POST error: ${errorText}` }), { status: uploadRes.status, headers: { 'Content-Type': 'application/json' } });
          }
        } else {
          // Fetch existing file to append the chunk
          const getRes = await fetch(storageDownloadUrl, {
            method: 'GET',
            headers: {
              'Authorization': authHeader
            }
          });

          if (!getRes.ok) {
            return new Response(JSON.stringify({ error: 'Failed to fetch existing file for append' }), { status: getRes.status, headers: { 'Content-Type': 'application/json' } });
          }

          const existingBuffer = await getRes.arrayBuffer();

          // Concatenate existing buffer and new chunk buffer
          const combinedBuffer = new Uint8Array(existingBuffer.byteLength + chunkBuffer.byteLength);
          combinedBuffer.set(new Uint8Array(existingBuffer), 0);
          combinedBuffer.set(new Uint8Array(chunkBuffer), existingBuffer.byteLength);

          // Overwrite with the combined buffer
          const uploadRes = await fetch(storageApiUrl, {
            method: 'PUT',
            headers: {
              'Authorization': authHeader,
              'Content-Type': contentType,
              'x-upsert': 'true'
            },
            body: combinedBuffer
          });

          if (!uploadRes.ok) {
             const errorText = await uploadRes.text();
             return new Response(JSON.stringify({ error: `Supabase PUT error: ${errorText}` }), { status: uploadRes.status, headers: { 'Content-Type': 'application/json' } });
          }
        }

        const isFinal = chunkIndex === totalChunks - 1;
        return new Response(JSON.stringify({
          final: isFinal,
          path: isFinal ? bucketPath : null
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    return env.ASSETS.fetch(request);
  }
}
