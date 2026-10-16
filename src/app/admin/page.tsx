import { requireAdmin } from "@/lib/session";

export const metadata = {
  title: "Admin area",
};

export default async function AdminPage() {
  const session = await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold uppercase tracking-tight">Admin area</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as {session.user.email}
      </p>
    </div>
  );
}
