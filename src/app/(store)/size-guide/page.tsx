import type { Metadata } from "next";
import Link from "next/link";

import StaticPage from "@/components/layout/StaticPage";

export const metadata: Metadata = {
  title: "Size guide",
  description: "Find your fit for jerseys, track pants and shorts.",
};

const APPAREL = [
  { size: "XS", chest: "34–36", waist: "28–30", height: "160–165 cm" },
  { size: "S", chest: "36–38", waist: "30–32", height: "165–170 cm" },
  { size: "M", chest: "38–40", waist: "32–34", height: "170–175 cm" },
  { size: "L", chest: "40–42", waist: "34–36", height: "175–180 cm" },
  { size: "XL", chest: "42–44", waist: "36–38", height: "180–185 cm" },
  { size: "XXL", chest: "44–46", waist: "38–40", height: "185–190 cm" },
];

const KIDS = [
  { size: "XS", age: "4–5 yrs", chest: "22–24", height: "100–110 cm" },
  { size: "S", age: "6–7 yrs", chest: "24–26", height: "110–120 cm" },
  { size: "M", age: "8–9 yrs", chest: "26–28", height: "120–130 cm" },
  { size: "L", age: "10–11 yrs", chest: "28–30", height: "130–140 cm" },
];

export default function SizeGuidePage() {
  return (
    <StaticPage
      title="Size guide"
      intro="Measurements are in inches unless stated otherwise."
    >
      <h2>How to measure</h2>
      <ul>
        <li>
          <strong>Chest:</strong> measure around the fullest part of your chest,
          keeping the tape level.
        </li>
        <li>
          <strong>Waist:</strong> measure around your natural waistline, not
          over clothing.
        </li>
      </ul>

      <h2>Adult tops (jerseys)</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-foreground">
              <th className="py-2 pr-4">Size</th>
              <th className="py-2 pr-4">Chest (in)</th>
              <th className="py-2 pr-4">Waist (in)</th>
              <th className="py-2">Height</th>
            </tr>
          </thead>
          <tbody>
            {APPAREL.map((row) => (
              <tr key={row.size} className="border-b border-border">
                <td className="py-2 pr-4 font-bold text-foreground">{row.size}</td>
                <td className="py-2 pr-4">{row.chest}</td>
                <td className="py-2 pr-4">{row.waist}</td>
                <td className="py-2">{row.height}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Kids</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-foreground">
              <th className="py-2 pr-4">Size</th>
              <th className="py-2 pr-4">Age</th>
              <th className="py-2 pr-4">Chest (in)</th>
              <th className="py-2">Height</th>
            </tr>
          </thead>
          <tbody>
            {KIDS.map((row) => (
              <tr key={row.size} className="border-b border-border">
                <td className="py-2 pr-4 font-bold text-foreground">{row.size}</td>
                <td className="py-2 pr-4">{row.age}</td>
                <td className="py-2 pr-4">{row.chest}</td>
                <td className="py-2">{row.height}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Track pants and shorts</h2>
      <p>
        Trousers follow the waist measurements above and have an elasticated
        waistband with a drawcord, so they fit a small range around each size. If
        you are between sizes, choose the larger one.
      </p>

      <h2>Still unsure?</h2>
      <p>
        Message us on WhatsApp before ordering and we will recommend a size
        based on your measurements. See <Link href="/contact">contact us</Link>.
      </p>
    </StaticPage>
  );
}
