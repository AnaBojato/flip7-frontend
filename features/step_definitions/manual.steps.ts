import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CucumberWorld } from "../support/world";

Then("I should see the manual title {string}", async function (this: CucumberWorld, title: string) {
  await expect(this.page.locator(".manual-title")).toContainText(title);
});

Then("I should see {string} section", async function (this: CucumberWorld, section: string) {
  await expect(this.page.getByText(section, { exact: true })).toBeVisible();
});

Then("I should see the back button", async function (this: CucumberWorld) {
  await expect(this.page.locator("button").filter({ hasText: "BACK" })).toBeVisible();
});

Then("I should see manual section components", async function (this: CucumberWorld) {
  await expect(this.page.locator(".manual-section")).toHaveCount(5);
});

Then("I should see rule card components", async function (this: CucumberWorld) {
  await expect(this.page.locator(".rule-card")).toHaveCount(4);
});

Then("I should see game card components", async function (this: CucumberWorld) {
  await expect(this.page.locator(".game-card")).toHaveCount(7);
});

Then("I should see the victory panel", async function (this: CucumberWorld) {
  await expect(this.page.locator(".victory-panel")).toBeVisible();
});

Then("I should see the manual stats", async function (this: CucumberWorld) {
  await expect(this.page.locator(".manual-stats")).toBeVisible();
});
