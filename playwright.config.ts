import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure"
  },
  // Os testes funcionais rodam sem WebGL (caminho do fallback): renderizar a cena em
  // software (sem GPU) em paralelo satura a CPU do CI e gera falsos negativos.
  // A cena 3D tem um projeto próprio, serial, com WebGL ligado.
  projects: [
    {
      name: "desktop",
      testIgnore: /scene\.spec/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions: { args: ["--disable-webgl"] } }
    },
    {
      name: "mobile",
      testIgnore: /scene\.spec/,
      use: { ...devices["Pixel 7"], launchOptions: { args: ["--disable-webgl"] } }
    },
    {
      name: "webgl",
      testMatch: /scene\.spec/,
      fullyParallel: false,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }
    }
  ],
  // Roda contra o build de produção (pnpm build antes).
  webServer: {
    command: `pnpm start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
    timeout: 60_000
  }
});
