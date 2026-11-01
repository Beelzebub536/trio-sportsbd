import Link from "next/link";

import SignOutButton from "@/components/auth/SignOutButton";
import { requireUser } from "@/lib/session";

const NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/profile", label: "Profile" },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-sm text-muted-foreground">
          Signed in as
        </p>
        <p className="truncate font-semibold">{session.user.name}</p>

        <nav aria-label="Account" className="mt-6">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 text-sm font-semibold hover:underline hover:decoration-2 hover:underline-offset-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6">
          <SignOutButton />
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
