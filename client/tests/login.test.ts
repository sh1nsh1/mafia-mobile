import { expect, test } from "@playwright/test";

// Не работает
test("Login", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByText("Имя")).toBeVisible();
});
