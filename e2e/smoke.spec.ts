import { expect, test } from '@playwright/test';

// Runs against the live Kitsu API: search, change page, open a details page
test('search, go to page 2 and open a details page', async ({ page }) => {
  await page.goto('/search');

  await page.getByRole('button', { name: 'Search', exact: true }).click();

  const results = page.getByRole('region', { name: 'Search results' });
  const cards = results.locator('a[href^="/details/"]');
  await expect(
    results.getByRole('heading', { name: /Search Results \(\d+\)/ })
  ).toBeVisible();
  await expect(cards.first()).toBeVisible();

  await page.getByRole('button', { name: 'Go to page 2' }).click();

  // Only checks that page 2 loads. Kitsu currently returns the first page again for
  // the second page of a filtered search, so the cards cannot be compared with page 1.
  await expect(page.getByRole('button', { name: 'page 2' })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await expect(cards.first()).toBeVisible();

  await cards.first().click();

  await expect(page).toHaveURL(/\/details\/\d+$/);
  await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();
  await expect(page.getByRole('heading', { name: 'Episodes' })).toBeVisible();
});
