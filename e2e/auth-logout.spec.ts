import { expect, test } from '@playwright/test';

test('prijavljeni korisnik se može odjaviti i više nema pristup privatnim rutama', async ({ page }) => {
  await page.goto('/prijava');
  await page.getByLabel('Username ili email').fill('superadmin');
  await page.getByLabel('Lozinka').fill('superadmin123');
  await page.getByRole('button', { name: 'Prijavi se' }).click();

  await expect(page.getByRole('link', { name: 'Super' })).toBeVisible();
  await page.getByRole('button', { name: 'Odjavi se' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('link', { name: 'Prijavi se' })).toBeVisible();
  await page.goto('/moji-oglasi');
  await expect(page).toHaveURL(/\/prijava$/);
});
