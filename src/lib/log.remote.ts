import { form, getRequestEvent, query } from "$app/server";
import { CommitmentFormSchema, TimeLogFormSchema } from "$lib/schemas/log";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { error, invalid, redirect } from "@sveltejs/kit";
import { and, desc, eq, sql } from "drizzle-orm";
import * as v from "valibot";

/**
 * Create a new time log entry
 * Validates commitment ownership, calculates duration, inserts log
 */
export const createTimeLog = form(
  TimeLogFormSchema,
  async ({ commitmentId, hours, minutes, date, reflection }, issue) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
      invalid("You must be signed in to log time");
    }

    // Verify commitment belongs to user
    const [commitment] = await db
      .select()
      .from(table.commitment)
      .where(
        and(
          eq(table.commitment.id, commitmentId),
          eq(table.commitment.userId, locals.user.id),
        ),
      );

    if (!commitment) {
      invalid("Commitment not found");
    }

    // Calculate total duration in minutes
    const durationMinutes = hours * 60 + minutes;

    // Insert the time log
    await db.insert(table.timeLog).values({
      commitmentId,
      durationMinutes,
      date: new Date(date),
      reflection,
    });

    redirect(302, `/${commitmentId}`);
  },
);

/**
 * Create a new commitment
 * Creates commitment for current user, redirects to log page
 */
export const createCommitment = form(
  CommitmentFormSchema,
  async ({ title, category }, issue) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
      invalid("You must be signed in to create a commitment");
    }

    // Insert the commitment
    const [newCommitment] = await db
      .insert(table.commitment)
      .values({
        userId: locals.user.id,
        title,
        category: category || null,
      })
      .returning({ id: table.commitment.id });

    redirect(302, `/${newCommitment.id}`);
  },
);

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get all commitments for current user with progress (total minutes logged)
 */
export const getCommitments = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) {
    return [];
  }

  const commitments = await db
    .select({
      id: table.commitment.id,
      userId: table.commitment.userId,
      title: table.commitment.title,
      category: table.commitment.category,
      goalHours: table.commitment.goalHours,
      isActive: table.commitment.isActive,
      createdAt: table.commitment.createdAt,
      updatedAt: table.commitment.updatedAt,
      totalMinutes: sql<number>`COALESCE(SUM(${table.timeLog.durationMinutes}), 0)`,
    })
    .from(table.commitment)
    .leftJoin(
      table.timeLog,
      eq(table.commitment.id, table.timeLog.commitmentId),
    )
    .where(eq(table.commitment.userId, locals.user.id))
    .groupBy(table.commitment.id)
    .orderBy(desc(table.commitment.createdAt));

  return commitments;
});

/**
 * Get a single commitment with its logs
 * Redirects to home if commitment not found or doesn't belong to user
 */
export const getCommitmentWithLogs = query(v.string(), async (commitmentId) => {
  const { locals } = getRequestEvent();
  if (!locals.user) {
    redirect(302, "/auth");
  }

  // Fetch commitment (verify ownership)
  const [commitment] = await db
    .select()
    .from(table.commitment)
    .where(
      and(
        eq(table.commitment.id, commitmentId),
        eq(table.commitment.userId, locals.user.id),
      ),
    );

  if (!commitment) {
    redirect(302, "/");
  }

  // Fetch logs for this commitment
  const logs = await db
    .select()
    .from(table.timeLog)
    .where(eq(table.timeLog.commitmentId, commitmentId))
    .orderBy(desc(table.timeLog.date), desc(table.timeLog.createdAt));

  const totalMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);

  return { commitment, logs, totalMinutes };
});

/**
 * Get all logs for the current user (for history page)
 * Returns logs with commitment info, ordered by date descending
 */
export const getAllLogs = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.user) {
    redirect(302, "/auth");
  }

  const logs = await db
    .select({
      id: table.timeLog.id,
      durationMinutes: table.timeLog.durationMinutes,
      date: table.timeLog.date,
      reflection: table.timeLog.reflection,
      createdAt: table.timeLog.createdAt,
      commitment: {
        id: table.commitment.id,
        title: table.commitment.title,
        category: table.commitment.category,
      },
    })
    .from(table.timeLog)
    .innerJoin(
      table.commitment,
      eq(table.timeLog.commitmentId, table.commitment.id),
    )
    .where(eq(table.commitment.userId, locals.user.id))
    .orderBy(desc(table.timeLog.date), desc(table.timeLog.createdAt));

  return logs;
});
