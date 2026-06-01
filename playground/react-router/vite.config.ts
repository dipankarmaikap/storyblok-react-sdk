import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), mkcert()],
  resolve: {
    tsconfigPaths: true,
  },
});
