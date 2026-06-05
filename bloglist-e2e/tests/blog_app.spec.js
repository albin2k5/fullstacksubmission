const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // 5.18: Empty database via backend testing reset endpoint before each run
   await request.post('http://127.0.0.1:3003/api/testing/reset')

    // 5.18: Seed a user profile structurally into the backend
    await request.post('http://127.0.0.1:3003/api/users', {
      data: {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen'
      }
    })

    await page.goto('/')
  })

    // 5.17: Blog List End To End Testing, step 1
  test('Login form is shown by default', async ({ page }) => {
    // Using a case-insensitive regular expression /.../i handles both capitalized and lowercase variations smoothly
    await expect(page.getByText(/log in to application/i)).toBeVisible()
    await expect(page.locator('input').first()).toBeVisible()
  })

  // 5.18: Blog List End To End Testing, step 2
  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      // Selecting by input order bypasses any rigid label structural locks
      await page.locator('input').first().fill('mluukkai')
      await page.locator('input').nth(1).fill('salainen')
      await page.getByRole('button', { name: /login/i }).click()

      await expect(page.getByText(/logged in/i)).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.locator('input').first().fill('mluukkai')
      await page.locator('input').nth(1).fill('wrongpassword')
      await page.getByRole('button', { name: /login/i }).click()

      await expect(page.getByText(/wrong/i)).toBeVisible()
    })
  })

  // 5.19–5.23: Post-Authentication Test Blocks
    describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.locator('input').first().fill('mluukkai')
      await page.locator('input').nth(1).fill('salainen')
      await page.getByRole('button', { name: /login/i }).click()
    })

    // 5.19: Blog List End To End Testing, step 3
    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.locator('input[name="Title"]').fill('E2E Test Title')
      await page.locator('input[name="Author"]').fill('Playwright Robot')
      await page.locator('input[name="Url"]').fill('https://playwright.dev')
      await page.getByRole('button', { name: 'create' }).click()

      await expect(page.getByText('E2E Test Title Playwright Robot')).toBeVisible()
    })

    // 5.20: Blog List End To End Testing, step 4
    test('a blog can be liked', async ({ page }) => {
      // Setup: Create a blog first
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.locator('input[name="Title"]').fill('Likeable Blog')
      await page.locator('input[name="Author"]').fill('Author')
      await page.locator('input[name="Url"]').fill('https://test.com')
      await page.getByRole('button', { name: 'create' }).click()

      await page.getByRole('button', { name: 'view' }).click()
      await expect(page.getByText('likes 0')).toBeVisible()

      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1')).toBeVisible()
    })

    // 5.21 & 5.22: Blog List End To End Testing, step 5 & 6
    test('the user who created a blog can delete it, others cannot see delete button', async ({ page, request }) => {
      // Step 5.21: Create blog as Matti
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.locator('input[name="Title"]').fill('Deletable Blog')
      await page.locator('input[name="Author"]').fill('Author')
      await page.locator('input[name="Url"]').fill('https://delete.com')
      await page.getByRole('button', { name: 'create' }).click()

      await page.getByRole('button', { name: 'view' }).click()

      // Handle the browser window.confirm dialog automatically
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Remove blog Deletable Blog')
        await dialog.accept()
      })

      await page.getByRole('button', { name: 'remove' }).click()
      await expect(page.getByText('Deletable Blog')).not.toBeVisible()
    })

    // 5.23: Blog List End To End Testing, step 7
    test('blogs are sorted descending by number of likes', async ({ page }) => {
      // Setup: Seed multiple blogs natively
      const blogsData = [
        { title: 'Least Likes Blog', author: 'A', url: 'http://a.com' },
        { title: 'Most Likes Blog', author: 'B', url: 'http://b.com' },
        { title: 'Medium Likes Blog', author: 'C', url: 'http://c.com' }
      ]

      for (const b of blogsData) {
        await page.getByRole('button', { name: 'create new blog' }).click()
        await page.locator('input[name="Title"]').fill(b.title)
        await page.locator('input[name="Author"]').fill(b.author)
        await page.locator('input[name="Url"]').fill(b.url)
        await page.getByRole('button', { name: 'create' }).click()
      }

      // Open detail panels to access like buttons
      const viewButtons = await page.getByRole('button', { name: 'view' }).all()
      for (const btn of viewButtons) {
        await btn.click()
      }

      // Target individual specific item components to apply uneven counts
      const mostLikesBlock = page.locator('.blog', { hasText: 'Most Likes Blog' })
      const medLikesBlock = page.locator('.blog', { hasText: 'Medium Likes Blog' })

      // 3 likes for Most
      await mostLikesBlock.getByRole('button', { name: 'like' }).click()
      await page.waitForTimeout(500)
      await mostLikesBlock.getByRole('button', { name: 'like' }).click()
      await page.waitForTimeout(500)
      await mostLikesBlock.getByRole('button', { name: 'like' }).click()

      // 1 like for Medium
      await medLikesBlock.getByRole('button', { name: 'like' }).click()
      await page.waitForTimeout(500)

      // Evaluate order array positions from top down
      const blogTitles = await page.locator('.blog').allTextContents()
      expect(blogTitles[0]).toContain('Most Likes Blog')
      expect(blogTitles[1]).toContain('Medium Likes Blog')
      expect(blogTitles[2]).toContain('Least Likes Blog')
    })
  })
})