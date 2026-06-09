import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CucumberWorld } from "../support/world";

Then("I should see the player slider", async function (this: CucumberWorld) {
  await expect(this.page.locator(".player-slider")).toBeVisible();
});

When("I change the player count to {int}", async function (this: CucumberWorld, count: number) {
  const slider = this.page.locator(".player-slider");
  await slider.fill(String(count));
  await slider.dispatchEvent("input");
  await this.page.waitForTimeout(200);
});

Then("I should see {int} player cards", async function (this: CucumberWorld, count: number) {
  await expect(this.page.locator(".player-card")).toHaveCount(count);
});

When("I fill player names for all players", async function (this: CucumberWorld) {
  const inputs = this.page.locator(".player-input");
  const total = await inputs.count();
  for (let i = 0; i < total; i++) {
    await inputs.nth(i).fill(`Player ${i + 1}`);
  }
});

When("I click SET SAIL without filling names", async function (this: CucumberWorld) {
  const dialogPromise = new Promise<string>((resolve) => {
    this.page.once("dialog", async (dialog) => {
      resolve(dialog.message());
      await dialog.dismiss();
    });
  });
  await this.page.getByText("SET SAIL", { exact: true }).click();
  const msg = await dialogPromise;
  expect(msg).toBe("All players must have a name");
});
