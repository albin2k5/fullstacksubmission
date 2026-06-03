const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

// Sample dataset array for validation tests
const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    __v: 0
  }
]

const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD10xx/EWD1014.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestFirst.html",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }
]

// 4.3 Dummy Test
test('dummy returns one', () => {
  const result = listHelper.dummy([])
  assert.strictEqual(result, 1)
})

// 4.4 Total Likes Test Suite
describe('total likes', () => {
  test('of empty list is zero', () => {
    assert.strictEqual(listHelper.totalLikes([]), 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    assert.strictEqual(listHelper.totalLikes(listWithOneBlog), 5)
  })

  test('of a bigger list is calculated right', () => {
    assert.strictEqual(listHelper.totalLikes(blogs), 31)
  })
})

// 4.5* Favorite Blog Test Suite
describe('favorite blog', () => {
  test('returns the top blog properties matching highest likes value', () => {
    const expected = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12
    }
    assert.deepStrictEqual(listHelper.favoriteBlog(blogs), expected)
  })
})

// 4.6* Most Blogs Test Suite
describe('most blogs', () => {
  test('identifies the author with highest quantity of written articles', () => {
    const expected = {
      author: "Robert C. Martin",
      blogs: 3
    }
    assert.deepStrictEqual(listHelper.mostBlogs(blogs), expected)
  })
})

// 4.7* Most Likes Test Suite
describe('most likes', () => {
  test('identifies the author aggregate with highest net score total', () => {
    const expected = {
      author: "Edsger W. Dijkstra",
      likes: 17 // 5 (from single) + 12 = 17 total likes
    }
    
    // Concat lists to combine and create target mock case
    assert.deepStrictEqual(listHelper.mostLikes(blogs.concat(listWithOneBlog)), expected)
  })
})