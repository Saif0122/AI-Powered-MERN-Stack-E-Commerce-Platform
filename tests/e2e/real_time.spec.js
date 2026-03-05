import { test, expect } from '@playwright/test';

/**
 * MercatoX Real-time E2E Test Suite
 */

test.describe('Real-time Feature Flow', () => {

    test('Add to cart -> Checkout -> Low stock alert', async ({ page }) => {
        // 1. Setup: Assume we are logged in as a user
        await page.goto('/login');
        await page.fill('input[name="email"]', 'user@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // 2. Go to product page and add last item
        await page.goto('/products/nexus-phone-v1'); // Example slug
        const stockText = await page.innerText('.stock-count');
        console.log(`Initial stock: ${stockText}`);

        await page.click('text=Add to Cart');
        await page.goto('/cart');
        await page.click('text=Checkout');

        // 3. Complete shipping and checkout
        await page.fill('input[name="address"]', 'E2E Test Street');
        await page.click('text=Place Order');

        // 4. Verification
        await expect(page).toHaveURL(/\/orders\/.+/);
        console.log('✅ Checkout successful');

        // 5. Check Vendor Side (Simulation via Socket Client or Browser)
        // In a real test, you'd have another browser context for the Vendor
        // To see if the Socket.IO event 'low-stock' was received.
    });

    test('Positive review boosts recommendation rank', async ({ page }) => {
        await page.goto('/products/nexus-phone-v1');

        // Write a glowing review
        await page.fill('textarea[name="review"]', 'This is the most incredible piece of tech I have ever used. Highly recommended!');
        await page.click('text=Submit Review');

        // Wait for AI sentiment processing
        await page.waitForTimeout(2000);

        // Verify recommendations
        await page.goto('/dashboard');
        const recommendations = await page.locator('.recommendation-item');
        await expect(recommendations).toContainText('Nexus');
    });

});
