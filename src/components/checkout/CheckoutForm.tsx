"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { getCartDetails, type CartLineDetails } from "@/actions/cart";
import { placeOrder } from "@/actions/order";
import OrderSummary from "@/components/checkout/OrderSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bdDivisions } from "@/lib/bd-locations";
import { formatBDT } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import type { StoreSettings } from "@/lib/settings";
import { useCartStore } from "@/stores/cart";
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "@/lib/validators/order";

export type SavedAddress = {
  id: number;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  line1: string;
  isDefault: boolean;
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive">{message}</p> : null;

export default function CheckoutForm({
  settings,
  addresses,
}: {
  settings: StoreSettings;
  addresses: SavedAddress[];
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [details, setDetails] = useState<CartLineDetails[]>([]);
  const [loadedSnapshot, setLoadedSnapshot] = useState("");
  const [cartLoadError, setCartLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const snapshot = items.map((item) => `${item.variantId}:${item.qty}`).join(",");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      division: "",
      district: "",
      upazila: "",
      address: "",
      note: "",
      paymentMode: settings.onlinePaymentsEnabled ? "ADVANCE" : "MANUAL",
      advanceMethod: "BKASH",
      advanceTrxId: "",
      advanceSenderNumber: "",
      terms: false,
    },
  });

  const division = watch("division");
  const paymentMode = watch("paymentMode");
  const advanceMethod = watch("advanceMethod");

  useEffect(() => {
    const current = useCartStore.getState().items;
    if (!hydrated || current.length === 0) {
      setDetails([]);
      setLoadedSnapshot(snapshot);
      setCartLoadError(false);
      return;
    }
    let cancelled = false;
    setCartLoadError(false);
    getCartDetails(
      current.map((item) => ({ variantId: item.variantId, qty: item.qty })),
    )
      .then((result) => {
        if (!cancelled) {
          setDetails(result);
          setLoadedSnapshot(snapshot);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadedSnapshot(snapshot);
          setCartLoadError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, snapshot]);

  const districts = useMemo(
    () => bdDivisions.find((entry) => entry.name === division)?.districts ?? [],
    [division],
  );

  const subtotal = details.reduce(
    (sum, detail) => sum + detail.unitPrice * detail.qty,
    0,
  );
  const cartPending = items.length > 0 && loadedSnapshot !== snapshot;
  let shippingFee: number | null = null;
  if (!cartPending && !cartLoadError) {
    if (subtotal >= settings.freeShippingThreshold) shippingFee = 0;
    else if (division) {
      shippingFee =
        division === "Dhaka"
          ? settings.shippingInsideDhaka
          : settings.shippingOutsideDhaka;
    }
  }
  const total = cartPending || shippingFee == null ? null : subtotal + shippingFee;
  const advanceAmount = total == null
    ? null
    : paymentMode === "FULL"
      ? total
      : paymentMode === "ADVANCE"
        ? Math.ceil((total * settings.advancePercent) / 100)
        : 0;

  const applySavedAddress = (address: SavedAddress) => {
    setValue("fullName", address.fullName);
    setValue("phone", address.phone);
    setValue("division", address.division);
    setValue("district", address.district);
    setValue("upazila", address.upazila);
    setValue("address", address.line1);
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    if (cartPending || cartLoadError || details.length === 0) {
      toast.error("Your bag is empty.");
      return;
    }
    setSubmitting(true);

    const result = await placeOrder({
      ...values,
      items: details.map((detail) => ({
        variantId: detail.variantId,
        qty: detail.qty,
      })),
    });

    if (!result.ok) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }

    clear();
    toast.success(
      settings.onlinePaymentsEnabled
        ? "Order placed — we’ll verify your payment details."
        : "Order request placed — please send it to us on WhatsApp.",
    );
    router.push(
      `/order/${result.orderNumber}?token=${encodeURIComponent(result.token)}`,
    );
  };

  if (hydrated && items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <h2 className="text-xl font-bold uppercase">Your bag is empty</h2>
        <p className="text-sm text-muted-foreground">
          Add something to your bag before checking out.
        </p>
        <Button asChild>
          <Link href="/shop">Start shopping</Link>
        </Button>
      </div>
    );
  }

  const storeNumber =
    advanceMethod === "NAGAD" ? settings.nagadNumber : settings.bkashNumber;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-10 lg:grid-cols-[1fr_340px]"
      noValidate
    >
      <div className="space-y-8">
        {cartLoadError && (
          <p className="border border-destructive p-3 text-sm text-destructive" role="alert">
            We could not check your bag. Refresh this page to try again.
          </p>
        )}
        {addresses.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest">
              Saved addresses
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => applySavedAddress(address)}
                  className="border border-border px-3 py-2 text-left text-xs hover:border-black"
                >
                  <span className="block font-semibold">{address.fullName}</span>
                  <span className="block text-muted-foreground">
                    {address.line1}, {address.district}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Delivery details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" autoComplete="name" {...register("fullName")} />
              <FieldError message={errors.fullName?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile number</Label>
              <Input
                id="phone"
                inputMode="tel"
                placeholder="01XXXXXXXXX"
                autoComplete="tel"
                {...register("phone")}
              />
              <FieldError message={errors.phone?.message} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Controller
                control={control}
                name="division"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("district", "");
                    }}
                  >
                    <SelectTrigger id="division">
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
              <FieldError message={errors.division?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Controller
                control={control}
                name="district"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!division}
                  >
                    <SelectTrigger id="district">
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
              <FieldError message={errors.district?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upazila">Upazila / Thana</Label>
            <Input id="upazila" {...register("upazila")} />
            <FieldError message={errors.upazila?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Full address</Label>
            <Textarea
              id="address"
              rows={3}
              placeholder="House, road, area, landmark"
              {...register("address")}
            />
            <FieldError message={errors.address?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Order note (optional)</Label>
            <Textarea id="note" rows={2} {...register("note")} />
            <FieldError message={errors.note?.message} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Payment
          </h2>
          {settings.onlinePaymentsEnabled ? (
            <>
              <Controller
                control={control}
                name="paymentMode"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <Label className="flex cursor-pointer items-start gap-2 border border-border p-3">
                      <RadioGroupItem value="ADVANCE" />
                      <span>Pay {settings.advancePercent}% now, rest on delivery</span>
                    </Label>
                    <Label className="flex cursor-pointer items-start gap-2 border border-border p-3">
                      <RadioGroupItem value="FULL" />
                      <span>Pay the full amount now</span>
                    </Label>
                  </RadioGroup>
                )}
              />
              <p className="text-sm text-muted-foreground">
                Send <strong className="text-foreground">{advanceAmount == null ? "—" : formatBDT(advanceAmount)}</strong>{" "}
                to our {advanceMethod === "NAGAD" ? "Nagad" : "bKash"} account{" "}
                <strong className="text-foreground">{storeNumber}</strong>, then
                submit the transaction details. We verify payment before confirming
                your order.
              </p>
              <Controller
                control={control}
                name="advanceMethod"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-3"
                  >
                    <Label className="flex cursor-pointer items-center gap-2 border border-border p-3">
                      <RadioGroupItem value="BKASH" /> bKash
                    </Label>
                    <Label className="flex cursor-pointer items-center gap-2 border border-border p-3">
                      <RadioGroupItem value="NAGAD" /> Nagad
                    </Label>
                  </RadioGroup>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="advanceTrxId">Transaction ID (TrxID)</Label>
                  <Input id="advanceTrxId" {...register("advanceTrxId")} />
                  <FieldError message={errors.advanceTrxId?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advanceSenderNumber">Sender number</Label>
                  <Input
                    id="advanceSenderNumber"
                    inputMode="tel"
                    placeholder="01XXXXXXXXX"
                    {...register("advanceSenderNumber")}
                  />
                  <FieldError message={errors.advanceSenderNumber?.message} />
                </div>
              </div>
            </>
          ) : (
            <div className="border border-border bg-secondary p-4 text-sm">
              <p className="font-semibold">Request this order for COD</p>
              <p className="mt-1 text-muted-foreground">
                We’ll review your request and contact you on WhatsApp to confirm
                availability and delivery. No online payment is requested here.
                After placing the request, use the WhatsApp button and press Send
                in WhatsApp; browsers cannot send that message automatically.
              </p>
            </div>
          )}

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-black"
              {...register("terms")}
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="underline underline-offset-2">
                terms &amp; conditions
              </Link>{" "}
              and the{" "}
              <Link href="/shipping-returns" className="underline underline-offset-2">
                shipping &amp; returns
              </Link>{" "}
              policy.
            </span>
          </label>
          <FieldError message={errors.terms?.message} />

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || cartPending || cartLoadError || details.length === 0}
          >
            {submitting ? "Placing order…" : "Place order"}
          </Button>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <OrderSummary
          lines={details.map((detail) => ({
            variantId: detail.variantId,
            name: detail.name,
            size: detail.size,
            color: detail.color,
            unitPrice: detail.unitPrice,
            qty: detail.qty,
          }))}
          subtotal={cartPending || cartLoadError ? null : subtotal}
          shippingFee={shippingFee}
          shippingPending={cartPending || cartLoadError}
          total={total}
          advanceAmount={advanceAmount}
          advancePercent={settings.advancePercent}
          paymentMode={paymentMode}
        />
      </aside>
    </form>
  );
}
