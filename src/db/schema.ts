import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const entities = sqliteTable("entities", {
  id: text("id").primaryKey(), // Using string because frontend uses timestamps/mac addresses as ID
  type: text("type").notNull(),
  name: text("name").notNull(),
  parentId: text("parent_id"), // self-referencing to entities.id
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  isDeleted: integer("is_deleted", { mode: 'boolean' }).default(false),
});

export const logs = sqliteTable("logs", {
  id: text("id").primaryKey(),
  text: text("text"),
  images: text("images"), // Stores stringified JSON array of media paths/metadata
  relatedEntities: text("related_entities"), // Stores stringified JSON array of related entity maps
  originEntityId: text("origin_entity_id").notNull(), // points to entities.id
  groupId: text("group_id"),
  authorName: text("author_name"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  isDeleted: integer("is_deleted", { mode: 'boolean' }).default(false),
});
