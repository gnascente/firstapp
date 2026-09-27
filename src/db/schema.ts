import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"),
  imagePath: text("image_path"),
  lockedBy: text("locked_by"), // UUID is text in SQLite
  lockedAt: text("locked_at"), // ISO date string or timestamp
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  authorName: text("author_name"),
});
