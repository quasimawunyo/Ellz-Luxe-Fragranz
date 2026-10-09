import { expect, test } from "@playwright/test";

test("home page presents the brand and a shop path", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /fragrance as a private signature/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /shop now/i })).toBeVisible();
});

test("shop filters and product detail, cart persists after refresh", async ({ page }) => {
  await page.goto("/shop?q=citrus");
  await expect(page.getByRole("heading", { name: "Citrus Veil" })).toBeVisible();
  await page.getByRole("link", { name: /citrus veil/i }).first().click();
  await expect(page.getByRole("heading", { name: "Citrus Veil" })).toBeVisible();
  await page.getByRole("button", { name: /add to cart/i }).click();
  await expect(page.getByRole("link", { name: /cart, 1 item/i })).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByRole("link", { name: "Citrus Veil" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name: "Citrus Veil" })).toBeVisible();
});

test("checkout is reachable with a cart and does not fake payment", async ({ page }) => {
  await page.goto("/product/citrus-veil");
  await page.getByRole("button", { name: /add to cart/i }).click();
  await expect(page.getByRole("link", { name: /cart, 1 item/i })).toBeVisible();
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await expect(page.getByText(/paystack is not configured|initiated on the server/i)).toBeVisible();
});

test("unauthorized visitors cannot open admin", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/login/);
});
