import { test, expect } from "@playwright/test";

function mockAuthResponse(overrides?: Record<string, unknown>) {
  return {
    token: "mock-jwt-token-abc123",
    refreshToken: "mock-refresh-token-xyz",
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    user: {
      id: "user-e2e-001",
      email: "e2e@simracing.test",
      firstName: "E2E",
      lastName: "Tester",
      language: "en",
      emailVerified: true,
      roles: ["Customer"],
    },
    ...overrides,
  };
}

test.describe("Auth Flow: Register -> Login -> Logout", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start clean
    await page.goto("/en");
    await page.evaluate(() => localStorage.clear());
  });

  test("complete authentication lifecycle", async ({ page }) => {
    // Set up API route intercepts
    await page.route("**/api/auth/register", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAuthResponse()),
      });
    });

    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAuthResponse()),
      });
    });

    await page.route("**/api/auth/logout", async (route) => {
      await route.fulfill({ status: 200, body: "" });
    });

    // ====== STEP 1: Register ======
    await page.goto("/en/register");
    await expect(
      page.getByRole("heading", { name: "Create Account" })
    ).toBeVisible();

    // Fill the registration form
    await page.getByLabel("First Name").fill("E2E");
    await page.getByLabel("Last Name").fill("Tester");
    await page.getByPlaceholder("Enter your email").fill("e2e@simracing.test");
    await page.getByPlaceholder("Create a password").fill("SecurePass1");
    await page.getByPlaceholder("Confirm your password").fill("SecurePass1");

    // Accept terms checkbox
    await page.locator("#acceptTerms").click();

    // Submit registration
    await page.getByRole("button", { name: "CREATE ACCOUNT" }).click();

    // ====== STEP 2: Verify redirect to home after register ======
    await page.waitForURL("**/en");
    await expect(page.getByText("Welcome, E2E")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Log Out" })
    ).toBeVisible();

    // ====== STEP 3: Verify auth redirect guard ======
    // Navigate to /en/login — should redirect back to home because authenticated
    await page.goto("/en/login");
    await page.waitForURL("**/en");
    await expect(page.getByText("Welcome, E2E")).toBeVisible();

    // ====== STEP 4: Logout ======
    await page.getByRole("button", { name: "Log Out" }).click();

    // Verify logged out state
    await expect(
      page.getByRole("link", { name: "Sign In" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create Account" })
    ).toBeVisible();

    // ====== STEP 5: Navigate to login — should show form now ======
    await page.goto("/en/login");
    await expect(
      page.getByRole("heading", { name: "Welcome Back" })
    ).toBeVisible();

    // ====== STEP 6: Login ======
    await page.getByLabel("Email").fill("e2e@simracing.test");
    await page.getByLabel("Password").fill("SecurePass1");
    await page.getByRole("button", { name: "SIGN IN" }).click();

    // ====== STEP 7: Verify redirect to home after login ======
    await page.waitForURL("**/en");
    await expect(page.getByText("Welcome, E2E")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Log Out" })
    ).toBeVisible();
  });
});
