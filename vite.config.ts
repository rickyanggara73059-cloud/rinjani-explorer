import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  console.log(
    "[VITE ENV] token loaded:",
    Boolean(env.VITE_MAPBOX_ACCESS_TOKEN),
    "length:",
    env.VITE_MAPBOX_ACCESS_TOKEN?.length ?? 0
  );

  return {
    plugins: [react()],
  };
});
