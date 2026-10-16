import CustomerActions from "@/components/admin/CustomerActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBDT } from "@/lib/format";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";

  const [users, orderStats] = await Promise.all([
    prisma.user.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.order.groupBy({
      by: ["userId"],
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);

  const statsByUser = new Map(
    orderStats
      .filter((row) => row.userId != null)
      .map((row) => [
        row.userId as string,
        { count: row._count._all, total: row._sum.total ?? 0 },
      ]),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
        Customers
      </h1>

      <form method="get" className="flex max-w-md gap-2">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Search by name or email"
          aria-label="Search customers"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {users.length === 0 ? (
        <p className="border border-border p-5 text-sm text-muted-foreground">
          No customers found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Joined</th>
                <th className="py-2 pr-4">Orders</th>
                <th className="py-2 pr-4">Spent</th>
                <th className="py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const stats = statsByUser.get(user.id);
                return (
                  <tr key={user.id} className="border-b border-border">
                    <td className="py-3 pr-4">
                      <span className="block font-semibold">{user.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {user.createdAt.toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 pr-4">{stats?.count ?? 0}</td>
                    <td className="py-3 pr-4 font-semibold">
                      {formatBDT(stats?.total ?? 0)}
                    </td>
                    <td className="py-3">
                      <CustomerActions
                        userId={user.id}
                        name={user.name}
                        role={user.role ?? "customer"}
                        isSelf={user.id === session.user.id}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
