import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

// ============================================================================
// Auth Tables
// ============================================================================

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(), // Derived from hashed token, not auto-generated
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

// ============================================================================
// Core Tables
// ============================================================================

export const commitment = pgTable("commitment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category"),
  goalHours: integer("goal_hours").notNull().default(100),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

export const timeLog = pgTable("time_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  commitmentId: text("commitment_id")
    .notNull()
    .references(() => commitment.id, { onDelete: "cascade" }),
  durationMinutes: integer("duration_minutes").notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  reflection: text("reflection").notNull(),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

export const milestone = pgTable("milestone", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  commitmentId: text("commitment_id")
    .notNull()
    .references(() => commitment.id, { onDelete: "cascade" }),
  hoursThreshold: integer("hours_threshold").notNull(),
  userSynthesis: text("user_synthesis").notNull(),
  aiFeedback: text("ai_feedback"),
  completedAt: timestamp("completed_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Commitment = typeof commitment.$inferSelect;
export type TimeLog = typeof timeLog.$inferSelect;
export type Milestone = typeof milestone.$inferSelect;
