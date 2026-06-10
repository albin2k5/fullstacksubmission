import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import Blog from './Blog'

describe('<Blog />', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Full Stack Developer',
    url: 'https://fullstackopen.com/',
    likes: 12,
    user: {
      username: 'testuser',
      name: 'Test User'
    }
  }

  const currentUser = {
    username: 'testuser',
    name: 'Test User'
  }

  // Exercise 5.13: Checks title and author, excludes URL and Likes by default
  test('renders title and author, but does not render URL or likes by default', () => {
    const { container } = render(
      <Blog blog={blog} currentUser={currentUser} />
    )

    const shortDiv = container.querySelector('.blog-short')
    expect(shortDiv).toHaveTextContent('Component testing is done with react-testing-library')
    expect(shortDiv).toHaveTextContent('Full Stack Developer')

    const detailedDiv = container.querySelector('.blog-detailed')
    expect(detailedDiv).toBeNull()
  })

  // Exercise 5.14: Verifies detail block appears when view button is clicked
  test('renders URL and number of likes when the view button has been clicked', async () => {
    const { container } = render(
      <Blog blog={blog} currentUser={currentUser} />
    )

    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    const detailedDiv = container.querySelector('.blog-detailed')
    expect(detailedDiv).not.toBeNull()
    expect(detailedDiv).toHaveTextContent('https://fullstackopen.com/')
    expect(detailedDiv).toHaveTextContent('likes 12')
  })

  // Exercise 5.15: Tracks double click events on like action button
  test('if the like button is clicked twice, the event handler is called twice', async () => {
    const mockHandler = vi.fn()

    render(
      <Blog blog={blog} currentUser={currentUser} updateBlog={mockHandler} />
    )

    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockHandler).toHaveBeenCalledTimes(2)
  })
})