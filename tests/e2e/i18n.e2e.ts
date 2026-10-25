import { expect, test } from "@playwright/test";

test.describe("I18n", () => {
  test.describe("Language Switching", () => {
    test("should switch language from English to Dutch", async ({ page }) => {
      await page.goto("/");

      await expect(page.getByText("Hello World", { exact: true })).toBeVisible();

      await page.getByRole("combobox", { name: "Language switcher" }).click();
      await page.getByRole("option", { name: "Nederlands" }).click();

      await expect(page.getByText("Hallo wereld", { exact: true })).toBeVisible();
    });

    test("should load the Dutch sign-in page from its localized URL", async ({ page }) => {
      await page.goto("/sign-in");

      await expect(page.getByText("Email address")).toBeVisible();

      await page.goto("/nl/sign-in");

      await expect(page.getByText("E-mailadres")).toBeVisible();
    });
  });
});
