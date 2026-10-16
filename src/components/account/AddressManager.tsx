"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  deleteAddress,
  saveAddress,
  setDefaultAddress,
} from "@/actions/address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bdDivisions } from "@/lib/bd-locations";
import { addressSchema, type AddressValues } from "@/lib/validators/address";

export type AddressRecord = {
  id: number;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  line1: string;
  isDefault: boolean;
};

const EMPTY: AddressValues = {
  fullName: "",
  phone: "",
  division: "",
  district: "",
  upazila: "",
  line1: "",
  isDefault: false,
};

export default function AddressManager({
  addresses,
}: {
  addresses: AddressRecord[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AddressRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY,
  });

  const division = watch("division");
  const districts =
    bdDivisions.find((entry) => entry.name === division)?.districts ?? [];

  const openForm = (address?: AddressRecord) => {
    setEditing(address ?? null);
    reset(address ? { ...address } : EMPTY);
    setOpen(true);
  };

  const onSubmit = async (values: AddressValues) => {
    const result = await saveAddress(values, editing?.id);
    if (!result.ok) {
      toast.error(result.error ?? "Could not save the address.");
      return;
    }
    toast.success(editing ? "Address updated" : "Address added");
    setOpen(false);
    setEditing(null);
    reset(EMPTY);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    setBusy(true);
    const result = await deleteAddress(id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not delete the address.");
      return;
    }
    toast.success("Address deleted");
    router.refresh();
  };

  const handleDefault = async (id: number) => {
    setBusy(true);
    const result = await setDefaultAddress(id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update the address.");
      return;
    }
    toast.success("Default address updated");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {addresses.length === 0 && !open && (
        <p className="border border-border p-5 text-sm text-muted-foreground">
          You have no saved addresses yet.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <li key={address.id} className="border border-border p-4 text-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold uppercase">{address.fullName}</p>
              {address.isDefault && (
                <span className="bg-[var(--brand-accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
                  Default
                </span>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">{address.phone}</p>
            <p className="mt-1 text-muted-foreground">
              {address.line1}, {address.upazila}, {address.district},{" "}
              {address.division}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-widest">
              <button
                type="button"
                className="underline underline-offset-4 hover:decoration-2"
                onClick={() => openForm(address)}
              >
                Edit
              </button>
              {!address.isDefault && (
                <button
                  type="button"
                  disabled={busy}
                  className="underline underline-offset-4 hover:decoration-2"
                  onClick={() => handleDefault(address.id)}
                >
                  Set default
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                className="text-[var(--brand-sale)] underline underline-offset-4 hover:decoration-2"
                onClick={() => handleDelete(address.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {open ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 border border-border p-5"
          noValidate
        >
          <h2 className="text-sm font-bold uppercase tracking-widest">
            {editing ? "Edit address" : "New address"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="a-fullName">Full name</Label>
              <Input id="a-fullName" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-phone">Mobile number</Label>
              <Input id="a-phone" inputMode="tel" {...register("phone")} />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="a-division">Division</Label>
              <Controller
                control={control}
                name="division"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      reset((values) => ({ ...values, district: "" }));
                    }}
                  >
                    <SelectTrigger id="a-division">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {bdDivisions.map((entry) => (
                        <SelectItem key={entry.name} value={entry.name}>
                          {entry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.division && (
                <p className="text-xs text-destructive">{errors.division.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-district">District</Label>
              <Controller
                control={control}
                name="district"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!division}
                  >
                    <SelectTrigger id="a-district">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.district && (
                <p className="text-xs text-destructive">{errors.district.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="a-upazila">Upazila / Thana</Label>
            <Input id="a-upazila" {...register("upazila")} />
            {errors.upazila && (
              <p className="text-xs text-destructive">{errors.upazila.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="a-line1">Full address</Label>
            <Input id="a-line1" {...register("line1")} />
            {errors.line1 && (
              <p className="text-xs text-destructive">{errors.line1.message}</p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-black" {...register("isDefault")} />
            Set as default address
          </label>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {editing ? "Save changes" : "Add address"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setEditing(null);
                reset(EMPTY);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => openForm()}>Add a new address</Button>
      )}
    </div>
  );
}
