import { form, getRequestEvent, query } from "$app/server";
import {
  CommitmentFormSchema,
  DeleteCommitmentSchema,
  DeleteTimeLogSchema,
  MilestoneFormSchema,
  MILESTONE_THRESHOLDS,
  TimeLogFormSchema,
  UpdateCommitmentSchema,
  UpdateMilestoneSchema,
  UpdateTimeLogSchema,
} from "$lib/schemas/log";
import { generateMilestoneFeedback } from "$lib/server/ai";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { invalid, redirect } from "@sveltejs/kit";
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

/**
 * Create a milestone synthesis
 * Validates commitment ownership and that milestone hasn't been created yet
 */
export const createMilestone = form(
  MilestoneFormSchema,
  async ({ commitmentId, hoursThreshold, userSynthesis }) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
      invalid("You must be signed in to create a milestone");
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

    // Check if milestone already exists for this threshold
    const [existingMilestone] = await db
      .select()
      .from(table.milestone)
      .where(
        and(
          eq(table.milestone.commitmentId, commitmentId),
          eq(table.milestone.hoursThreshold, hoursThreshold),
        ),
      );

    if (existingMilestone) {
      invalid("Milestone already exists for this threshold");
    }

    // Insert the milestone
    const [newMilestone] = await db
      .insert(table.milestone)
      .values({
        commitmentId,
        hoursThreshold,
        userSynthesis,
      })
      .returning({ id: table.milestone.id });

    // Fetch recent reflections for AI context
    const recentLogs = await db
      .select({ reflection: table.timeLog.reflection })
      .from(table.timeLog)
      .where(eq(table.timeLog.commitmentId, commitmentId))
      .orderBy(desc(table.timeLog.date))
      .limit(10);

    // Generate AI feedback (gracefully handle errors)
    try {
      const feedback = await generateMilestoneFeedback({
        commitmentTitle: commitment.title,
        category: commitment.category,
        goalHours: commitment.goalHours,
        hoursThreshold,
        userSynthesis,
        recentReflections: recentLogs.map((l) => l.reflection),
      });

      await db
        .update(table.milestone)
        .set({ aiFeedback: feedback })
        .where(eq(table.milestone.id, newMilestone.id));
    } catch (error) {
      console.error("Failed to generate AI feedback:", error);
      // Continue without feedback - milestone is still created
    }

    redirect(302, `/${commitmentId}`);
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
 * Get a single commitment with its logs, milestones, and pending milestone info
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

  // Fetch completed milestones
  const milestones = await db
    .select()
    .from(table.milestone)
    .where(eq(table.milestone.commitmentId, commitmentId))
    .orderBy(table.milestone.hoursThreshold);

  // Calculate pending milestone threshold (if any)
  const completedThresholds = milestones.map((m) => m.hoursThreshold);
  const totalHours = totalMinutes / 60;
  const pendingMilestone = MILESTONE_THRESHOLDS.find(
    (threshold) =>
      totalHours >= threshold && !completedThresholds.includes(threshold),
  );

  return {
    commitment,
    logs,
    totalMinutes,
    milestones,
    pendingMilestone: pendingMilestone ?? null,
  };
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

/**
 * Get a single time log by ID with ownership verification
 * Returns null if not found or doesn't belong to user
 */
export const getTimeLog = query(v.string(), async (logId) => {
  const { locals } = getRequestEvent();
  if (!locals.user) {
    redirect(302, "/auth");
  }

  // Fetch log with commitment to verify ownership
  const [result] = await db
    .select({
      id: table.timeLog.id,
      durationMinutes: table.timeLog.durationMinutes,
      date: table.timeLog.date,
      reflection: table.timeLog.reflection,
      createdAt: table.timeLog.createdAt,
      commitmentId: table.timeLog.commitmentId,
      commitment: {
        id: table.commitment.id,
        title: table.commitment.title,
        userId: table.commitment.userId,
      },
    })
    .from(table.timeLog)
    .innerJoin(
      table.commitment,
      eq(table.timeLog.commitmentId, table.commitment.id),
    )
    .where(eq(table.timeLog.id, logId));

  if (!result || result.commitment.userId !== locals.user.id) {
    return null;
  }

  return result;
});

/**
 * Get a single milestone by ID with ownership verification
 * Returns null if not found or doesn't belong to user
 */
export const getMilestone = query(v.string(), async (milestoneId) => {
  const { locals } = getRequestEvent();
  if (!locals.user) {
    redirect(302, "/auth");
  }

  // Fetch milestone with commitment to verify ownership
  const [result] = await db
    .select({
      id: table.milestone.id,
      hoursThreshold: table.milestone.hoursThreshold,
      userSynthesis: table.milestone.userSynthesis,
      aiFeedback: table.milestone.aiFeedback,
      completedAt: table.milestone.completedAt,
      commitmentId: table.milestone.commitmentId,
      commitment: {
        id: table.commitment.id,
        title: table.commitment.title,
        userId: table.commitment.userId,
      },
    })
    .from(table.milestone)
    .innerJoin(
      table.commitment,
      eq(table.milestone.commitmentId, table.commitment.id),
    )
    .where(eq(table.milestone.id, milestoneId));

  if (!result || result.commitment.userId !== locals.user.id) {
    return null;
  }

  return result;
});

// ============================================================================
// Update/Delete Form Actions
// ============================================================================

/**
 * Update a time log entry
 * Validates ownership via commitment, updates log
 */
export const updateTimeLog = form(
  UpdateTimeLogSchema,
  async ({ id, hours, minutes, date, reflection }) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
      invalid("You must be signed in to update a log");
    }

    // Fetch log with commitment to verify ownership
    const [log] = await db
      .select({
        id: table.timeLog.id,
        commitmentId: table.timeLog.commitmentId,
        userId: table.commitment.userId,
      })
      .from(table.timeLog)
      .innerJoin(
        table.commitment,
        eq(table.timeLog.commitmentId, table.commitment.id),
      )
      .where(eq(table.timeLog.id, id));

    if (!log || log.userId !== locals.user.id) {
      invalid("Log not found");
    }

    const durationMinutes = hours * 60 + minutes;

    await db
      .update(table.timeLog)
      .set({
        durationMinutes,
        date: new Date(date),
        reflection,
      })
      .where(eq(table.timeLog.id, id));

    redirect(302, `/${log.commitmentId}`);
  },
);

