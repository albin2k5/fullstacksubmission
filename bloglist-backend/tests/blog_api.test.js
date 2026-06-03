const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

let tokenHeader // This will store our "Bearer <token>" string globally for the tests

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD10xx/EWD1014.html',
    likes: 12
  }
]

beforeEach(async () => {
  // 1. Reset database collections cleanly
  await Blog.deleteMany({})
  await User.deleteMany({})

  // 2. Create a test creator account profile
  const passwordHash = await bcrypt.hash('testpassword', 10)
  const user = new User({
    username: 'testuser',
    name: 'Test Administrator',
    passwordHash
  })
  const savedUser = await user.save()

  // 3. Authenticate and save the session token
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'testpassword' })

  tokenHeader = `Bearer ${loginResponse.body.token}`

  // 4. Store initial blogs tied to this user account
  const blog1 = new Blog({ ...initialBlogs[0], user: savedUser._id })
  await blog1.save()
  const blog2 = new Blog({ ...initialBlogs[1], user: savedUser._id })
  await blog2.save()
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const firstBlog = response.body[0]
    assert.ok(firstBlog.id)
    assert.strictEqual(firstBlog._id, undefined)
  })
})

describe('addition of a new blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Async/Await patterns in Express',
      author: 'Full Stack Open',
      url: 'https://fullstackopen.com/',
      likes: 42
    }

    // Notice we pass .set('Authorization', tokenHeader) now!
    await api
      .post('/api/blogs')
      .set('Authorization', tokenHeader)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)

    assert.strictEqual(response.body.length, initialBlogs.length + 1)
    assert.ok(titles.includes('Async/Await patterns in Express'))
  })

  test('if likes property is missing, it defaults to 0', async () => {
    const newBlogWithoutLikes = {
      title: 'Blog without likes metric',
      author: 'Test Developer',
      url: 'https://testurl.com/'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', tokenHeader)
      .send(newBlogWithoutLikes)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('blog without title or url returns 400 Bad Request', async () => {
    const faultyBlog = {
      author: 'Unknown Author',
      likes: 10
    }

    await api
      .post('/api/blogs')
      .set('Authorization', tokenHeader)
      .send(faultyBlog)
      .expect(400)
  })

  // 4.23 Requirement verification: Verify 401 response code when authorization token isn't given
  test('fails with 401 Unauthorized if a token is not provided', async () => {
    const newBlog = {
      title: 'Unauthenticated Blog',
      url: 'https://unauth.com/'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', tokenHeader)
      .expect(204)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1)

    const titles = blogsAtEnd.map(b => b.title)
    assert.strictEqual(titles.includes(blogToDelete.title), false)
  })
})

describe('updating a blog', () => {
  test('succeeds in updating likes on existing record structure metrics with 200', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    const updatedLikesPayload = {
      likes: blogToUpdate.likes + 10
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedLikesPayload)
      .expect(200)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
  })
})

after(async () => {
  await mongoose.connection.close()
})