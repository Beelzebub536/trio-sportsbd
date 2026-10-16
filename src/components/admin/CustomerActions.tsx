"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteUser, setUserRole } from "@/actions/admin/customers";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CustomerActions({
  userId,
  name,
  role,
  isSelf,
}: {
  userId: string;
  name: string;
  role: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const changeRole = async (value: string) => {
    setBusy(true);
    const result = await setUserRole(userId, value as "admin" | "customer");
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update the role.");
      return;
    }
    toast.success("Role updated");
    router.refresh();
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    setBusy(true);
    const result = await deleteUser(userId);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not delete this customer.");
      return;
    }
    toast.success("Customer deleted");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={changeRole} disabled={busy}>
        <SelectTrigger className="h-8 w-32 text-xs" aria-label={`Role for ${name}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="customer">customer</SelectItem>
          <SelectItem value="admin">admin</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        disabled={busy || isSelf}
        onClick={remove}
      >
        Delete
      </Button>
    </div>
  );
}
