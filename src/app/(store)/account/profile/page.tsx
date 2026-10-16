import PasswordForm from "@/components/account/PasswordForm";
import ProfileForm from "@/components/account/ProfileForm";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Profile" };

export default async function AccountProfilePage() {
  const session = await requireUser();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
          Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {session.user.email}
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest">
          Personal details
        </h2>
        <ProfileForm name={session.user.name} />
      </section>

      <section className="border-t border-border pt-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest">
          Change password
        </h2>
        <PasswordForm />
      </section>

      <section className="border-t border-border pt-8">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-widest">
          Delete your account
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          To have your account and personal data removed, follow the steps on
          the{" "}
          <a href="/data-deletion" className="underline underline-offset-2">
            data deletion page
          </a>
          .
        </p>
      </section>
    </div>
  );
}
