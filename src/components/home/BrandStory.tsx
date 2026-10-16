import { ShieldCheck, Truck, Undo2, Wallet } from "lucide-react";

const POINTS = [
  {
    icon: Truck,
    title: "Fast delivery",
    body: "1–2 days inside Dhaka, 2–4 days across Bangladesh.",
  },
  {
    icon: Wallet,
    title: "Cash on delivery",
    body: "Pay only 10% advance by bKash/Nagad, rest on delivery.",
  },
  {
    icon: Undo2,
    title: "7-day returns",
    body: "Unused items with tags can be returned within 7 days.",
  },
  {
    icon: ShieldCheck,
    title: "Genuine gear",
    body: "Quality-checked jerseys, trousers and accessories.",
  },
];

export default function BrandStory() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Trio Sports BD
          </p>
          <h2 className="mt-2 text-3xl font-bold uppercase leading-none md:text-4xl">
            Built for the game. Made for Bangladesh.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground md:text-base">
            We stock match-day jerseys, training trousers and everyday
            accessories for players and fans across the country — with honest
            prices and delivery you can rely on.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((point) => (
            <div key={point.title}>
              <point.icon className="h-6 w-6" aria-hidden />
              <h3 className="mt-3 text-sm font-bold uppercase tracking-wide">
                {point.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
