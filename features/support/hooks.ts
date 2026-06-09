import { BeforeAll, AfterAll, Before, After, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, type Browser } from "playwright";
import * as fs from "fs";
import * as path from "path";
import type { CucumberWorld } from "./world";

setDefaultTimeout(120000);

const coverageDir = path.resolve(".nyc_output");
const coverageFile = path.join(coverageDir, "coverage.json");
const globalCoverage: Record<string, unknown> = {};
let sharedBrowser: Browser;

BeforeAll(async function () {
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
  sharedBrowser = await chromium.launch({ headless: true });
});

AfterAll(async function () {
  fs.writeFileSync(coverageFile, JSON.stringify(globalCoverage), "utf-8");
  if (sharedBrowser) await sharedBrowser.close();
});

Before(async function (this: CucumberWorld) {
  this.browser = sharedBrowser;
  this.context = await sharedBrowser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  this.page = await this.context.newPage();

  await this.page.route("**/*.mp4", route => route.abort());
  await this.page.route("**/*.webm", route => route.abort());

  await this.page.coverage.startJSCoverage();
});

After(async function (this: CucumberWorld) {
  if (this.page) {
    try {
      const coverage = await this.page.coverage.stopJSCoverage();

      const { default: V8ToIstanbul } = await import("v8-to-istanbul");

      for (const entry of coverage) {
        if (!entry.url.startsWith("http://localhost:5173/src/")) continue;

        const urlPath = new URL(entry.url).pathname;
        const fullPath = path.join(
          "/Users/juanjosemedinaclavijo/molina/flip7-frontend",
          urlPath
        );

        try {
          const converter = V8ToIstanbul(fullPath, 0, { source: entry.source });
          await converter.load();
          converter.applyCoverage(entry.functions);
          const result = converter.toIstanbul();
          const fileCov = result[fullPath];
          if (!fileCov) continue;

          const existing = globalCoverage[fullPath] as Record<string, unknown> | undefined;
          if (existing) {
            const existingS = existing.s as Record<string, number>;
            const newS = fileCov.s as Record<string, number>;
            for (const [stmtId, count] of Object.entries(newS)) {
              existingS[stmtId] = (existingS[stmtId] ?? 0) + count;
            }
            const existingB = existing.b as Record<string, number[]>;
            const newB = fileCov.b as Record<string, number[]>;
            if (newB) {
              for (const [branchId, counts] of Object.entries(newB)) {
                if (!existingB[branchId]) {
                  existingB[branchId] = counts;
                } else {
                  for (let i = 0; i < counts.length; i++) {
                    existingB[branchId][i] = (existingB[branchId][i] ?? 0) + counts[i];
                  }
                }
              }
            }
            const existingF = existing.f as Record<string, number>;
            const newF = fileCov.f as Record<string, number>;
            if (newF) {
              for (const [fnId, count] of Object.entries(newF)) {
                existingF[fnId] = (existingF[fnId] ?? 0) + count;
              }
            }
          } else {
            globalCoverage[fullPath] = fileCov;
          }
        } catch {
          // Skip entries that fail to convert
        }
      }
    } catch {
      // Coverage not available
    }
    try { await this.page.close(); } catch { /* page already closed */ }
  }
  if (this.context) { try { await this.context.close(); } catch { /* context already closed */ } }
});