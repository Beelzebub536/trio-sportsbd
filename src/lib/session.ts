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

/** For server actions: return the user id, or throw if not signed in. */
export async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

/** For server actions: return the session user, or throw if not an admin. */
export async function requireAdminUser() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorised");
  }
  return session.user;
}
