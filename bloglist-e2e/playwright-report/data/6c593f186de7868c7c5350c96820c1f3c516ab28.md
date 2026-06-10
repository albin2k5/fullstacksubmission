# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: blog_app.spec.js >> Blog app >> When logged in >> the user who created a blog can delete it, others cannot see delete button
- Location: tests/blog_app.spec.js:83:5

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED 127.0.0.1:3003
Call log:
  - → POST http://127.0.0.1:3003/api/testing/reset
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.fill: Test ended.
Call log:
  - waiting for locator('input').first()

```

# Test source

```ts
  1   | const { test, expect, beforeEach, describe } = require('@playwright/test')
  2   | 
  3   | describe('Blog app', () => {
  4   |   beforeEach(async ({ page, request }) => {
  5   |     // 5.18: Empty database via backend testing reset endpoint before each run
  6   |    await request.post('http://127.0.0.1:3003/api/testing/reset')
  7   | 
  8   |     // 5.18: Seed a user profile structurally into the backend
  9   |     await request.post('http://127.0.0.1:3003/api/users', {
  10  |       data: {
  11  |         username: 'mluukkai',
  12  |         name: 'Matti Luukkainen',
  13  |         password: 'salainen'
  14  |       }
  15  |     })
  16  | 
  17  |     await page.goto('/')
  18  |   })
  19  | 
  20  |     // 5.17: Blog List End To End Testing, step 1
  21  |   test('Login form is shown by default', async ({ page }) => {
  22  |     // Using a case-insensitive regular expression /.../i handles both capitalized and lowercase variations smoothly
  23  |     await expect(page.getByText(/log in to application/i)).toBeVisible()
  24  |     await expect(page.locator('input').first()).toBeVisible()
  25  |   })
  26  | 
  27  |   // 5.18: Blog List End To End Testing, step 2
  28  |   describe('Login', () => {
  29  |     test('succeeds with correct credentials', async ({ page }) => {
  30  |       // Selecting by input order bypasses any rigid label structural locks
  31  |       await page.locator('input').first().fill('mluukkai')
  32  |       await page.locator('input').nth(1).fill('salainen')
  33  |       await page.getByRole('button', { name: /login/i }).click()
  34  | 
  35  |       await expect(page.getByText(/logged in/i)).toBeVisible()
  36  |     })
  37  | 
  38  |     test('fails with wrong credentials', async ({ page }) => {
  39  |       await page.locator('input').first().fill('mluukkai')
  40  |       await page.locator('input').nth(1).fill('wrongpassword')
  41  |       await page.getByRole('button', { name: /login/i }).click()
  42  | 
  43  |       await expect(page.getByText(/wrong/i)).toBeVisible()
  44  |     })
  45  |   })
  46  | 
  47  |   // 5.19–5.23: Post-Authentication Test Blocks
  48  |     describe('When logged in', () => {
  49  |     beforeEach(async ({ page }) => {
> 50  |       await page.locator('input').first().fill('mluukkai')
      |                                           ^ Error: locator.fill: Test ended.
  51  |       await page.locator('input').nth(1).fill('salainen')
  52  |       await page.getByRole('button', { name: /login/i }).click()
  53  |     })
  54  | 
  55  |     // 5.19: Blog List End To End Testing, step 3
  56  |     test('a new blog can be created', async ({ page }) => {
  57  |       await page.getByRole('button', { name: 'create new blog' }).click()
  58  |       await page.locator('input[name="Title"]').fill('E2E Test Title')
  59  |       await page.locator('input[name="Author"]').fill('Playwright Robot')
  60  |       await page.locator('input[name="Url"]').fill('https://playwright.dev')
  61  |       await page.getByRole('button', { name: 'create' }).click()
  62  | 
  63  |       await expect(page.getByText('E2E Test Title Playwright Robot')).toBeVisible()
  64  |     })
  65  | 
  66  |     // 5.20: Blog List End To End Testing, step 4
  67  |     test('a blog can be liked', async ({ page }) => {
  68  |       // Setup: Create a blog first
  69  |       await page.getByRole('button', { name: 'create new blog' }).click()
  70  |       await page.locator('input[name="Title"]').fill('Likeable Blog')
  71  |       await page.locator('input[name="Author"]').fill('Author')
  72  |       await page.locator('input[name="Url"]').fill('https://test.com')
  73  |       await page.getByRole('button', { name: 'create' }).click()
  74  | 
  75  |       await page.getByRole('button', { name: 'view' }).click()
  76  |       await expect(page.getByText('likes 0')).toBeVisible()
  77  | 
  78  |       await page.getByRole('button', { name: 'like' }).click()
  79  |       await expect(page.getByText('likes 1')).toBeVisible()
  80  |     })
  81  | 
  82  |     // 5.21 & 5.22: Blog List End To End Testing, step 5 & 6
  83  |     test('the user who created a blog can delete it, others cannot see delete button', async ({ page, request }) => {
  84  |       // Step 5.21: Create blog as Matti
  85  |       await page.getByRole('button', { name: 'create new blog' }).click()
  86  |       await page.locator('input[name="Title"]').fill('Deletable Blog')
  87  |       await page.locator('input[name="Author"]').fill('Author')
  88  |       await page.locator('input[name="Url"]').fill('https://delete.com')
  89  |       await page.getByRole('button', { name: 'create' }).click()
  90  | 
  91  |       await page.getByRole('button', { name: 'view' }).click()
  92  | 
  93  |       // Handle the browser window.confirm dialog automatically
  94  |       page.on('dialog', async dialog => {
  95  |         expect(dialog.message()).toContain('Remove blog Deletable Blog')
  96  |         await dialog.accept()
  97  |       })
  98  | 
  99  |       await page.getByRole('button', { name: 'remove' }).click()
  100 |       await expect(page.getByText('Deletable Blog')).not.toBeVisible()
  101 |     })
  102 | 
  103 |     // 5.23: Blog List End To End Testing, step 7
  104 |     test('blogs are sorted descending by number of likes', async ({ page }) => {
  105 |       // Setup: Seed multiple blogs natively
  106 |       const blogsData = [
  107 |         { title: 'Least Likes Blog', author: 'A', url: 'http://a.com' },
  108 |         { title: 'Most Likes Blog', author: 'B', url: 'http://b.com' },
  109 |         { title: 'Medium Likes Blog', author: 'C', url: 'http://c.com' }
  110 |       ]
  111 | 
  112 |       for (const b of blogsData) {
  113 |         await page.getByRole('button', { name: 'create new blog' }).click()
  114 |         await page.locator('input[name="Title"]').fill(b.title)
  115 |         await page.locator('input[name="Author"]').fill(b.author)
  116 |         await page.locator('input[name="Url"]').fill(b.url)
  117 |         await page.getByRole('button', { name: 'create' }).click()
  118 |       }
  119 | 
  120 |       // Open detail panels to access like buttons
  121 |       const viewButtons = await page.getByRole('button', { name: 'view' }).all()
  122 |       for (const btn of viewButtons) {
  123 |         await btn.click()
  124 |       }
  125 | 
  126 |       // Target individual specific item components to apply uneven counts
  127 |       const mostLikesBlock = page.locator('.blog', { hasText: 'Most Likes Blog' })
  128 |       const medLikesBlock = page.locator('.blog', { hasText: 'Medium Likes Blog' })
  129 | 
  130 |       // 3 likes for Most
  131 |       await mostLikesBlock.getByRole('button', { name: 'like' }).click()
  132 |       await page.waitForTimeout(500)
  133 |       await mostLikesBlock.getByRole('button', { name: 'like' }).click()
  134 |       await page.waitForTimeout(500)
  135 |       await mostLikesBlock.getByRole('button', { name: 'like' }).click()
  136 | 
  137 |       // 1 like for Medium
  138 |       await medLikesBlock.getByRole('button', { name: 'like' }).click()
  139 |       await page.waitForTimeout(500)
  140 | 
  141 |       // Evaluate order array positions from top down
  142 |       const blogTitles = await page.locator('.blog').allTextContents()
  143 |       expect(blogTitles[0]).toContain('Most Likes Blog')
  144 |       expect(blogTitles[1]).toContain('Medium Likes Blog')
  145 |       expect(blogTitles[2]).toContain('Least Likes Blog')
  146 |     })
  147 |   })
  148 | })
```