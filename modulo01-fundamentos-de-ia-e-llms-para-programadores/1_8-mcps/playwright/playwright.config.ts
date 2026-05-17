import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 5000,
  use: {
    baseURL: "https://erickwendel.github.io/vanilla-js-web-app-example/",
    browserName: "chromium",
  },
  reporter: [["html", { open: "never" }]],
});
