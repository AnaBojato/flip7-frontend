import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CucumberWorld } from "../support/world";

Then("I should see the main menu", async function (this: CucumberWorld) {
  await expect(this.page.locator(".mm-root")).toBeVisible();
});

Then("I should see the FLIP7 logo", async function (this: CucumberWorld) {
  await expect(this.page.locator(".mm-logo")).toBeVisible();
});

Then("I should see the edition stamp", async function (this: CucumberWorld) {
  await expect(this.page.locator(".mm-stamp")).toBeVisible();
});

Then("I should see the star decorations", async function (this: CucumberWorld) {
  await expect(this.page.locator(".mm-stars")).toBeVisible();
});
