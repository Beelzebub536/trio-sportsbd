import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  // React Compiler hint added in eslint-config-next 16; the hydration/reset effects it flags are intentional.
  { rules: { "react-hooks/set-state-in-effect": "off" } },
  globalIgnores([".next/**", "out/**", "node_modules/**", "next-env.d.ts"]),
]);
