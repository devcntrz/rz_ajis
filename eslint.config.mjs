import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Drizzle generates migrations only; it must never reach the runtime bundle
  // (PRD §2.1 rule 1 — route handlers use raw SQL via lib/pg.ts).
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}", "lib/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [
          { name: "drizzle-orm", message: "Runtime is raw SQL via lib/pg.ts (PRD §2.1). Drizzle is schema-only." },
          { name: "drizzle-orm/pg-core", message: "Runtime is raw SQL via lib/pg.ts (PRD §2.1). Drizzle is schema-only." },
        ],
        patterns: [
          { group: ["**/db/schema/**", "@/db/schema/**"], message: "db/schema is migration input, never runtime." },
        ],
      }],
    },
  },
]);

export default eslintConfig;
