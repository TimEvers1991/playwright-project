/**************************************************
 * Inloggen met API
 **************************************************/

import { test, expect } from "@playwright/test";

test("Inloggen via de API", async ({ request }) => {
  // 1. Voer het API POST-verzoek uit naar het login-endpoint
  const response = await request.post(
    "https://practice.expandtesting.com/authenticate",
    {
      form: {
        username: "practice",
        password: "SuperSecretPassword!",
      },
    },
  );

  // 2. Controleer of de API-aanroep succesvol is (Status 200 of een redirect)
  expect(response.ok()).toBeTruthy();

  // 3. Verifieer dat het inloggen is geslaagd
  const body = await response.text();
  expect(body).toContain("You logged into a secure area!");
});
