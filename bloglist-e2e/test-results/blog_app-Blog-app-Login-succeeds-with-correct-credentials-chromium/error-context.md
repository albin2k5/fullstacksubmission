# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: blog_app.spec.js >> Blog app >> Login >> succeeds with correct credentials
- Location: tests/blog_app.spec.js:29:5

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED 127.0.0.1:3003
Call log:
  - → POST http://127.0.0.1:3003/api/testing/reset
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```

# Test source

```ts
  1   | const { test, expect, beforeEach, describe } = require('@playwright/test')
  2   | 
  3   | describe('Blog app', () => {
  4   |   beforeEach(async ({ page, request }) => {
  5   |     // 5.18: Empty database via backend testing reset endpoint before each run
> 6   |    await request.post('http://127.0.0.1:3003/api/testing/reset')
      |                  ^ Error: apiRequestContext.post: connect ECONNREFUSED 127.0.0.1:3003
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
  50  |       await page.locator('input').first().fill('mluukkai')
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
```