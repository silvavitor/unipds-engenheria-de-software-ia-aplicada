import { expect, test } from "@playwright/test";

test("home page loads and displays todos header", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle(/TDD Frontend Example/i);
});

test("can add a new item", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("textbox", { name: "Image Title" }).fill("Test Image");
  await page
    .getByRole("textbox", { name: "Image URL" })
    .fill("https://picsum.photos/200");
  await page.getByRole("button", { name: "Submit Form" }).click();
  await expect(
    page.getByRole("heading", { name: "Test Image", level: 4 }),
  ).toBeVisible();
});
