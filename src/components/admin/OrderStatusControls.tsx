"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  saveOrderNote,
  setBalanceCollected,
  updateAdvanceStatus,
  updateOrderStatus,
} from "@/actions/admin/orders";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const ADVANCE_STATUSES = ["PENDING", "VERIFIED", "REJECTED"];

export default function OrderStatusControls({
  id,
  status,
  advanceStatus,
  balanceCollected,
  adminNote,
}: {
  id: number;
  status: string;
  advanceStatus: string;
  balanceCollected: boolean;
  adminNote: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(adminNote ?? "");

  const changeStatus = async (value: string) => {
    setBusy(true);
    const result = await updateOrderStatus(id, value as never);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update the status.");
      return;
    }
    toast.success("Order status updated");
    router.refresh();
  };

  const changeAdvance = async (value: string) => {
    setBusy(true);
    const result = await updateAdvanceStatus(id, value as never);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update the advance status.");
      return;
    }
    toast.success("Advance status updated");
    router.refresh();
  };

  const toggleBalance = async (value: boolean) => {
    setBusy(true);
    const result = await setBalanceCollected(id, value);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update.");
      return;
    }
    router.refresh();
  };

  const saveNote = async () => {
    setBusy(true);
    const result = await saveOrderNote(id, note);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not save the note.");
      return;
    }
    toast.success("Note saved");
    router.refresh();
  };

  return (
    <div className="space-y-5 border border-border p-4">
      <h2 className="text-sm font-bold uppercase tracking-widest">
        Order controls
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="o-status">Order status</Label>
          <Select value={status} onValueChange={changeStatus} disabled={busy}>
            <SelectTrigger id="o-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="o-advance">Advance payment</Label>
          <Select
            value={advanceStatus}
            onValueChange={changeAdvance}
            disabled={busy}
          >
            <SelectTrigger id="o-advance">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADVANCE_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={balanceCollected}
          onCheckedChange={toggleBalance}
          disabled={busy}
        />
        Balance collected on delivery
      </label>

      <div className="space-y-2">
        <Label htmlFor="o-note">Internal note</Label>
        <Textarea
          id="o-note"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Courier, rider, or anything the team should know"
        />
        <Button type="button" variant="outline" disabled={busy} onClick={saveNote}>
          Save note
        </Button>
      </div>
    </div>
  );
}
