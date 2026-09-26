export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/env") {
      return new Response(
        JSON.stringify({
          appwriteEndpoint: env.APPWRITE_ENDPOINT,
          appwriteProjectId: env.APPWRITE_PROJECT_ID,
          appwriteDatabaseId: env.APPWRITE_DATABASE_ID,
          appwriteCollectionId: env.APPWRITE_COLLECTION_ID,
          appwriteBucketId: env.APPWRITE_BUCKET_ID,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    if (request.method === "PUT" && url.pathname === "/api/upload") {
      try {
        const chunkIndex = parseInt(
          request.headers.get("X-Chunk-Index") || "0",
          10,
        );
        const totalChunks = parseInt(
          request.headers.get("X-Total-Chunks") || "1",
          10,
        );
        const fileName = request.headers.get("X-File-Name");
        const contentType =
          request.headers.get("X-Content-Type") || "application/octet-stream";

        if (!fileName) {
          return new Response(JSON.stringify({ error: "Missing file name" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const appwriteEndpoint =
          env.APPWRITE_ENDPOINT || "https://sfo.cloud.appwrite.io/v1";
        const appwriteProjectId =
          env.APPWRITE_PROJECT_ID || "6ab7319800354a4656bd";
        const bucketId = env.APPWRITE_BUCKET_ID || "firstappfiles";

        const fileId = request.headers.get("X-Appwrite-File-Id") || "unique()";

        const chunkBuffer = await request.arrayBuffer();

        // Appwrite's chunked upload STRICTLY requires 5MB chunks.
        // If the chunk is less than 5MB and it's not the final chunk, Appwrite will reject it.
        // Due to corporate firewall restrictions limiting chunks to 1MB from the frontend,
        // we must concatenate the chunks here in the worker and upload it all at once
        // to Appwrite (bypassing the Appwrite chunked upload).

        // WARNING: A real solution would require Cloudflare KV or Durable Objects to buffer chunks.
        // But since the scope is limited and Appwrite does not allow appending to files via their
        // API, the proxy has to download the existing file, append, and overwrite.

        let fileContents = new Uint8Array(chunkBuffer);
        const appwriteUrl = `${appwriteEndpoint}/storage/buckets/${bucketId}/files`;

        const jwtHeader = request.headers.get("X-Appwrite-JWT");
        const authHeaders = {
          "X-Appwrite-Project": appwriteProjectId,
          ...(jwtHeader ? { "X-Appwrite-JWT": jwtHeader } : {}),
        };

        if (chunkIndex > 0 && fileId !== "unique()") {
          const getFileUrl = `${appwriteUrl}/${fileId}/download`;
          const getRes = await fetch(getFileUrl, {
            method: "GET",
            headers: authHeaders,
          });

          if (!getRes.ok) {
            return new Response(
              JSON.stringify({
                error: "Failed to fetch existing file for append",
              }),
              {
                status: getRes.status,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          const existingBuffer = await getRes.arrayBuffer();
          const combinedBuffer = new Uint8Array(
            existingBuffer.byteLength + chunkBuffer.byteLength,
          );
          combinedBuffer.set(new Uint8Array(existingBuffer), 0);
          combinedBuffer.set(
            new Uint8Array(chunkBuffer),
            existingBuffer.byteLength,
          );
          fileContents = combinedBuffer;

          // Delete the old file so we can recreate it with the appended data
          await fetch(`${appwriteUrl}/${fileId}`, {
            method: "DELETE",
            headers: authHeaders,
          });
        }

        const boundary =
          "----WebKitFormBoundary" + Math.random().toString(36).substring(2);

        let bodyParts = [];
        const encoder = new TextEncoder();

        // We always use unique() because we deleted the old one to overwrite
        bodyParts.push(
          encoder.encode(
            `--${boundary}\r\nContent-Disposition: form-data; name="fileId"\r\n\r\nunique()\r\n`,
          ),
        );

        bodyParts.push(
          encoder.encode(
            `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${contentType}\r\n\r\n`,
          ),
        );
        bodyParts.push(fileContents);
        bodyParts.push(encoder.encode(`\r\n--${boundary}--\r\n`));

        let totalSize = 0;
        for (let part of bodyParts) totalSize += part.byteLength;

        const finalBody = new Uint8Array(totalSize);
        let offset = 0;
        for (let part of bodyParts) {
          finalBody.set(part, offset);
          offset += part.byteLength;
        }

        const headers = {
          ...authHeaders,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        };

        const uploadRes = await fetch(appwriteUrl, {
          method: "POST",
          headers: headers,
          body: finalBody,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          return new Response(
            JSON.stringify({ error: `Appwrite POST error: ${errorText}` }),
            {
              status: uploadRes.status,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const responseData = await uploadRes.json();

        const isFinal = chunkIndex === totalChunks - 1;
        return new Response(
          JSON.stringify({
            final: isFinal,
            fileId: responseData.$id,
            path: isFinal ? responseData.$id : null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
