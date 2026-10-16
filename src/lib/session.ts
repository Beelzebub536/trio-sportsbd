import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

/** Current Better Auth session (or null) for the incoming request. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** The pathname forwarded by middleware, used to build the `next` param. */
async function getCurrentPath(): Promise<string> {
  const headerList = await headers();
  return headerList.get("x-pathname") ?? "/";
}

/**
 * Require a signed-in user. Redirects to `/login?next=<path>` when signed out.
 * Returns the session so callers can use `session.user`.
 */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/login?next=${encodeURIComponent(await getCurrentPath())}`);
  }
  return session;
}

/**
 * Require a signed-in admin. Signed-out visitors go to
 * `/login?next=<path>`; signed-in non-admins are sent to `/`.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/login?next=${encodeURIComponent(await getCurrentPath())}`);
  }
  if (session.user.role !== "admin") {
    redirect("/");
  }
  return session;
}
