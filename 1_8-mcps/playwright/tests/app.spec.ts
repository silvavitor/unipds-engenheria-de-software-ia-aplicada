import { expect, test } from "@playwright/test";

test("home page loads and displays todos header", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/vanilla/i);
});

test("can add a new todo item", async ({ page }) => {
  await page.goto("/");
  const input = page.locator('input[type="text"]');
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator("ul li")).toContainText("Buy milk");
});
