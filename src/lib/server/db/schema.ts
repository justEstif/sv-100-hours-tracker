import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ============================================================================
// Auth Tables
// ============================================================================

export const user = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(), // Derived from hashed token, not auto-generated
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// ============================================================================
// Core Tables
// ============================================================================

export const commitment = sqliteTable("commitment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category"),
  goalHours: integer("goal_hours").notNull().default(100),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const timeLog = sqliteTable("time_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  commitmentId: text("commitment_id")
    .notNull()
    .references(() => commitment.id, { onDelete: "cascade" }),
  durationMinutes: integer("duration_minutes").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  reflection: text("reflection").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const milestone = sqliteTable("milestone", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  commitmentId: text("commitment_id")
    .notNull()
    .references(() => commitment.id, { onDelete: "cascade" }),
  hoursThreshold: integer("hours_threshold").notNull(),
  userSynthesis: text("user_synthesis").notNull(),
  aiFeedback: text("ai_feedback"),
  completedAt: integer("completed_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// Type Exports
// ============================================================================

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Commitment = typeof commitment.$inferSelect;
export type TimeLog = typeof timeLog.$inferSelect;
export type Milestone = typeof milestone.$inferSelect;
