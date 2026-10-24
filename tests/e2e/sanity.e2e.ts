import { expect, test } from "@playwright/test";

test.describe("Sanity", () => {
  test.describe("Static pages", () => {
    test("should display the homepage", async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/`);

      await expect(
        page.getByRole("heading", {
          name: "Boilerplate Code for Your Next.js Project with Tailwind CSS",
        }),
      ).toBeVisible();
    });

    test("should navigate to the about page", async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/`);

      await page.getByRole("link", { name: "About" }).click();

      await expect(page).toHaveURL(/about$/u);

      await expect(page.getByText("Welcome to our About page", { exact: false })).toBeVisible();
    });

    test("should navigate to the portfolio page", async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/`);

      await page.getByRole("link", { name: "Portfolio" }).click();

      await expect(page).toHaveURL(/portfolio$/u);

      await expect(page.locator("main").getByRole("link", { name: /^Portfolio/u })).toHaveCount(6);
    });
  });
});
