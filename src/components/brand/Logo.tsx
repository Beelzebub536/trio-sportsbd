import { cn } from "@/lib/utils";
import { Barlow_Condensed } from "next/font/google";

const barlowCondensed = Barlow_Condensed({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow-condensed",
  fallback: ["Barlow Condensed", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

export default function Logo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <h1
        className={cn(
          "text-4xl md:text-6xl font-bold uppercase tracking-tight",
          "text-black",
          barlowCondensed.className
        )}
      >
        TRIO SPORTS BD
      </h1>
      <p className="text-sm md:text-base text-gray-600 uppercase tracking-wider">
        Sports Jerseys, Trousers & Accessories
      </p>
    </div>
  );
}