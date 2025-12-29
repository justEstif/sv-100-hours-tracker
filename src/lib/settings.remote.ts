import { error, invalid, redirect } from "@sveltejs/kit";
import { form, getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import * as auth from "$lib/server/auth";
import { ChangePasswordSchema, DeleteAccountSchema } from "$lib/schemas/settings";
import { eq, and, ne } from "drizzle-orm";

/**
 * Change password form handler
 * Verifies current password, updates hash, invalidates other sessions
 */
export const changePassword = form(
  ChangePasswordSchema,
  async ({ currentPassword, newPassword }, issue) => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.session) {
      error(401, "Not authenticated");
    }

    // Fetch user with password hash
    const [user] = await db
      .select()
      .from(table.user)
      .where(eq(table.user.id, locals.user.id));

    if (!user) {
      error(401, "User not found");
    }

    // Verify current password
    const validPassword = await Bun.password.verify(
      currentPassword,
      user.passwordHash
    );

    if (!validPassword) {
      invalid(issue.currentPassword("Current password is incorrect"));
    }

    // Hash new password
    const newPasswordHash = await Bun.password.hash(newPassword, {
      algorithm: "argon2id",
      memoryCost: 19,
      timeCost: 2,
    });

    // Update password in database
    await db
      .update(table.user)
      .set({ passwordHash: newPasswordHash })
      .where(eq(table.user.id, user.id));

    // Invalidate all other sessions (keep current session active)
    await db
      .delete(table.session)
      .where(
        and(
          eq(table.session.userId, user.id),
          ne(table.session.id, locals.session.id)
        )
      );

    redirect(302, "/settings?success=password");
  }
);

/**
 * Delete account form handler
 * Verifies password, deletes all user data, clears session
 */
export const deleteAccount = form(
  DeleteAccountSchema,
  async ({ password }, issue) => {
    const { locals, cookies } = getRequestEvent();

    if (!locals.user) {
      error(401, "Not authenticated");
    }

    // Fetch user with password hash
    const [user] = await db
      .select()
      .from(table.user)
      .where(eq(table.user.id, locals.user.id));

    if (!user) {
      error(401, "User not found");
    }

    // Verify password
    const validPassword = await Bun.password.verify(password, user.passwordHash);

    if (!validPassword) {
      invalid(issue.password("Password is incorrect"));
    }

    // Delete all sessions for user
    await db
      .delete(table.session)
      .where(eq(table.session.userId, user.id));

    // Delete user (commitment, timeLog, milestone cascade automatically)
    await db
      .delete(table.user)
      .where(eq(table.user.id, user.id));

    // Clear session cookie
    auth.deleteSessionTokenCookie(cookies);

    redirect(302, "/auth");
  }
);
