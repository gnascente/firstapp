import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import { cards } from "./db/schema";

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

      // GET /api/equipamentos
      if (url.pathname === "/api/equipamentos" && request.method === "GET") {
        try {
          const allCards = await db.select().from(cards).orderBy(desc(cards.createdAt));
          return new Response(JSON.stringify({ documents: allCards }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // POST /api/equipamentos
      if (url.pathname === "/api/equipamentos" && request.method === "POST") {
        try {
          const body = (await request.json()) as any;
          await db.insert(cards).values({
            title: body.title,
            content: body.content,
            imagePath: body.image_path,
            authorName: body.author_name,
            createdAt: new Date(),
          });
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // PUT /api/equipamentos/:id
      if (url.pathname.startsWith("/api/equipamentos/") && request.method === "PUT") {
        const id = parseInt(url.pathname.split("/").pop() || "0", 10);
        if (!id) return new Response("Invalid ID", { status: 400 });

        try {
          const body = (await request.json()) as any;
          await db
            .update(cards)
            .set({
              title: body.title,
              content: body.content,
              imagePath: body.image_path,
              lockedBy: body.locked_by,
              lockedAt: body.locked_at,
            })
            .where(eq(cards.id, id));
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // DELETE /api/equipamentos/:id
      if (url.pathname.startsWith("/api/equipamentos/") && request.method === "DELETE") {
        const id = parseInt(url.pathname.split("/").pop() || "0", 10);
        if (!id) return new Response("Invalid ID", { status: 400 });

        try {
          await db.delete(cards).where(eq(cards.id, id));
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // PUT /api/upload
      if (url.pathname === "/api/upload" && request.method === "PUT") {
        try {
          const fileName = request.headers.get("X-File-Name") || `upload-${Date.now()}`;
          const contentType = request.headers.get("X-Content-Type") || "application/octet-stream";

          // Using standard object put for R2
          await env.MY_BUCKET.put(fileName, request.body, {
            httpMetadata: { contentType },
          });

          return new Response(JSON.stringify({ success: true, path: fileName, final: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
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