/**
 * Delete a time log entry
 * Validates ownership via commitment, hard deletes log
 */
export const deleteTimeLog = form(DeleteTimeLogSchema, async ({ id }) => {
  const { locals } = getRequestEvent();

  if (!locals.user) {
    invalid("You must be signed in to delete a log");
  }

  // Fetch log with commitment to verify ownership
  const [log] = await db
    .select({
      id: table.timeLog.id,
      commitmentId: table.timeLog.commitmentId,
      userId: table.commitment.userId,
    })
    .from(table.timeLog)
    .innerJoin(
      table.commitment,
      eq(table.timeLog.commitmentId, table.commitment.id),
    )
    .where(eq(table.timeLog.id, id));

  if (!log || log.userId !== locals.user.id) {
    invalid("Log not found");
  }

  await db.delete(table.timeLog).where(eq(table.timeLog.id, id));

  redirect(302, `/${log.commitmentId}`);
});

/**
 * Update a commitment
 * Validates ownership, updates fields
 * If goalHours changes, deletes all milestones for this commitment
 */
export const updateCommitment = form(
  UpdateCommitmentSchema,
  async ({ id, title, category, goalHours }) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
      invalid("You must be signed in to update a commitment");
    }

    // Fetch commitment to verify ownership and check goalHours change
    const [commitment] = await db
      .select()
      .from(table.commitment)
      .where(
        and(
          eq(table.commitment.id, id),
          eq(table.commitment.userId, locals.user.id),
        ),
      );

    if (!commitment) {
      invalid("Commitment not found");
    }

    // If goalHours changed, delete all milestones
    if (commitment.goalHours !== goalHours) {
      await db
        .delete(table.milestone)
        .where(eq(table.milestone.commitmentId, id));
    }

    await db
      .update(table.commitment)
      .set({
        title,
        category: category || null,
        goalHours,
        updatedAt: new Date(),
      })
      .where(eq(table.commitment.id, id));

    redirect(302, `/${id}`);
  },
);

