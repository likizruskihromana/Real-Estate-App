import { expect, test } from '@playwright/test';

test('pretraga, mapa, detalj i galerija rade kao jedan javni tok', async ({ page }) => {
  await page.goto('/nekretnine');
  await expect(page.getByRole('heading', { name: 'Nekretnine' })).toBeVisible();
  await page.getByLabel('Tip nekretnine').selectOption('Stan');
  await expect(page).toHaveURL(/tip=Stan/);
  await expect(page.locator('article.property-card').first()).toBeVisible();

  await page.getByRole('button', { name: 'Prikaži mapu' }).click();
  await expect(page.getByRole('dialog', { name: 'Mapa nekretnina' })).toContainText('oglasa na mapi');
  await page.getByRole('button', { name: 'Zatvori mapu' }).click();

  const propertyName = await page.locator('article.property-card h3').first().innerText();
  await page.locator('article.property-card h3 a').first().click();
  await expect(page.getByRole('heading', { level: 1, name: propertyName })).toBeVisible();
  await expect(page.getByText('Zaštićena adresa')).toBeVisible();

  await page.locator('.gallery-image').first().click();
  const lightbox = page.getByRole('dialog', { name: /Galerija/ });
  await expect(lightbox).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zatvori galeriju' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
});

for (const width of [360, 768, 1440]) test(`pretraga nema horizontalni overflow na ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/nekretnine');
  await expect(page.getByRole('heading', { name: 'Nekretnine' })).toBeVisible();
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});
