import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect to home if already logged in
  if (locals.user) {
    redirect(302, "/");
  }
  return {};
};
