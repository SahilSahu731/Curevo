import { defineConfig } from "@playwright/test";

const localBaseURL = "http://localhost:3100";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || localBaseURL;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "line",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "PORT=3100 npm run dev",
        url: `${localBaseURL}/_health`,
        env: {
          CLIENT_URL: localBaseURL,
          MONGO_URI:
            process.env.PLAYWRIGHT_MONGO_URI ||
            process.env.MONGO_URI ||
            "mongodb://127.0.0.1:27017/curevo_playwright",
          SESSION_SECRET:
            process.env.SESSION_SECRET ||
            "curevo-playwright-session-secret-not-for-production",
        },
        gracefulShutdown: {
          signal: "SIGTERM",
          timeout: 10_000,
        },
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
