
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import BlogForm from './BlogForm'

describe('<BlogForm />', () => {
  // Exercise 5.16: Validates parent handler payload structures
  test('calls the event handler with the right details when a new blog is created', async () => {
    const createBlogMock = vi.fn()
    const user = userEvent.setup()

    const { container } = render(<BlogForm createBlog={createBlogMock} />)

    // Select input elements via container queries
    const titleInput = container.querySelector('#title-input')
    const authorInput = container.querySelector('#author-input')
    const urlInput = container.querySelector('#url-input')
    const submitButton = screen.getByText('create')

    // Simulate typing inputs
    await user.type(titleInput, 'Testing Form Submissions')
    await user.type(authorInput, 'Vitest Runner')
    await user.type(urlInput, 'https://vitest.dev/')
    
    // Submit the form
    await user.click(submitButton)

    expect(createBlogMock).toHaveBeenCalledTimes(1)
    
    // Verify that the arguments matched what was typed into the inputs
    const submittedData = createBlogMock.mock.calls[0][0]
    expect(submittedData.title).toBe('Testing Form Submissions')
    expect(submittedData.author).toBe('Vitest Runner')
    expect(submittedData.url).toBe('https://vitest.dev/')
  })
})