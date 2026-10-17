import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const projectRoot = process.cwd();
const appRoot = join(projectRoot, "src", "app");

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const routeFiles = walk(appRoot).filter((path) => path.endsWith(`${sep}page.tsx`));
const routePatterns = routeFiles.map((path) => {
  const relativePath = relative(appRoot, path).split(sep).slice(0, -1);
  const segments = relativePath.filter(
    (segment) => !(segment.startsWith("(") && segment.endsWith(")")),
  );
  return new RegExp(
    `^/${segments
      .map((segment) => (segment.startsWith("[") ? "[^/]+" : segment))
      .join("/")}/?$` .replace("^//", "^/"),
  );
});

const sources = [
  "src/components/layout/SiteHeader.tsx",
  "src/components/layout/Footer.tsx",
  "src/components/layout/MobileMenu.tsx",
  "src/components/layout/CartSheet.tsx",
  "src/components/layout/SearchOverlay.tsx",
  "src/app/(store)/product/[slug]/page.tsx",
  "src/lib/nav.ts",
];
const failures = [];
for (const sourcePath of sources) {
  const source = readFileSync(join(projectRoot, sourcePath), "utf8");
  const literalPaths = [...source.matchAll(/["'](\/[^"'`$]*)["']/g)].map(
    (match) => match[1].split("?")[0],
  );
  for (const route of new Set(literalPaths)) {
    if (!routePatterns.some((pattern) => pattern.test(route))) {
      failures.push(`${sourcePath}: ${route}`);
    }
  }
  if (
    sourcePath.endsWith("SiteHeader.tsx") ||
    sourcePath.endsWith("MobileMenu.tsx") ||
    sourcePath.endsWith("product/[slug]/page.tsx")
  ) {
    if (source.includes("/${child.slug}")) {
      failures.push(`${sourcePath}: category links must use the /shop route`);
    }
    if (source.includes("child.slug") && !source.includes("/shop?category=")) {
      failures.push(`${sourcePath}: category links must target /shop?category=`);
    }
  }
}

if (!routePatterns.some((pattern) => pattern.test("/product/test-slug"))) {
  failures.push("Dynamic product links have no matching product route.");
}

if (failures.length) {
  console.error("Broken internal storefront links:\n" + failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Storefront header, footer, and mobile menu links match app routes.");
}
