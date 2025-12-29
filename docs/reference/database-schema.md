# Database Schema

SQLite database using Drizzle ORM. All IDs are UUIDv7 (time-sortable) generated via `Bun.randomUUIDv7()`.

## Tables

### user

Authentication table for registered users.

| Column        | Type | Nullable | Default              | Notes         |
| ------------- | ---- | -------- | -------------------- | ------------- |
| id            | text | no       | `Bun.randomUUIDv7()` | Primary key   |
| username      | text | no       | -                    | Unique        |
| password_hash | text | no       | -                    | Argon2id hash |

### session

Active user sessions for authentication.

| Column     | Type      | Nullable | Default | Notes                            |
| ---------- | --------- | -------- | ------- | -------------------------------- |
| id         | text      | no       | -       | Primary key (SHA-256 of token)   |
| user_id    | text      | no       | -       | FK -> user.id                    |
| expires_at | timestamp | no       | -       | Session expiry (30 days default) |

### commitment

A skill or pursuit the user is tracking toward 100 hours.

| Column     | Type      | Nullable | Default              | Notes                    |
| ---------- | --------- | -------- | -------------------- | ------------------------ |
| id         | text      | no       | `Bun.randomUUIDv7()` | Primary key              |
| user_id    | text      | no       | -                    | FK -> user.id (cascade)  |
| title      | text      | no       | -                    | Name of the commitment   |
| category   | text      | yes      | -                    | Free-form grouping       |
| goal_hours | integer   | no       | 100                  | Target hours             |
| is_active  | boolean   | no       | true                 | Max 4 active per user    |
| created_at | timestamp | no       | `new Date()`         | When commitment was made |
| updated_at | timestamp | no       | `new Date()`         | Last modification        |

### time_log

Individual time entries with required reflections.

| Column           | Type      | Nullable | Default              | Notes                         |
| ---------------- | --------- | -------- | -------------------- | ----------------------------- |
| id               | text      | no       | `Bun.randomUUIDv7()` | Primary key                   |
| commitment_id    | text      | no       | -                    | FK -> commitment.id (cascade) |
| duration_minutes | integer   | no       | -                    | Time spent in minutes         |
| date             | timestamp | no       | -                    | When the work was done        |
| reflection       | text      | no       | -                    | Required reflection text      |
| created_at       | timestamp | no       | `new Date()`         | When log was created          |

### milestone

Synthesis points triggered at hour thresholds (25, 50, 75, 100).

| Column          | Type      | Nullable | Default              | Notes                          |
| --------------- | --------- | -------- | -------------------- | ------------------------------ |
| id              | text      | no       | `Bun.randomUUIDv7()` | Primary key                    |
| commitment_id   | text      | no       | -                    | FK -> commitment.id (cascade)  |
| hours_threshold | integer   | no       | -                    | 25, 50, 75, or 100             |
| user_synthesis  | text      | no       | -                    | User's reflection at milestone |
| ai_feedback     | text      | yes      | -                    | Optional AI analysis           |
| completed_at    | timestamp | no       | `new Date()`         | When milestone was reached     |

## Relationships

```
user (1) ──────< (N) session
  │
  └──────< (N) commitment (1) ──────< (N) time_log
                    │
                    └──────< (N) milestone
```

## Cascade Deletes

- Deleting a `user` cascades to their `commitments`
- Deleting a `commitment` cascades to its `time_logs` and `milestones`
- Sessions are not cascade-deleted (cleaned up separately on expiry)

## Type Exports

Available from `$lib/server/db/schema`:

```typescript
import type {
  User,
  Session,
  Commitment,
  TimeLog,
  Milestone,
} from "$lib/server/db/schema";
```
