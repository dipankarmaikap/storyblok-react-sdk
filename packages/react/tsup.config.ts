import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
    },
    format: ["esm"],
    dts: true,
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  {
    entry: {
      client: "src/client.ts",
    },
    format: ["esm"],
    dts: true,
    banner: {
      js: "'use client';",
    },
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
]);