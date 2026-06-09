import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CucumberWorld } from "../support/world";

// ─── Card dealing ───────────────────────────────────────────────────────

Then("each player should have at least one card dealt", async function (this: CucumberWorld) {
  await this.page.waitForTimeout(3000);
  const rows = this.page.locator(".lb-row");
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(4);
  for (let i = 0; i < count; i++) {
    const n = await rows.nth(i).locator(".lb-cards .lb-card").count().catch(() => 0);
    expect(n).toBeGreaterThanOrEqual(1);
  }
});

// ─── Normal Round ───────────────────────────────────────────────────────

When("I play through a normal round with draws and stands", async function (this: CucumberWorld) {
  for (let i = 0; i < 30; i++) {
    if (await this.page.locator(".round-summary-modal").isVisible().catch(() => false)) return;

    const drawBtn = this.page.locator("button").filter({ hasText: "Draw" });
    const standBtn = this.page.locator("button").filter({ hasText: "Stand" });

    const drawOk = await drawBtn.isVisible().catch(() => false);
    const standOk = await standBtn.isVisible().catch(() => false);

    if (!drawOk && !standOk) {
      await this.page.waitForTimeout(2000);
      continue;
    }

    if (i % 3 !== 2 && drawOk) {
      await drawBtn.click({ timeout: 3000, force: true });
      await this.page.waitForTimeout(4000);
    } else if (standOk) {
      await standBtn.click({ timeout: 3000, force: true });
      await this.page.waitForTimeout(3000);
    }
  }
});

Then("the round summary should show correct scores", async function (this: CucumberWorld) {
  await this.page.waitForSelector(".round-summary-modal", { timeout: 30000 });
  await this.page.waitForTimeout(1000);

  const rows = this.page.locator(".summary-row");
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(4);

  for (let i = 0; i < count; i++) {
    const cls = (await rows.nth(i).getAttribute("class")) ?? "";
    const isBust = cls.includes("summary-bust");
    const text = await rows.nth(i).locator(".summary-earned").textContent();
    if (isBust) {
      expect(text).toMatch(/Bust/i);
    } else {
      expect(text).toMatch(/\+?\d+/);
    }
  }
});

// ─── Everyone Loses ─────────────────────────────────────────────────────

When("all players draw cards until the round ends", async function (this: CucumberWorld) {
  for (let i = 0; i < 40; i++) {
    if (await this.page.locator(".round-summary-modal").isVisible().catch(() => false)) return;

    const drawBtn = this.page.locator("button").filter({ hasText: "Draw" });
    const standBtn = this.page.locator("button").filter({ hasText: "Stand" });

    if (await drawBtn.isVisible().catch(() => false)) {
      await drawBtn.click({ timeout: 3000, force: true });
      await this.page.waitForTimeout(4000);
    } else if (await standBtn.isVisible().catch(() => false)) {
      await standBtn.click({ timeout: 3000, force: true });
      await this.page.waitForTimeout(3000);
    } else {
      await this.page.waitForTimeout(2000);
    }
  }
});

Then("all players should have finished the round", async function (this: CucumberWorld) {
  await this.page.waitForSelector(".round-summary-modal", { timeout: 30000 });
  await this.page.waitForTimeout(1000);

  const rows = this.page.locator(".summary-row");
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(4);

  let busted = 0;
  let stood = 0;
  for (let i = 0; i < count; i++) {
    const cls = (await rows.nth(i).getAttribute("class")) ?? "";
    if (cls.includes("summary-bust")) busted++;
    if (cls.includes("summary-ok")) stood++;
  }

  expect(busted + stood).toBe(count);
});
