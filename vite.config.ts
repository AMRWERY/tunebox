import { fileURLToPath, URL } from "node:url";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";
import Components from "unplugin-vue-components/vite";
import { VueUseComponentsResolver } from "unplugin-vue-components/resolvers";
import AutoImport from "unplugin-auto-import/vite";

// Injects the list of built files into dist/sw.js so it can precache them.
const precacheManifest = (): Plugin => {
  let files: string[] = [];
  let outDir = "dist";
  return {
    name: "tunebox-precache",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    generateBundle(_, bundle) {
      files = Object.keys(bundle)
        .filter((f) => !f.endsWith(".map"))
        .map((f) => "/" + f)
        .sort();
    },
    closeBundle() {
      const path = resolve(outDir, "sw.js");
      const version = createHash("sha1")
        .update(files.join())
        .digest("hex")
        .slice(0, 10);
      const sw = readFileSync(path, "utf8")
        .replace("__VERSION__", version)
        .replace("/*PRECACHE*/ []", JSON.stringify(files));
      writeFileSync(path, sw);
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    precacheManifest(),
    Components({
      resolvers: [VueUseComponentsResolver()],
    }),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.vue\.[tj]sx?\?vue/, // .vue (vue-loader with experimentalInlineMatchResource enabled)
        /\.md$/, // .md
      ],

      // auto-import everything exported from these folders
      dirs: ["src/composables", "src/stores"],

      // global imports to register
      imports: [
        // presets
        "vue",
        "vue-router",
        "pinia",
        // custom
        {
          "@vueuse/core": [
            "useColorMode",
            "useDropZone",
            "useEventListener",
            "useMediaControls",
            "useStorage",
            "useNow",
            "useDateFormat",
            "useIntervalFn",
            "watchThrottled"
          ],
        },
        // example type import
        {
          from: "vue-router",
          imports: ["RouteLocationRaw"],
          type: true,
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
