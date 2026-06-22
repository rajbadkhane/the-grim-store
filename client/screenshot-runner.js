const { chromium } = require("@playwright/test");

(async () => {
  let browser;
  try {
    console.log("Launching Chromium...");
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    
    // Inject auth status cookie to bypass login redirection gates on /wishlist and /checkout
    await context.addCookies([
      {
        name: "grim_auth_status",
        value: "true",
        domain: "localhost",
        path: "/"
      }
    ]);

    const page = await context.newPage();

    console.log("Visiting homepage...");
    await page.goto("http://localhost:3000/");
    await page.waitForTimeout(3500); // Wait for Next.js hydration and images
    await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity-ide/brain/0d5718d6-393b-4e9d-ad5d-9db54c3b1438/screenshot_home.png" });

    // Get a product link from the page to test the PDP
    const productLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href^='/products/']"));
      return links.length ? links[0].getAttribute("href") : null;
    });

    if (productLink) {
      console.log(`Visiting product page: ${productLink}`);
      await page.goto(`http://localhost:3000${productLink}`);
      await page.waitForTimeout(3500);
      await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity-ide/brain/0d5718d6-393b-4e9d-ad5d-9db54c3b1438/screenshot_pdp.png" });
    } else {
      console.log("No product link found. Visiting /products...");
      await page.goto("http://localhost:3000/products");
      await page.waitForTimeout(3500);
      await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity-ide/brain/0d5718d6-393b-4e9d-ad5d-9db54c3b1438/screenshot_products.png" });
    }

    console.log("Visiting login...");
    await page.goto("http://localhost:3000/login");
    await page.waitForTimeout(3500);
    await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity-ide/brain/0d5718d6-393b-4e9d-ad5d-9db54c3b1438/screenshot_login.png" });

    console.log("Visiting cart...");
    await page.goto("http://localhost:3000/cart");
    await page.waitForTimeout(3500);
    await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity-ide/brain/0d5718d6-393b-4e9d-ad5d-9db54c3b1438/screenshot_cart.png" });

    console.log("Visiting wishlist...");
    await page.goto("http://localhost:3000/wishlist");
    await page.waitForTimeout(3500);
    await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity-ide/brain/0d5718d6-393b-4e9d-ad5d-9db54c3b1438/screenshot_wishlist.png" });

    console.log("Visiting checkout...");
    await page.goto("http://localhost:3000/checkout");
    await page.waitForTimeout(4500);
    await page.screenshot({ path: "C:/Users/hp/.gemini/antigravity-ide/brain/0d5718d6-393b-4e9d-ad5d-9db54c3b1438/screenshot_checkout.png" });

    console.log("Screenshots captured successfully!");
  } catch (err) {
    console.error("Playwright failed:", err);
  } finally {
    if (browser) await browser.close();
  }
})();
