import Link from "next/link";

import ProductRowActions from "@/components/admin/ProductRowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBDT } from "@/lib/format";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const products = await prisma.product.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      salePrice: true,
      isActive: true,
      category: { select: { name: true } },
      variants: { select: { stock: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold uppercase leading-none md:text-3xl">
          Products
        </h1>
        <Button asChild>
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </div>

      <form method="get" className="flex max-w-md gap-2">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Search by name, slug or brand"
          aria-label="Search products"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {products.length === 0 ? (
        <p className="border border-border p-5 text-sm text-muted-foreground">
          No products found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stock = product.variants.reduce(
                  (sum, variant) => sum + variant.stock,
                  0,
                );
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <span className="block font-semibold">{product.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        /{product.slug}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {product.category.name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatBDT(product.salePrice ?? product.basePrice)}
                      {product.salePrice != null && (
                        <span className="ml-2 text-xs text-muted-foreground line-through">
                          {formatBDT(product.basePrice)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{stock}</TableCell>
                    <TableCell>
                      <ProductRowActions
                        id={product.id}
                        slug={product.slug}
                        name={product.name}
                        isActive={product.isActive}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
