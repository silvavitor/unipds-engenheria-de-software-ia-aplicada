import { expect, test } from "@playwright/test";

test.describe("Form submission", () => {
  test("submitting the form with valid data adds a new item to the list", async ({
    page,
  }) => {
    await page.goto("./");
    await page
      .getByRole("textbox", { name: "Image Title" })
      .fill("Unicorn Photo");
    await page
      .getByRole("textbox", { name: "Image URL" })
      .fill("https://picsum.photos/200");
    await page.getByRole("button", { name: "Submit Form" }).click();
    await expect(
      page.getByRole("heading", { name: "Unicorn Photo", level: 4 }),
    ).toBeVisible();
  });

  test("form inputs are cleared after successful submission", async ({
    page,
  }) => {
    await page.goto("./");
    await page
      .getByRole("textbox", { name: "Image Title" })
      .fill("Unicorn Photo");
    await page
      .getByRole("textbox", { name: "Image URL" })
      .fill("https://picsum.photos/200");
    await page.getByRole("button", { name: "Submit Form" }).click();
    await expect(
      page.getByRole("textbox", { name: "Image Title" }),
    ).toHaveValue("");
    await expect(page.getByRole("textbox", { name: "Image URL" })).toHaveValue(
      "",
    );
  });
});

test.describe("Form validation", () => {
  test("shows both validation errors when submitting an empty form", async ({
    page,
  }) => {
    await page.goto("./");
    await page.getByRole("button", { name: "Submit Form" }).click();
    await expect(
      page.getByText("Please type a title for the image."),
    ).toBeVisible();
    await expect(page.getByText("Please type a valid URL")).toBeVisible();
  });

  test("shows only URL error when submitting with title but no URL", async ({
    page,
  }) => {
    await page.goto("./");
    await page.getByRole("textbox", { name: "Image Title" }).fill("Some Title");
    await page.getByRole("button", { name: "Submit Form" }).click();
    await expect(
      page.getByText("Please type a title for the image."),
    ).not.toBeVisible();
    await expect(page.getByText("Please type a valid URL")).toBeVisible();
  });

  test("shows URL validation error for an invalid URL format", async ({
    page,
  }) => {
    await page.goto("./");
    await page.getByRole("textbox", { name: "Image Title" }).fill("Some Title");
    await page
      .getByRole("textbox", { name: "Image URL" })
      .fill("not-a-valid-url");
    await page.getByRole("button", { name: "Submit Form" }).click();
    await expect(page.getByText("Please type a valid URL")).toBeVisible();
  });

  test("does not add an item to the list when form has validation errors", async ({
    page,
  }) => {
    await page.goto("./");
    const initialCount = await page.getByRole("article").count();
    await page.getByRole("button", { name: "Submit Form" }).click();
    await expect(page.getByRole("article")).toHaveCount(initialCount);
  });
});
