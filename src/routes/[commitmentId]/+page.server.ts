// TODO: Migrate to +layout.server.ts to avoid duplicating user loading logic
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  return {
    user: locals.user,
  };
};
