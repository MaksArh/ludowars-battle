import { test, expect } from '@playwright/test';

test.describe('Ludowars Battle App', () => {
  test('should display app title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Ludowars Battle' })).toBeVisible();
  });

  test('should increment counter', async ({ page }) => {
    await page.goto('/');

    const counterValue = page.getByTestId('counter-value');
    await expect(counterValue).toHaveText('0');

    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(counterValue).toHaveText('1');

    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(counterValue).toHaveText('2');
  });

  test('should decrement counter', async ({ page }) => {
    await page.goto('/');

    const counterValue = page.getByTestId('counter-value');
    await expect(counterValue).toHaveText('0');

    await page.getByRole('button', { name: 'Decrement' }).click();
    await expect(counterValue).toHaveText('-1');
  });

  test('should reset counter', async ({ page }) => {
    await page.goto('/');

    const counterValue = page.getByTestId('counter-value');

    // Increment multiple times
    await page.getByRole('button', { name: 'Increment' }).click();
    await page.getByRole('button', { name: 'Increment' }).click();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(counterValue).toHaveText('3');

    // Reset
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(counterValue).toHaveText('0');
  });

  test('should have all three buttons', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Increment' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Decrement' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
  });
});


