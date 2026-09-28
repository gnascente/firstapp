import { drizzle } from "drizzle-orm/d1";
import { eq, inArray } from "drizzle-orm";
import { entities, logs } from "./db/schema";

export interface Env {
  DB: D1Database;
  MY_BUCKET: R2Bucket;
  ASSETS: { fetch: typeof fetch };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // API Routes
    if (url.pathname.startsWith("/api/")) {
      const db = drizzle(env.DB);

      // Handle Backup/Sync endpoints
      if (url.pathname.startsWith("/api/backup")) {
        const urlParams = new URL(request.url).searchParams;

        if (request.method === "GET") {
          const action = urlParams.get("action");

          if (action === "masterDate") {
            try {
              const masterObject = await env.MY_BUCKET.get("master_backup.json");
              if (masterObject) {
                const data: any = await masterObject.json();
                return new Response(JSON.stringify({ uploadedAt: data.uploadedAt }), { headers: { "Content-Type": "application/json" } });
              }
              return new Response(JSON.stringify({ uploadedAt: null }), { headers: { "Content-Type": "application/json" } });
            } catch (e: any) {
              return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
            }
          }

          if (action === "index") {
            try {
              const allEntities = await db.select({ id: entities.id, updatedAt: entities.updatedAt }).from(entities);
              const allLogs = await db.select({ id: logs.id, updatedAt: logs.updatedAt }).from(logs);
              return new Response(JSON.stringify({ entities: allEntities, logs: allLogs }), { headers: { "Content-Type": "application/json" } });
            } catch (error: any) {
              return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
            }
          }
        }

        if (request.method === "POST") {
          const action = urlParams.get("action");

          if (action === "uploadChunk") {
             const filename = urlParams.get("filename");
             if (!filename) return new Response("Filename missing", { status: 400 });
             try {
                const bodyStr = await request.text();
                await env.MY_BUCKET.put(filename, bodyStr, { httpMetadata: { contentType: "application/json" } });
                const publicUrl = `/files/${filename}`; // Return standard local path, which will be fetched locally via /files/ route
                return new Response(JSON.stringify({ success: true, url: publicUrl }), { headers: { "Content-Type": "application/json" } });
             } catch(e: any) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500 });
             }
          }

          let body: any;
          try {
             body = await request.json();
          } catch(e) { body = {}; }

          if (body.action === "startSync") {
             // In a robust implementation, you might implement locking logic via D1 here
             return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
          }

          if (body.action === "cleanup") {
             return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
          }

