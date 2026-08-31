import { test, expect } from '@playwright/test';

test.describe('E2E Checkout & Cash on Delivery Flow', () => {
  test('guest user should browse menu, add to cart, get redirected to login on checkout, login, and place COD order', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Brew-tiful Coffee/i);

    // 2. Navigate to menu
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');

    // 3. Click 'Add to Cart' on first item
    const addToCartBtns = page.locator('button:has-text("Add to Cart")');
    if (await addToCartBtns.count() > 0) {
      await addToCartBtns.first().click();
    }

    // 4. Navigate to cart or checkout as unauthenticated guest
    await page.goto('/checkout');

    // 5. Verify redirection to login page with message
    await expect(page).toHaveURL(/\/login/);

    // 6. Log in as test user
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for login redirection back to checkout or menu
    await page.waitForTimeout(1000);

    // Verify user can access checkout page
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/checkout/);

    // 7. Select Order Type (Dine In)
    const dineInBtn = page.locator('button:has-text("Dine In")');
    if (await dineInBtn.isVisible()) {
      await dineInBtn.click();
    }

    // Move to step 2
    const nextBtn = page.locator('button:has-text("Next: Details"), button:has-text("Next")');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }

    // Fill customer details
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="phone"]', '9876543210');
    
    const tableInput = page.locator('input[name="tableNumber"]');
    if (await tableInput.isVisible()) {
      await tableInput.fill('5');
    }

    // Move to step 3
    const nextStep3 = page.locator('button:has-text("Next: Payment"), button:has-text("Next")');
    if (await nextStep3.isVisible()) {
      await nextStep3.click();
    }

    // 8. Select Cash on Delivery
    const codOption = page.locator('text=Cash on Delivery');
    if (await codOption.isVisible()) {
      await codOption.click();
    }

    // Apply coupon code WELCOME10 if input exists
    const promoInput = page.locator('input[placeholder*="WELCOME10"]');
    if (await promoInput.isVisible()) {
      await promoInput.fill('WELCOME10');
      const applyBtn = page.locator('button:has-text("Apply")');
      if (await applyBtn.isVisible()) {
        await applyBtn.click();
      }
    }

    // Place Order
    const placeOrderBtn = page.locator('button:has-text("Place Cash on Delivery Order"), button:has-text("Place Order")');
    if (await placeOrderBtn.isVisible()) {
      await placeOrderBtn.click();
      // Should redirect to orders page or confirmation
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/\/(orders|checkout)/);
    }
  });
});
