import { expect, test } from "@playwright/test";

const baseURL = "http://localhost:3000";
const pages = [
  "/",
  "/products",
  "/products?q=headphones",
  "/products/p47-wireless-headphones",
  "/cart",
  "/checkout?product=p47-wireless-headphones",
  "/account",
  "/wishlist",
  "/privacy-policy",
  "/shipping-policy",
  "/refund-and-cancellation-policy"
];

test.describe("storefront smoke", () => {
  test.setTimeout(120000);

  test("pages render without runtime overlays", async ({ page }) => {
    const pageErrors: string[] = [];
    const serverErrors: string[] = [];

    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 500) serverErrors.push(`${response.status()} ${response.url()}`);
    });

    for (const path of pages) {
      const response = await page.goto(`${baseURL}${path}`, { waitUntil: "networkidle", timeout: 60000 });
      expect(response?.ok(), path).toBeTruthy();
      await expect(page.locator("nextjs-portal")).toHaveCount(0);
      const body = await page.locator("body").innerText();
      expect(body, path).not.toContain("Runtime Error");
      expect(body, path).not.toContain("Console Error");
    }

    expect(pageErrors).toEqual([]);
    expect(serverErrors).toEqual([]);
  });

  test("header search routes to backend-backed results", async ({ page }) => {
    await page.goto(baseURL, { waitUntil: "networkidle", timeout: 60000 });
    const search = page.getByLabel("Search products");
    await expect(search).toBeVisible();
    await search.fill("headphones");
    await search.press("Enter");
    await page.waitForURL("**/products?q=headphones");
    await expect(page.getByRole("heading", { name: /Search results for "headphones"/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /P47\s+Wireless Headphones/i })).toBeVisible();
  });

  test("core shopping controls respond", async ({ page }) => {
    await page.goto(`${baseURL}/products/p47-wireless-headphones`, { waitUntil: "networkidle", timeout: 60000 });
    const addToCart = page.getByRole("button", { name: /Add to cart/i }).first();
    await expect(addToCart).toBeEnabled();
    await addToCart.click();
    await expect(page.getByText(/Variant added to cart|Added to cart/i)).toBeVisible();

    await page.getByRole("link", { name: "Cart" }).click();
    await page.waitForURL("**/cart");
    await expect(page.getByText(/P47\s+Wireless Headphones/i)).toBeVisible();
  });
});