          if (body.action === "finalizeSync") {
             try {
               const { toDownloadIds, uploadedPartUrls } = body;

               // 1. Process uploaded chunks (client -> server)
               if (uploadedPartUrls && uploadedPartUrls.length > 0) {
                 for (const url of uploadedPartUrls) {
                   const fileName = url.replace("/files/", "");
                   const chunkObject = await env.MY_BUCKET.get(fileName);
                   if (chunkObject) {
                                          const chunkData: any = await chunkObject.json();
                     await env.MY_BUCKET.delete(fileName);

                     // Save Entities to D1
                     if (chunkData.entities && chunkData.entities.length > 0) {
                        for (const entity of chunkData.entities) {
                          const existing = await db.select().from(entities).where(eq(entities.id, entity.id)).get();
                          if (existing) {
                            if (entity.updatedAt > existing.updatedAt) {
                              await db.update(entities).set({
                                type: entity.type,
                                name: entity.name,
                                parentId: entity.parentId,
                                isDeleted: entity.isDeleted || false,
                                updatedAt: entity.updatedAt
                              }).where(eq(entities.id, entity.id));
                            }
                          } else {
                            await db.insert(entities).values({
                                id: entity.id,
                                type: entity.type,
                                name: entity.name,
                                parentId: entity.parentId,
                                createdAt: entity.createdAt || entity.updatedAt || Date.now(),
                                updatedAt: entity.updatedAt || Date.now(),
                                isDeleted: entity.isDeleted || false
                            });
                          }
                        }
                     }

                     // Save Logs to D1 (handling images)
                     if (chunkData.logs && chunkData.logs.length > 0) {
                        for (const log of chunkData.logs) {
                          // Extract base64 images and upload to bucket
                          if (log.images && Array.isArray(log.images)) {
                            for (let i = 0; i < log.images.length; i++) {
                              let img = log.images[i];
                              if (img.data && img.data.startsWith('data:')) {
                                  const matches = img.data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*?,(.*)$/);
                                  if (matches && matches.length === 3) {
                                      const extMap: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'application/pdf': 'pdf', 'video/webm': 'webm' };
                                      const ext = extMap[matches[1]] || 'bin';
                                      const uniqueName = `media_${log.id}_${i}_${Date.now()}.${ext}`;

                                      const binaryString = atob(matches[2]);
                                      const len = binaryString.length;
                                      const bytes = new Uint8Array(len);
                                      for (let j = 0; j < len; j++) bytes[j] = binaryString.charCodeAt(j);

                                      await env.MY_BUCKET.put(uniqueName, bytes, { httpMetadata: { contentType: matches[1] } });
                                      img.data = `/files/${uniqueName}`;
                                  }
                              }                                                            // Handle thumbnail if video
                              if (img.thumbnail && img.thumbnail.startsWith('data:')) {
                                  const matches = img.thumbnail.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*?,(.*)$/);
                                  if (matches && matches.length === 3) {
                                      const ext = 'jpg';
                                      const uniqueName = `thumb_${log.id}_${i}_${Date.now()}.${ext}`;
                                      const binaryString = atob(matches[2]);
                                      const len = binaryString.length;
                                      const bytes = new Uint8Array(len);
                                      for (let j = 0; j < len; j++) bytes[j] = binaryString.charCodeAt(j);
                                      await env.MY_BUCKET.put(uniqueName, bytes, { httpMetadata: { contentType: matches[1] } });
                                      img.thumbnail = `/files/${uniqueName}`;
                                  }
                              }
                            }
                          }

                          const imagesStr = log.images ? JSON.stringify(log.images) : '[]';
                          const relatedStr = log.relatedEntities ? JSON.stringify(log.relatedEntities) : '[]';

                          const existing = await db.select().from(logs).where(eq(logs.id, log.id)).get();
                          if (existing) {
                            if (log.updatedAt > existing.updatedAt) {
                              await db.update(logs).set({
                                text: log.text,
                                images: imagesStr,
                                relatedEntities: relatedStr,
                                originEntityId: log.originEntityId,
                                groupId: log.groupId,
                                authorName: log.authorName,
                                isDeleted: log.isDeleted || false,
                                updatedAt: log.updatedAt
                              }).where(eq(logs.id, log.id));
                            }
                          } else {
                            await db.insert(logs).values({
                                id: log.id,
                                text: log.text,
                                images: imagesStr,
                                relatedEntities: relatedStr,
                                originEntityId: log.originEntityId,
                                groupId: log.groupId,
                                authorName: log.authorName,
                                createdAt: log.createdAt || log.updatedAt || Date.now(),
                                updatedAt: log.updatedAt || Date.now(),
                                isDeleted: log.isDeleted || false
                            });
                          }
                        }
                     }
                   }
                 }
               }

               // 2. Fetch requested items (server -> client)
               let resEntities: any[] = [];
               let resLogs: any[] = [];

               if (toDownloadIds) {
                 if (toDownloadIds.entities && toDownloadIds.entities.length > 0) {
                     // Since D1 limit on inArray is 100, we might need chunking in a massive scale app, but this is fine for now
                     const eData = await db.select().from(entities).where(inArray(entities.id, toDownloadIds.entities));
                     resEntities = eData;
                 }
                 if (toDownloadIds.logs && toDownloadIds.logs.length > 0) {
                     const lData = await db.select().from(logs).where(inArray(logs.id, toDownloadIds.logs));
                     // Parse JSON strings back to objects for frontend
                     resLogs = lData.map(l => ({
                         ...l,
                         images: l.images ? JSON.parse(l.images) : [],
                         relatedEntities: l.relatedEntities ? JSON.parse(l.relatedEntities) : []
                     }));
                 }
               }

               // 3. Update master Date in Bucket
               const uploadedAt = new Date().toISOString();
               await env.MY_BUCKET.put("master_backup.json", JSON.stringify({ uploadedAt }));

               return new Response(JSON.stringify({
                   success: true,
                   entities: resEntities,
                   logs: resLogs,
                   uploadedAt
               }), { headers: { "Content-Type": "application/json" } });

             } catch(e: any) {
               return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
             }
          }
        }
      }
      return new Response("Not Found", { status: 404 });
    }

    // R2 File Fetching Route (e.g. /files/my-image.png)
    if (url.pathname.startsWith("/files/")) {
      const fileName = decodeURIComponent(url.pathname.replace("/files/", ""));
      const object = await env.MY_BUCKET.get(fileName);

      if (!object) {
        return new Response("Not Found", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);

      return new Response(object.body as ReadableStream, {
        headers,
      });
    }

    // Static Assets Fallback
    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  },
};
