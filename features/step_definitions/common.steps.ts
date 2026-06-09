import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CucumberWorld } from "../support/world";

Given("I am on the main menu page", async function (this: CucumberWorld) {
  await this.page.goto(this.baseUrl + "/", { waitUntil: "domcontentloaded" });
  await this.page.waitForSelector(".mm-ui", { timeout: 15000 });
});

Given("I am on the manual page", async function (this: CucumberWorld) {
  await this.page.goto(this.baseUrl + "/manual", { waitUntil: "domcontentloaded" });
  await this.page.waitForSelector(".manual-page", { timeout: 15000 });
});

Given("I am on the players page", async function (this: CucumberWorld) {
  await this.page.goto(this.baseUrl + "/players", { waitUntil: "domcontentloaded" });
  await this.page.waitForSelector(".players-page", { timeout: 15000 });
});

Given("I am on the archives page", async function (this: CucumberWorld) {
  await this.page.goto(this.baseUrl + "/archives", { waitUntil: "domcontentloaded" });
  await this.page.waitForSelector(".arc-page", { timeout: 15000 });
});

Given("I navigate to the game page without a game ID", async function (this: CucumberWorld) {
  await this.page.goto(this.baseUrl + "/game", { waitUntil: "domcontentloaded" });
  await this.page.waitForSelector(".game-page", { timeout: 15000 });
});

Given("I create a game and navigate to it", async function (this: CucumberWorld) {
  await this.page.goto(this.baseUrl + "/players", { waitUntil: "domcontentloaded" });
  await this.page.waitForSelector(".players-page", { timeout: 15000 });
  const inputs = this.page.locator(".player-input");
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    await inputs.nth(i).fill(`Player ${i + 1}`);
  }
  await this.page.getByText("SET SAIL", { exact: true }).click();
  await this.page.waitForSelector(".game-page", { timeout: 30000 });
  // Store the gameId from the URL chip
  const chip = this.page.locator(".game-id-chip");
  const chipText = await chip.textContent();
  if (chipText) {
    this.gameId = parseInt(chipText.replace("#", ""), 10);
  }
});

When("I click {string}", async function (this: CucumberWorld, text: string) {
  await this.page.getByText(text, { exact: true }).click();
  await this.page.waitForTimeout(500);
});

When("I click the back button", async function (this: CucumberWorld) {
  await this.page.getByRole("button", { name: /back/i }).click();
  await this.page.waitForTimeout(500);
});

Then("I should be on the main menu page", async function (this: CucumberWorld) {
  await expect(this.page).toHaveURL(this.baseUrl + "/");
  await expect(this.page.locator(".mm-ui")).toBeVisible();
});

Then("I should be on the players page", async function (this: CucumberWorld) {
  await expect(this.page).toHaveURL(/\/(players)?$/);
  await expect(this.page.locator(".players-page")).toBeVisible();
});

Then("I should be on the archives page", async function (this: CucumberWorld) {
  await expect(this.page).toHaveURL(/\/archives/);
  await expect(this.page.locator(".arc-page")).toBeVisible();
});

Then("I should be on the manual page", async function (this: CucumberWorld) {
  await expect(this.page).toHaveURL(/\/manual/);
  await expect(this.page.locator(".manual-page")).toBeVisible();
});

Then("I should be on the game page", async function (this: CucumberWorld) {
  await expect(this.page).toHaveURL(/\/game/);
  await expect(this.page.locator(".game-page")).toBeVisible();
});

Then("I should see {string}", async function (this: CucumberWorld, text: string) {
  await expect(this.page.getByText(text, { exact: true })).toBeVisible();
});

Then("I should see the {string} button", async function (this: CucumberWorld, text: string) {
  await expect(this.page.getByText(text, { exact: true })).toBeVisible();
});