/**
 * Delete a commitment
 * Validates ownership, hard deletes commitment (cascade handles children)
 */
export const deleteCommitment = form(DeleteCommitmentSchema, async ({ id }) => {
  const { locals } = getRequestEvent();

  if (!locals.user) {
    invalid("You must be signed in to delete a commitment");
  }

  // Verify commitment belongs to user
  const [commitment] = await db
    .select()
    .from(table.commitment)
    .where(
      and(
        eq(table.commitment.id, id),
        eq(table.commitment.userId, locals.user.id),
      ),
    );

  if (!commitment) {
    invalid("Commitment not found");
  }

  // Hard delete - cascade will handle logs and milestones
  await db.delete(table.commitment).where(eq(table.commitment.id, id));

  redirect(302, "/");
});

/**
 * Update a milestone synthesis
 * Validates ownership via commitment, updates userSynthesis only
 */
export const updateMilestone = form(
  UpdateMilestoneSchema,
  async ({ id, userSynthesis }) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
      invalid("You must be signed in to update a milestone");
    }

    // Fetch milestone with commitment to verify ownership
    const [milestone] = await db
      .select({
        id: table.milestone.id,
        commitmentId: table.milestone.commitmentId,
        userId: table.commitment.userId,
      })
      .from(table.milestone)
      .innerJoin(
        table.commitment,
        eq(table.milestone.commitmentId, table.commitment.id),
      )
      .where(eq(table.milestone.id, id));

    if (!milestone || milestone.userId !== locals.user.id) {
      invalid("Milestone not found");
    }

    await db
      .update(table.milestone)
      .set({ userSynthesis })
      .where(eq(table.milestone.id, id));

    redirect(302, `/${milestone.commitmentId}`);
  },
);

/**
 * Regenerate AI feedback for a milestone
 * Validates ownership via commitment, generates new feedback
 */
export const regenerateMilestoneFeedback = form(
  v.object({ id: v.pipe(v.string(), v.minLength(1, "Milestone ID is required")) }),
  async ({ id }) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
      invalid("You must be signed in to regenerate feedback");
    }

    // Fetch milestone with commitment to verify ownership
    const [milestone] = await db
      .select({
        id: table.milestone.id,
        commitmentId: table.milestone.commitmentId,
        hoursThreshold: table.milestone.hoursThreshold,
        userSynthesis: table.milestone.userSynthesis,
        commitment: {
          title: table.commitment.title,
          category: table.commitment.category,
          goalHours: table.commitment.goalHours,
          userId: table.commitment.userId,
        },
      })
      .from(table.milestone)
      .innerJoin(
        table.commitment,
        eq(table.milestone.commitmentId, table.commitment.id),
      )
      .where(eq(table.milestone.id, id));

    if (!milestone || milestone.commitment.userId !== locals.user.id) {
      invalid("Milestone not found");
    }

    // Fetch recent reflections for AI context
    const recentLogs = await db
      .select({ reflection: table.timeLog.reflection })
      .from(table.timeLog)
      .where(eq(table.timeLog.commitmentId, milestone.commitmentId))
      .orderBy(desc(table.timeLog.date))
      .limit(10);

    // Generate new AI feedback
    const feedback = await generateMilestoneFeedback({
      commitmentTitle: milestone.commitment.title,
      category: milestone.commitment.category,
      goalHours: milestone.commitment.goalHours,
      hoursThreshold: milestone.hoursThreshold,
      userSynthesis: milestone.userSynthesis,
      recentReflections: recentLogs.map((l) => l.reflection),
    });

    await db
      .update(table.milestone)
      .set({ aiFeedback: feedback })
      .where(eq(table.milestone.id, id));

    redirect(302, `/${milestone.commitmentId}/milestone/${id}/edit`);
  },
);
