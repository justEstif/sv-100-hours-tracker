# Agent Guidelines

SvelteKit 5 app using Bun runtime, Drizzle ORM with PostgreSQL, TailwindCSS 4, and DaisyUI 5. Time tracking for 100-hour learning commitments with a "Lazy Lofi" aesthetic.

## Commands

```bash
bun run dev                # Start dev server
bun run build              # Production build
bun run check              # Type check (use after changes)
bun run check:watch        # Type check watch mode
bun run db:generate        # Generate migration files
bun run db:push            # Push schema to database
bun run db:migrate         # Run migrations
bun run db:studio          # Open Drizzle Studio GUI
bun run prepare            # Sync SvelteKit types
```

**Note:** No test framework configured. Use `bun run check` for type validation.

## Local Development Setup

```bash
# Start local Postgres
docker compose up -d

# Install dependencies
bun install

# Push schema to database (or generate + migrate)
bun run db:push

# Start dev server
bun run dev
```

**Environment:** Requires `DATABASE_URL` (e.g., `postgres://postgres:postgres@localhost:5432/hours_tracker`)

Set via `mise.toml` for local development.

## Dokku Deployment

```bash
# Initial setup (one-time on Dokku server)
dokku apps:create 100-hours-tracker
dokku postgres:create 100-hours-tracker-db
dokku postgres:link 100-hours-tracker-db 100-hours-tracker
dokku config:set 100-hours-tracker GOOGLE_GENERATIVE_AI_API_KEY="your-key-here"

# Deploy (from local machine)
git remote add dokku dokku@your-server:100-hours-tracker
git push dokku main

# Migrations run automatically via predeploy hook (app.json)
```

## Project Structure

- `src/lib/components/` - Reusable Svelte components (PascalCase.svelte)
- `src/lib/schemas/` - Valibot validation schemas
- `src/lib/server/db/` - Drizzle schema and connection
- `src/lib/*.remote.ts` - SvelteKit remote functions (server actions)
- `src/routes/` - File-based routing
- `src/hooks.server.ts` - Auth middleware

## Code Style

### TypeScript & Imports

Strict mode enabled. Use explicit types for parameters/returns, inference for locals.

```typescript
// Import order: 1) SvelteKit  2) External  3) Internal
import { error, redirect } from "@sveltejs/kit";
import { form, getRequestEvent } from "$app/server";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
```

### Svelte 5 Runes (Required)

```svelte
<script lang="ts">
  interface Props { name: string; count?: number; }
  let { name, count = 0 }: Props = $props();  // NOT export let
  let doubled = $derived(count * 2);
  let items = $state<string[]>([]);
</script>
```

- `$props()` for props, `$state()` for state, `$derived()` for computed
- `{@render children()}` for slots (NOT `<slot>`)
- `$effect()` for side effects (use sparingly)

### Remote Functions (*.remote.ts)

```typescript
import { form, getRequestEvent } from "$app/server";
import { redirect, invalid } from "@sveltejs/kit";

export const myAction = form(MyValibotSchema, async (data, issue) => {
  const { locals, cookies } = getRequestEvent();
  if (!locals.user) invalid(issue.username("Not authenticated"));
  redirect(302, "/success");
});
```

Usage:
```svelte
<form {...myAction}>
  <input {...myAction.fields.fieldName.as('text')} class="input" />
  {#each myAction.fields.fieldName.issues() ?? [] as issue}
    <p class="text-error">{issue.message}</p>
  {/each}
</form>
```

### Validation (Valibot)

```typescript
import * as v from "valibot";
export const MySchema = v.object({
  field: v.pipe(v.string(), v.minLength(1, "Required"), v.maxLength(100)),
});
export type MyData = v.InferOutput<typeof MySchema>;
```

### Database (Drizzle ORM)

```typescript
// Schema: src/lib/server/db/schema.ts
export const myTable = pgTable("my_table", {
  id: text("id").primaryKey().$defaultFn(() => Bun.randomUUIDv7()),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
export type MyTable = typeof myTable.$inferSelect;

// Queries
const [result] = await db.select().from(table.user).where(eq(table.user.id, id));
```

### Error Handling

```typescript
import { error, redirect } from "@sveltejs/kit";
error(401, "Not authenticated");  // HTTP errors
redirect(302, "/auth");           // Navigation after mutations
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Route files | kebab-case | `auth/+page.svelte` |
| Lib files | camelCase | `auth.remote.ts` |
| Components | PascalCase | `Navbar.svelte` |
| Variables | camelCase | `formatDuration` |
| DB tables | snake_case | `time_log` |
| Types | PascalCase | `AuthFormData` |

### Styling

- TailwindCSS 4 + DaisyUI 5, custom "lazylofi" theme in `src/routes/layout.css`
- DaisyUI: `btn`, `card`, `input`, `alert`, `fieldset`
- Custom: `shadow-soft`, `glow-accent`, `animate-float`
- Fonts: `font-display` (Fredoka) headings, Outfit body

## Common Patterns

### Protected Routes
```typescript
export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/auth");
  return { user: locals.user };
};
```

### Form with Validation
```svelte
<fieldset class="fieldset">
  <legend class="fieldset-legend">Label</legend>
  <input {...formAction.fields.field.as('text')} class="input w-full"
    class:input-error={(formAction.fields.field.issues()?.length ?? 0) > 0} />
  {#each formAction.fields.field.issues() ?? [] as issue}
    <p class="fieldset-label text-error">{issue.message}</p>
  {/each}
</fieldset>
```

### Authentication

- `hooks.server.ts` validates session on every request
- `locals.user` / `locals.session` available in server code
- Cookie sessions with SHA-256 tokens, Argon2id password hashing via Bun

### Async Components

Enabled via `svelte.config.js` (`experimental.async: true`):
```svelte
<script lang="ts">
  let data = $derived(await fetchData());
</script>
```
