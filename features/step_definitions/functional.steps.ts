import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CucumberWorld } from "../support/world";

// ─── Debug helper ───────────────────────────────────────────────────────

Given("I create a game and navigate to it with debug", async function (this: CucumberWorld) {
  await this.page.goto(this.baseUrl + "/players", { waitUntil: "domcontentloaded" });
  await this.page.waitForSelector(".players-page", { timeout: 15000 });

  const inputs = this.page.locator(".player-input");
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    await inputs.nth(i).fill(`Player ${i + 1}`);
  }
  await this.page.getByText("SET SAIL", { exact: true }).click();
  await this.page.waitForSelector(".game-page", { timeout: 30000 });
  await this.page.waitForTimeout(3000);

  // Debug: print current page state
  const html = await this.page.locator(".game-page").innerHTML().catch(() => "no game-page");
  console.log("GAME PAGE HTML (truncated):", html.substring(0, 2000));

  const buttons = await this.page.locator("button").allTextContents();
  console.log("BUTTONS:", JSON.stringify(buttons));

  const deckVisible = await this.page.locator(".deck-stack").isVisible().catch(() => false);
  const drawBtn = await this.page.locator("button").filter({ hasText: "Draw" }).count();
  console.log(`Deck visible: ${deckVisible}, Draw buttons: ${drawBtn}`);

  const chip = this.page.locator(".game-id-chip");
  const chipText = await chip.textContent();
  if (chipText) {
    this.gameId = parseInt(chipText.replace("#", ""), 10);
  }
});

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
