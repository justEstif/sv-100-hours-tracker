import * as v from "valibot";

// ============================================================================
// Time Log Schema
// ============================================================================

export const TimeLogFormSchema = v.pipe(
  v.object({
    commitmentId: v.pipe(
      v.string(),
      v.minLength(1, "Commitment is required")
    ),
    hours: v.pipe(
      v.number(),
      v.minValue(0, "Hours cannot be negative"),
      v.maxValue(23, "Hours must be less than 24")
    ),
    minutes: v.pipe(
      v.number(),
      v.minValue(0, "Minutes cannot be negative"),
      v.maxValue(59, "Minutes must be less than 60")
    ),
    date: v.pipe(v.string(), v.isoDate("Invalid date format")),
    reflection: v.pipe(
      v.string(),
      v.minLength(1, "Reflection is required")
    ),
  }),
  v.forward(
    v.check(
      (input) => input.hours * 60 + input.minutes >= 1,
      "Duration must be at least 1 minute"
    ),
    ["minutes"]
  )
);

export type TimeLogFormData = v.InferOutput<typeof TimeLogFormSchema>;

// ============================================================================
// Commitment Schema
// ============================================================================

export const CommitmentFormSchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(1, "Title is required"),
    v.maxLength(100, "Title must be at most 100 characters")
  ),
  category: v.optional(
    v.pipe(v.string(), v.maxLength(50, "Category must be at most 50 characters"))
  ),
});

export type CommitmentFormData = v.InferOutput<typeof CommitmentFormSchema>;

// ============================================================================
// Milestone Schema
// ============================================================================

export const MILESTONE_THRESHOLDS = [25, 50, 75, 100] as const;
export type MilestoneThreshold = (typeof MILESTONE_THRESHOLDS)[number];

export const MilestoneFormSchema = v.object({
  commitmentId: v.pipe(v.string(), v.minLength(1, "Commitment is required")),
  hoursThreshold: v.pipe(
    v.number(),
    v.check(
      (n): n is MilestoneThreshold =>
        MILESTONE_THRESHOLDS.includes(n as MilestoneThreshold),
      "Invalid milestone threshold"
    )
  ),
  userSynthesis: v.pipe(
    v.string(),
    v.minLength(10, "Please write at least a few sentences about your journey"),
    v.maxLength(5000, "Synthesis is too long")
  ),
});

export type MilestoneFormData = v.InferOutput<typeof MilestoneFormSchema>;
