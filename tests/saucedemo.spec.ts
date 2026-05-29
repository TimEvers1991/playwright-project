import { test, expect, Page } from "@playwright/test";

/**************************************************
 * Helper functions
 **************************************************/

// Helper function logging in
async function login(page: Page) {
  await page.goto("https://www.saucedemo.com/");
  await page.getByPlaceholder("Username").fill("standard_user");
  await page.getByPlaceholder("Password").fill("secret_sauce");
  await page.getByRole("button", { name: "Login" }).click();
}

/**************************************************
 * Tests
 **************************************************/
test.describe("Saucedemo logging in & shopping flow", () => {
  test("Test 1 - Login page works correctly", async ({ page }) => {
    // Go to login page
    await page.goto("https://www.saucedemo.com/");
    // Verify you're on title page
    await expect(page).toHaveTitle("Swag Labs");

    // Verifiy login elements are visible
    await expect(page.getByPlaceholder("Username")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  test("Test 2 - Logging in", async ({ page }) => {
    await page.goto("https://www.saucedemo.com/");

    // Fill in accepted Username and Password
    await page.getByPlaceholder("Username").fill("standard_user");
    await page.getByPlaceholder("Password").fill("secret_sauce");

    // Click on Login button
    await page.getByRole("button", { name: "Login" }).click();

    // Verify you're on the inventory page
    await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");
    await expect(page.locator(".title")).toHaveText("Products");
  });

  test("Test 3 - invalid login", async ({ page }) => {
    await page.goto("https://www.saucedemo.com/");

    // Enter wrong credentials
    await page.getByPlaceholder("Username").fill("wrong_username");
    await page.getByPlaceholder("Password").fill("wrong_password");
    // Click on login button
    await page.getByRole("button", { name: "Login" }).click();

    // Verify error message appears AND cUsername and password do not match any user in this service'
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(
      "Epic sadface: Username and password do not match any user in this service",
    );
    await expect(page).not.toHaveURL(
      "https://www.saucedemo.com/inventory.html",
    );
  });

  test("Test 4- verify that products are visible", async ({ page }) => {
    // using logging in helper
    await login(page);
    // checking if the first item is visible
    await expect(page.locator(".inventory_item").first()).toBeVisible();
    // checking title of page is 'Products'
    await expect(page.locator(".title")).toHaveText("Products");
  });

  test("Test 5 - Add item to cart", async ({ page }) => {
    // Arrange: login
    await login(page);

    // Act first product to cart
    await page
      .locator(".inventory_item")
      .first()
      .getByRole("button", { name: "Add to cart" })
      .click();

    // Assert: cart badge shows 1
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
  });

  test("Test 6 - Remove item from cart", async ({ page }) => {
    // Arrange: login
    await login(page);

    // Arrange: first product to cart
    await page
      .locator(".inventory_item")
      .first()
      .getByRole("button", { name: "Add to cart" })
      .click();

    // Act: remove first product from cart
    await page
      .locator(".inventory_item")
      .first()
      .getByRole("button", { name: "Remove" })
      .click();

    // Assert: cart badge shows 0
    await expect(page.locator(".shopping_cart_badge")).not.toBeVisible();
  });

  /**************************************************
   * Complete happy path checkout flow
   **************************************************/
  test("Test 7 - Complete happy path checkout flow", async ({ page }) => {
    // Login
    await page.goto("https://www.saucedemo.com/");
    await page.getByPlaceholder("Username").fill("standard_user");
    await page.getByPlaceholder("Password").fill("secret_sauce");
    await page.getByRole("button", { name: "Login" }).click();

    // Inventory - product overview
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(page.getByText("Products")).toBeVisible();
    await expect(page.locator(".inventory_item").first()).toBeVisible();

    // Add product to cart
    await page
      .locator(".inventory_item")
      .first()
      .getByRole("button", { name: "Add to cart" })
      .click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");

    // Cart - cart state is correct
    await page.locator(".shopping_cart_link").click();
    await expect(page).toHaveURL(/cart\.html$/);
    await expect(page.locator(".cart_item")).toHaveCount(1);

    // Checkout step one - customer information
    await page.getByRole("button", { name: "Checkout" }).click();
    await expect(page).toHaveURL(/checkout-step-one\.html$/);

    await page.getByPlaceholder("First Name").fill("Hee");
    await page.getByPlaceholder("Last Name").fill("Yoo");
    await page.getByPlaceholder("Zip/Postal Code").fill("3584BH");
    await page.getByRole("button", { name: "Continue" }).click();

    // Checkout step two - checkout overview
    await expect(page).toHaveURL(/checkout-step-two\.html$/);
    await expect(page.locator(".cart_item")).toHaveCount(1);

    // Finish - complete order
    await page.getByRole("button", { name: "Finish" }).click();
    await expect(page).toHaveURL(/checkout-complete\.html$/);
    await expect(page.getByText("Thank you for your order")).toBeVisible();
  });
});
