import { error, redirect } from "@sveltejs/kit";
import { form } from "$app/server";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import * as auth from "$lib/server/auth";
import { AuthFormSchema } from "$lib/schemas/auth";
import { eq } from "drizzle-orm";

/**
 * Login form handler
 * Validates credentials, creates session, sets cookie, redirects to /
 */
export const login = form(AuthFormSchema, async ({ username, password }) => {
  const results = await db
    .select()
    .from(table.user)
    .where(eq(table.user.username, username));

  const existingUser = results.at(0);
  if (!existingUser) {
    error(400, "Incorrect username or password");
  }

  const validPassword = await Bun.password.verify(
    password,
    existingUser.passwordHash,
  );
  if (!validPassword) {
    error(400, "Incorrect username or password");
  }

  const { cookies } = getRequestEvent();
  const sessionToken = auth.generateSessionToken();
  const session = await auth.createSession(sessionToken, existingUser.id);
  auth.setSessionTokenCookie(cookies, sessionToken, session.expiresAt);

  redirect(302, "/");
});

/**
 * Register form handler
 * Creates user, creates session, sets cookie, redirects to /
 */
export const register = form(AuthFormSchema, async ({ username, password }) => {
  const userId = Bun.randomUUIDv7();
  const passwordHash = await Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 19,
    timeCost: 2,
  });

  try {
    await db.insert(table.user).values({ id: userId, username, passwordHash });
  } catch {
    error(500, "Username already taken or an error occurred");
  }

  const { cookies } = getRequestEvent();
  const sessionToken = auth.generateSessionToken();
  const session = await auth.createSession(sessionToken, userId);
  auth.setSessionTokenCookie(cookies, sessionToken, session.expiresAt);

  redirect(302, "/");
});

/**
 * Logout form handler
 * Invalidates session, deletes cookie, redirects to /auth
 */
export const logout = form(async () => {
  const { locals, cookies } = getRequestEvent();

  if (!locals.session) {
    error(401, "Not authenticated");
  }

  await auth.invalidateSession(locals.session.id);
  auth.deleteSessionTokenCookie(cookies);

  redirect(302, "/auth");
});
