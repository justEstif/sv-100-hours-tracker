# Agent Guidelines

This is a SvelteKit 5 application using Bun runtime, Drizzle ORM with SQLite, TailwindCSS 4, and DaisyUI 5. It's a time tracking app for 100-hour learning commitments with a "Lazy Lofi" aesthetic.

## Build/Lint/Test Commands

```bash
# Development server
bun run dev

# Production build
bun run build

# Preview production build
bun run preview

# Type checking
bun run check              # Single run
bun run check:watch        # Watch mode

# Database commands
bun run db:generate        # Generate migration files
bun run db:push            # Push schema to database
bun run db:migrate         # Run migrations
bun run db:studio          # Open Drizzle Studio GUI

# SvelteKit sync (generates types)
bun run prepare
```

### Environment Variables

Required: `DATABASE_URL` - SQLite database URL (e.g., `file:./dev.db`)

## Project Structure

```
src/
  lib/
    assets/           # Static assets (favicon, images)
    components/       # Reusable Svelte components
    schemas/          # Valibot validation schemas
    server/
      db/             # Drizzle schema and database connection
      auth.ts         # Authentication utilities
    *.remote.ts       # SvelteKit remote functions (server actions)
    index.ts          # Lib barrel exports
  routes/             # SvelteKit file-based routing
  app.d.ts            # Global type declarations
  app.html            # HTML template
  hooks.server.ts     # Server hooks (auth middleware)
```

## Code Style Guidelines

### TypeScript

- Strict mode enabled with all strict checks
- Use explicit types for function parameters and return values
- Prefer type inference for local variables when types are obvious
- Export types from schema.ts using `$inferSelect` pattern:
  ```typescript
  export type User = typeof user.$inferSelect;
  ```

### Imports

- Use `$lib` alias for all lib imports: `import { db } from "$lib/server/db"`
- Use `$app/server` for SvelteKit server utilities
- Use `$app/navigation` for client-side navigation utilities
- Import order:
  1. SvelteKit/framework imports (`@sveltejs/kit`, `$app/*`)
  2. External packages (`drizzle-orm`, `valibot`)
  3. Internal modules (`$lib/*`)
- Use namespace imports for schema tables: `import * as table from "$lib/server/db/schema"`

### Svelte 5 Conventions

- Use `$props()` for component props, not the old `export let` syntax
- Use `$state()` for reactive state
- Use `$derived()` for computed values
- Use `{@render children()}` for slot content, not `<slot>`
- Use `$effect()` for side effects (sparingly)

```svelte
<script lang="ts">
  interface Props {
    name: string;
    count?: number;
  }
  let { name, count = 0 }: Props = $props();
  let doubled = $derived(count * 2);
</script>
```

### Remote Functions (Server Actions)

Use SvelteKit experimental remote functions for forms:

```typescript
// src/lib/example.remote.ts
import { form } from "$app/server";
import { getRequestEvent } from "$app/server";

export const myAction = form(MyValibotSchema, async (data) => {
  const { locals, cookies } = getRequestEvent();
  // ... handle action
  redirect(302, "/success");
});
```

Usage in Svelte:
```svelte
<script>
  import { myAction } from '$lib/example.remote';
</script>

<form {...myAction}>
  <input {...myAction.fields.fieldName.as('text')} />
  {#each myAction.fields.fieldName.issues() ?? [] as issue}
    <p class="text-error">{issue.message}</p>
  {/each}
</form>
```

### Validation Schemas

Use Valibot for all validation. Define schemas in `src/lib/schemas/`:

```typescript
import * as v from "valibot";

export const MySchema = v.object({
  field: v.pipe(
    v.string(),
    v.minLength(1, "Field is required"),
    v.maxLength(100, "Too long")
  ),
});

export type MyData = v.InferOutput<typeof MySchema>;
```

### Database (Drizzle ORM)

- Schema defined in `src/lib/server/db/schema.ts`
- Use `text("id").$defaultFn(() => Bun.randomUUIDv7())` for UUID primary keys
- Use `integer("timestamp", { mode: "timestamp" })` for date fields
- Always use parameterized queries via Drizzle's query builder

### Error Handling

- Use SvelteKit's `error()` helper for HTTP errors:
  ```typescript
  import { error } from "@sveltejs/kit";
  error(401, "Not authenticated");
  ```
- Use `redirect()` for navigation after mutations
- Check `locals.user` for authentication in server code

### Naming Conventions

- Files: kebab-case for routes, camelCase for lib modules
- Remote functions: `*.remote.ts` suffix
- Components: PascalCase (`Navbar.svelte`)
- Variables/functions: camelCase
- Database tables: snake_case
- Types: PascalCase with descriptive suffixes (`AuthFormData`, `SessionValidationResult`)

### Styling

- TailwindCSS 4 with DaisyUI 5 components
- Custom "lazylofi" theme defined in `src/routes/layout.css`
- Use DaisyUI component classes: `btn`, `card`, `input`, `alert`, etc.
- Custom utilities: `shadow-soft`, `shadow-soft-lg`, `glow-accent`, `animate-float`
- Font families: `font-display` (Fredoka) for headings, default (Outfit) for body

### Component Organization

- If a UI component is only used in one place, keep it as inline Svelte template markup within that component
- If it gets reused, extract it into a separate reusable component in `src/lib/components/`
- Use Svelte transitions from `svelte/transition` (`fly`, `fade`)

### Authentication Pattern

Authentication is handled via:
1. `hooks.server.ts` - validates session on every request
2. `locals.user` and `locals.session` - available in all server code
3. Cookie-based sessions with SHA-256 hashed tokens
4. Password hashing with Argon2id via Bun

### Page Load Data

Use typed `PageServerLoad` functions:

```typescript
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    return { user: null };
  }
  // Fetch data...
  return { user: locals.user, data };
};
```

## Common Patterns

### Protected Routes
```typescript
if (!locals.user) {
  redirect(302, "/auth");
}
```

### Database Queries
```typescript
const [result] = await db
  .select()
  .from(table.user)
  .where(eq(table.user.id, userId));
```

### Form Validation Display
```svelte
<fieldset class="fieldset">
  <legend class="fieldset-legend">Field Label</legend>
  <input
    {...formAction.fields.fieldName.as('text')}
    class="input w-full"
    class:input-error={(formAction.fields.fieldName.issues()?.length ?? 0) > 0}
  />
  {#each formAction.fields.fieldName.issues() ?? [] as issue}
    <p class="fieldset-label text-error">{issue.message}</p>
  {/each}
</fieldset>
```
