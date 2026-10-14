import { expect, test } from 'playwright/test'

test('landing page shows playful calls to action', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /get your googly on/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /take a selfie/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /upload a photo/i })).toBeVisible()
})

test('shared photo route can render with mocked api data on mobile', async ({ page }) => {
  await page.route('**/api/photos/test1234', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        publicId: 'test1234',
        imageUrl: '/hero-face.svg',
        previewUrl: '/hero-face.svg',
        eyeData: [
          { id: 'left', x: 0.41, y: 0.43, radiusX: 0.085, radiusY: 0.078, rotation: -0.05 },
          { id: 'right', x: 0.59, y: 0.43, radiusX: 0.085, radiusY: 0.078, rotation: 0.05 },
        ],
        eyeSettings: { eyeScale: 1, pupilScale: 0.4, animationSpeed: 0.12, wobble: 0.2, blink: true },
        backgroundPreset: 'neon-party',
        imageWidth: 720,
        imageHeight: 860,
        views: 0,
        createdAt: new Date().toISOString(),
        publicUrl: 'http://127.0.0.1:5173/g/test1234',
      }),
    })
  })
  await page.route('**/api/photos/test1234/view', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    })
  })

  await page.goto('/g/test1234')
  await expect(page.getByRole('heading', { name: /check out my googlyme/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /copy link/i })).toBeVisible()
})
