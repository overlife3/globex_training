import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  const isProduction = mode === "production";

  return defineConfig({
    plugins: [react()],
    base: isProduction
      ? "/globex_training/web-templates/frontend/source/dist"
      : "/",
  });
};
