import AddressManager, {
  type AddressRecord,
} from "@/components/account/AddressManager";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const metadata = { title: "My addresses" };

export default async function AccountAddressesPage() {
  const session = await requireUser();

  const addresses: AddressRecord[] = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    select: {
      id: true,
      fullName: true,
      phone: true,
      division: true,
      district: true,
      upazila: true,
      line1: true,
      isDefault: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold leading-none md:text-3xl">
        My addresses
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Saved addresses appear at checkout so you can order in a few taps.
      </p>
      <div className="mt-6">
        <AddressManager addresses={addresses} />
      </div>
    </div>
  );
}
