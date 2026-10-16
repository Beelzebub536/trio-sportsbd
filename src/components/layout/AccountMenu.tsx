"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Package, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useWishlistStore } from "@/stores/wishlist";

import type { HeaderUser } from "./SiteHeader";

export default function AccountMenu({ user }: { user: HeaderUser }) {
  const router = useRouter();
  const clearWishlist = useWishlistStore((state) => state.clear);

  const handleSignOut = async () => {
    await authClient.signOut();
    clearWishlist();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="hidden p-2 hover:bg-secondary sm:block"
      >
        <UserIcon className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="p-2 hover:bg-secondary"
      >
        <UserIcon className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate text-xs uppercase tracking-widest text-muted-foreground">
          {user.name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" /> My account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" /> My orders
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void handleSignOut();
          }}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
