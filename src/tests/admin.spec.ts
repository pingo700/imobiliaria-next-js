import { test, expect } from '@playwright/test'

test('redirect anon to login', async ({ page }) => {
  await page.goto('/admin/dashboard')
  await expect(page).toHaveURL(/\/login/)
})

test('login and access admin', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('admin@ex.com')
  await page.getByLabel('Senha').fill('senha')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/admin\/dashboard/)
})
