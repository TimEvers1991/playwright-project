/**************************************************
 * Inloggen met UI
 **************************************************/

import { test, expect } from "@playwright/test";

test("Inloggen via de UI", async ({ page }) => {
  // 1. Navigeer naar de loginpagina
  await page.goto("https://practice.expandtesting.com/login");

  // 2. Login
  await page.locator("#username").fill("practice");
  await page.locator("#password").fill("SuperSecretPassword!");
  await page.getByRole("button", { name: "Login" }).click();

  // 3. Verifieer dat het inloggen is geslaagd
  await expect(page).toHaveURL(/.*secure/);
  await expect(page.locator(".alert-success")).toContainText(
    "You logged into a secure area!",
  );
});
