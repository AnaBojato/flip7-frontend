import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CucumberWorld } from "../support/world";

Then("I should see the search input", async function (this: CucumberWorld) {
  await expect(this.page.locator(".arc-search-input")).toBeVisible();
});

Then("I should see the empty state message", async function (this: CucumberWorld) {
  await expect(this.page.getByText("Enter a game ID to look up its match history.")).toBeVisible();
});

Then("I should see the archive footer", async function (this: CucumberWorld) {
  await expect(this.page.locator(".arc-map-footer")).toBeVisible();
});

When("I type {string} in the search input", async function (this: CucumberWorld, text: string) {
  const input = this.page.locator(".arc-search-input");
  await input.click();
  await input.fill(text);
});

When("I type invalid text in the search input", async function (this: CucumberWorld) {
  await this.page.locator(".arc-search-input").evaluate((el: HTMLInputElement) => {
    el.value = "abc";
  });
});

When("I type the created game ID in the search input", async function (this: CucumberWorld) {
  const input = this.page.locator(".arc-search-input");
  await input.click();
  await input.fill(String(this.gameId));
});

When("I click the {string} button", async function (this: CucumberWorld, text: string) {
  await this.page.locator("button").filter({ hasText: text }).first().click();
  await this.page.waitForTimeout(500);
});

Then("I should see an error message {string}", async function (this: CucumberWorld, msg: string) {
  await expect(this.page.locator(".arc-error")).toContainText(msg);
});

Then("I should see the game results", async function (this: CucumberWorld) {
  await expect(this.page.locator(".arc-winner-banner")).toBeVisible({ timeout: 8000 });
});

Then("I should see the winner banner", async function (this: CucumberWorld) {
  await expect(this.page.locator(".arc-winner-banner")).toBeVisible();
});

Then("I should see the round history", async function (this: CucumberWorld) {
  await expect(this.page.locator(".arc-rounds-panel")).toBeVisible();
});

Then("I should see the top 3 podium", async function (this: CucumberWorld) {
  await expect(this.page.locator(".arc-top3-card")).toHaveCount(3);
});

When("I press Enter", async function (this: CucumberWorld) {
  await this.page.locator(".arc-search-input").press("Enter");
  await this.page.waitForTimeout(1000);
});

Given("I create a game via API", async function (this: CucumberWorld) {
  const response = await fetch("http://localhost:8080/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerNames: ["Luffy", "Zoro", "Nami", "Sanji"] }),
  });
  const game = await response.json();
  this.gameId = game.id;
});
