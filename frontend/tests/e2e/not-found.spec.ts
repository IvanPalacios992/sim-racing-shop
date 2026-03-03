import { test, expect } from "@playwright/test";

test.describe("Página 404", () => {
  test("muestra la 404 en español para rutas inexistentes", async ({ page }) => {
    await page.goto("/es/favoritos");

    await expect(page.getByText("ERROR 404")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("la pista");
  });

  test("muestra la 404 en inglés para rutas inexistentes", async ({ page }) => {
    await page.goto("/en/favoritos");

    await expect(page.getByText("ERROR 404")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("track");
  });

  test("el botón 'Volver al inicio' navega a la home", async ({ page }) => {
    await page.goto("/es/no-existe");

    await page.getByRole("link", { name: /volver al inicio/i }).click();

    await expect(page).toHaveURL(/\/es\/?$/);
  });

  test("el botón 'Ver productos' navega a la página de productos", async ({ page }) => {
    await page.goto("/es/no-existe");

    await page.getByRole("link", { name: /ver productos/i }).click();

    await expect(page).toHaveURL(/\/es\/productos/);
  });
});
