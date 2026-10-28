import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

const locales: ("en" | "nl")[] = ["en", "nl"];

const routes = [
  {
    path: "/",
    from: "/about",
    container: "header",
    heading: { en: "Hello World", nl: "Hallo wereld" },
    instantHeading: true,
  },
  {
    path: "/about",
    from: "/",
    container: "header",
    heading: { en: "About Nextjs Starter", nl: "Over Nextjs Starter" },
    instantHeading: true,
  },
  {
    path: "/features",
    from: "/",
    container: "header",
    heading: {
      en: "Features of Nextjs Starter",
      nl: "Functies van Nextjs Starter",
    },
    instantHeading: true,
  },
  {
    path: "/test",
    from: "/",
    container: "main",
    heading: { en: "Test Page", nl: "Test Page" },
    instantHeading: false,
  },
  {
    path: "/privacy-policy",
    from: "/",
    container: "footer",
    heading: { en: "Privacy Policy", nl: "Privacybeleid" },
    instantHeading: true,
  },
  {
    path: "/terms-and-conditions",
    from: "/",
    container: "footer",
    heading: { en: "Terms and Conditions", nl: "Algemene voorwaarden" },
    instantHeading: true,
  },
  {
    path: "/blog",
    from: "/",
    container: "header",
    heading: { en: "Blog", nl: "Blog" },
    instantHeading: true,
  },
  {
    path: "/blog/hello-world",
    from: "/blog",
    container: "main",
    heading: { en: "Hello world with MDX", nl: "Hello world with MDX" },
    instantHeading: true,
  },
];

for (const locale of locales) {
  for (const route of routes) {
    const prefix = locale === "nl" ? "/nl" : "";
    const path = `${prefix}${route.path === "/" ? "" : route.path}` || "/";
    const from = `${prefix}${route.from === "/" ? "" : route.from}` || "/";
    const link = `${route.container} a[href="${path}"]`;
    const heading = route.heading[locale];
    const { instantHeading } = route;
    test(`${path} shows an instant shell on direct load`, async ({
      page,
      baseURL,
    }) => {
      await instant(
        page,
        async () => {
          await page.goto(path);
          await expect(page.getByRole("main").first()).toBeVisible();

          if (instantHeading) {
            await expect(
              page.getByRole("main").first().getByText(heading, { exact: true })
            ).toBeVisible();
          }
        },
        { baseURL }
      );
      await expect(
        page.getByRole("main").first().getByText(heading, { exact: true })
      ).toBeVisible();
    });

    test(`${path} shows an instant shell on client navigation`, async ({
      page,
    }) => {
      await page.goto(from);
      const destination = page.locator(link).first();
      await destination.waitFor({ state: "visible" });

      await instant(page, async () => {
        await destination.click();
        await page.waitForURL((url) => url.pathname === path);
        await expect(page.getByRole("main").first()).toBeVisible();

        if (instantHeading) {
          await expect(
            page.getByRole("main").first().getByText(heading, { exact: true })
          ).toBeVisible();
        }
      });
      await expect(
        page.getByRole("main").first().getByText(heading, { exact: true })
      ).toBeVisible();
    });
  }
}
