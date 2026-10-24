import { expect, test } from "@playwright/test";

test.describe("I18n", () => {
  test.describe("Language Switching", () => {
    test("should switch language from English to Dutch using dropdown", async ({ page }) => {
      await page.goto("/");

      await expect(
        page.getByRole("heading", {
          name: "Hello World",
        }),
      ).toBeVisible();

      await page.getByLabel("lang-switcher").selectOption("nl");

      await expect(page.getByRole("heading", { name: "Hallo wereld" })).toBeVisible();
    });

    test("should load the Dutch sign-in page from its localized URL", async ({ page }) => {
      await page.goto("/sign-in");

      await expect(page.getByText("Email address")).toBeVisible();

      await page.goto("/nl/sign-in");

      await expect(page.getByText("E-mailadres")).toBeVisible();
    });
  });
});
