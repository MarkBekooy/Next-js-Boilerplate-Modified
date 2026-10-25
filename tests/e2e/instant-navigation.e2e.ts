import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  {
    path: "/",
    from: "/about",
    link: 'header a[href="/"]',
    heading: "Hello World",
    instantHeading: true,
  },
  {
    path: "/about",
    from: "/",
    link: 'header a[href="/about"]',
    heading: "About Nextjs Starter",
    instantHeading: true,
  },
  {
    path: "/features",
    from: "/",
    link: 'header a[href="/features"]',
    heading: "Features of Nextjs Starter",
    instantHeading: true,
  },
  {
    path: "/test",
    from: "/",
    link: 'main a[href="/test"]',
    heading: "Test Page",
    instantHeading: false,
  },
  {
    path: "/privacy-policy",
    from: "/",
    link: 'footer a[href="/privacy-policy"]',
    heading: "Privacy Policy",
    instantHeading: true,
  },
  {
    path: "/terms-and-conditions",
    from: "/",
    link: 'footer a[href="/terms-and-conditions"]',
    heading: "Terms and Conditions",
    instantHeading: true,
  },
];

for (const { path, from, link, heading, instantHeading } of routes) {
  test(`${path} shows an instant shell on direct load`, async ({ page, baseURL }) => {
    await instant(
      page,
      async () => {
        await page.goto(path);
        await expect(page.getByRole("main").first()).toBeVisible();

        if (instantHeading) {
          await expect(
            page.getByRole("main").first().getByText(heading, { exact: true }),
          ).toBeVisible();
        }
      },
      { baseURL },
    );
    await expect(page.getByRole("main").first().getByText(heading, { exact: true })).toBeVisible();
  });

  test(`${path} shows an instant shell on client navigation`, async ({ page }) => {
    await page.goto(from);
    const destination = page.locator(link).first();
    await destination.waitFor({ state: "visible" });

    await instant(page, async () => {
      await destination.click();
      await page.waitForURL((url) => url.pathname === path);
      await expect(page.getByRole("main").first()).toBeVisible();

      if (instantHeading) {
        await expect(
          page.getByRole("main").first().getByText(heading, { exact: true }),
        ).toBeVisible();
      }
    });
    await expect(page.getByRole("main").first().getByText(heading, { exact: true })).toBeVisible();
  });
}
