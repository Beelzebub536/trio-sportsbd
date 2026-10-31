const ITEMS = [
  "Cash on delivery",
  "1–2 day delivery in Dhaka",
  "7-day returns",
  "Quality-checked kit",
  "Order help on WhatsApp",
];

/** CSS-only marquee; the duplicate half is hidden from assistive tech. */
export default function Ticker() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <li key={item} className="flex items-center gap-6 pr-6 font-display text-xl font-bold uppercase">
          {item}
          <span aria-hidden className="h-2.5 w-2.5 rotate-45 bg-primary" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="ticker overflow-hidden border-b border-border bg-white py-3">
      <div className="ticker-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
