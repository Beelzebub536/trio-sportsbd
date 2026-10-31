import { ShieldCheck, Truck, Undo2, Wallet } from "lucide-react";

const POINTS = [
  { icon: Truck, title: "Fast delivery", body: "1–2 days inside Dhaka, 2–4 days across Bangladesh." },
  { icon: Wallet, title: "Cash on delivery", body: "Pay when your kit arrives. Payment options are shown at checkout." },
  { icon: Undo2, title: "7-day returns", body: "Unused items with tags can be returned within 7 days." },
  { icon: ShieldCheck, title: "Quality-checked", body: "Every jersey, trouser and accessory is checked before it ships." },
];

export default function BrandStory() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <h2 className="text-5xl md:text-6xl">Built for the game. Made for Bangladesh.</h2>
          <p className="mt-5 max-w-md text-base text-muted-foreground">
            Match-day jerseys, training trousers and everyday accessories for players and fans,
            with honest prices and delivery you can rely on.
          </p>
        </div>

        <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
          {POINTS.map((point) => (
            <li key={point.title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <point.icon className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h3 className="text-2xl">{point.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{point.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
