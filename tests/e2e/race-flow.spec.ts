import { expect, test } from '@playwright/test'

test('page renders controls', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('generate-button')).toBeVisible()
  await expect(page.getByTestId('start-button')).toBeVisible()
  await expect(page.getByTestId('start-all-button')).toBeVisible()
})

test('generate populates horses and schedule', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('generate-button').click()
  await expect(page.getByTestId('horse-list')).toBeVisible()
  await expect(page.getByTestId('horse-list').locator('[data-testid^="horse-row-"]')).toHaveCount(20)
  await expect(page.locator('[data-testid^="schedule-round-"]')).toHaveCount(6)
})

test('start runs one round, run-all completes remaining rounds', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/')
  await page.getByTestId('generate-button').click()
  await page.getByTestId('start-button').click()

  await expect(page.locator('[data-testid="result-round-1"]')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('[data-testid^="result-round-"]')).toHaveCount(1, { timeout: 30_000 })
  await page.getByTestId('start-all-button').click()
  await expect(page.locator('[data-testid^="result-round-"]')).toHaveCount(6, { timeout: 60_000 })
})
