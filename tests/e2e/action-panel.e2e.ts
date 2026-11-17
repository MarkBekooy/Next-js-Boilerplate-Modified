import { expect, test } from "@playwright/test";

for (const failure of ["http", "network", "json"]) {
  test(`route handler clears pending after ${failure} failure and allows retry`, async ({
    page,
  }) => {
    let requests = 0;

    await page.route("**/api/hello", async (route) => {
      requests += 1;

      if (requests > 1) {
        await route.fulfill({ json: { message: "Retry succeeded" } });
      } else if (failure === "network") {
        await route.abort("failed");
      } else if (failure === "http") {
        await route.fulfill({ status: 500, json: { error: "Unavailable" } });
      } else {
        await route.fulfill({ contentType: "application/json", body: "{" });
      }
    });

    await page.goto("/");

    const button = page.getByRole("button", {
      name: "Invoke API endpoint (route handler)",
      exact: true,
    });

    await button.click();
    await expect(
      page.getByText("Something went wrong", { exact: true })
    ).toBeVisible();
    await expect(button).toBeEnabled();

    await button.click();
    await expect(
      page.getByText("Retry succeeded", { exact: true })
    ).toBeVisible();
    await expect(button).toBeEnabled();
    expect(requests).toBe(2);
  });
}
