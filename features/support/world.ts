import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "playwright";

export interface CucumberWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  baseUrl: string;
  gameId: number;
}

class PlaywrightWorld extends World implements CucumberWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  baseUrl = "http://localhost:5173";
  gameId = 0;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(PlaywrightWorld);
