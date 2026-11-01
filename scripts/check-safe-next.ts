// Self-check for the post-login redirect guard. Run: npm run test:security
import assert from "node:assert/strict";

import { safeNext } from "../src/lib/auth-helpers";

const allowed: Array<[string, string]> = [
  ["/checkout", "/checkout"],
  ["/account/orders?page=2#top", "/account/orders?page=2#top"],
];
const rejected = [
  "https://evil.example",
  "//evil.example",
  "/\\evil.example",
  "/\t/evil.example",
  "/\n/evil.example",
  "\\\\evil.example",
  "javascript:alert(1)",
  "",
  undefined,
  ["/checkout"],
];

for (const [input, expected] of allowed) assert.equal(safeNext(input), expected, input);
for (const input of rejected) assert.equal(safeNext(input), "/", JSON.stringify(input));
console.log(`safeNext: ${allowed.length + rejected.length} cases pass`);
