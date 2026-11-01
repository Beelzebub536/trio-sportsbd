import { ShieldCheck, Truck, Undo2, Wallet } from "lucide-react";

const POINTS = [
  { icon: Truck, title: "Fast delivery", body: "1–2 days inside Dhaka, 2–4 days across Bangladesh." },
  { icon: Wallet, title: "Cash on delivery", body: "Pay when your kit arrives. Payment options are shown at checkout." },
  { icon: Undo2, title: "7-day returns", body: "Unused items with tags can be returned within 7 days." },
  { icon: ShieldCheck, title: "Quality-checked", body: "Every jersey, trouser and accessory is checked before it ships." },
];

export default function BrandStory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <h2 className="max-w-2xl text-3xl md:text-5xl">Built for the game. Made for Bangladesh.</h2>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map((point) => (
          <li key={point.title} className="rounded-2xl border border-border bg-card p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <point.icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-lg">{point.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{point.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
