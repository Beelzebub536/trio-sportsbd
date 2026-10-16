import SignOutButton from "@/components/auth/SignOutButton";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "My account",
};

export default async function AccountPage() {
  const session = await requireUser();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">
            My account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as {session.user.email}
          </p>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}
