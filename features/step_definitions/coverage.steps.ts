import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CucumberWorld } from "../support/world";

When("I exercise gameService library functions", async function (this: CucumberWorld) {
  const createRes = await fetch("http://localhost:8080/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerNames: ["Luffy", "Zoro", "Nami", "Sanji"] }),
  });
  const game = await createRes.json();

  await this.page.evaluate(async (gameId: number) => {
    const svc = await import("/src/services/gameService.ts");
    const cards = await import("/src/utils/cardImages.ts");

    // Exercise service functions with valid IDs
    const players = await svc.getPlayers(gameId);
    const hand = await svc.getPlayerHand(gameId, players[0].id);
    const info = await svc.getGameInfo(gameId);
    const history = await svc.getGameHistory(gameId);

    // Error branches: call with non-existent game ID
    try { await svc.getGameInfo(999999); } catch { /* expected */ }
    try { await svc.getGameHistory(999999); } catch { /* expected */ }

    // sendFreeze / sendFlipThree with wrong player ID
    try { await svc.sendFreeze(gameId, 999, 1); } catch { /* expected */ }
    try { await svc.sendFlipThree(gameId, 999, 1); } catch { /* expected */ }

    // Exercise all special card image paths
    cards.getCardImage("FREEZE");
    cards.getCardImage("SECOND_CHANCE");
    cards.getCardImage("MULTIPLIER");
    cards.getCardImage("FLIP_THREE");
    cards.getCardImage("UNKNOWN_TYPE");
  }, game.id);
});

When("I call sendFreeze and sendFlipThree at wrong times", async function (this: CucumberWorld) {
  await this.page.evaluate(async (gameId: number) => {
    const svc = await import("/src/services/gameService.ts");
    try { await svc.sendFreeze(gameId, 999, 1); } catch { /* expected */ }
    try { await svc.sendFlipThree(gameId, 999, 1); } catch { /* expected */ }
  }, this.gameId);
});

Then("I should still see the main menu", async function (this: CucumberWorld) {
  await this.page.waitForSelector(".mm-ui", { timeout: 5000 });
});

Then("I should see the game page", async function (this: CucumberWorld) {
  await this.page.waitForSelector(".game-page", { timeout: 5000 });
});

When("I expand the round accordion", async function (this: CucumberWorld) {
  const header = this.page.locator(".arc-round-header").first();
  await header.click();
  await this.page.waitForTimeout(500);
});

Then("I should see the round details", async function (this: CucumberWorld) {
  await expect(this.page.locator(".arc-round-body")).toBeVisible({ timeout: 5000 });
});