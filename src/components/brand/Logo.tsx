import { cn } from "@/lib/utils";
import { Barlow_Condensed } from "next/font/google";

const barlowCondensed = Barlow_Condensed({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow-condensed",
  fallback: ["Barlow Condensed", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

export default function Logo({
  variant = "default",
}: {
  variant?: "default" | "header";
}) {
  if (variant === "header") {
    return (
      <div className="flex flex-col">
        <span
          className={cn(
            "text-xl font-bold uppercase leading-none tracking-tight md:text-2xl",
            barlowCondensed.className,
          )}
        >
          TRIO SPORTS BD
        </span>
        <span className="mt-0.5 hidden text-[10px] uppercase tracking-widest text-muted-foreground md:block">
          Sports Jerseys, Trousers &amp; Accessories
        </span>
      </div>
    );
  }

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
