const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'root', passwordHash: 'hashedpassword' })
    await user.save()
  })

  test('creation fails with status 400 if username is shorter than 3 characters', async () => {
    const newUser = { username: 'al', name: 'Albin', password: 'password123' }
    const result = await api.post('/api/users').send(newUser).expect(400)
    assert.ok(result.body.error.includes('username to be unique') || result.body.error.includes('shorter than the minimum allowed length') || result.body.error.includes('at least 3 characters'))
  })

  test('creation fails with status 400 if password is shorter than 3 characters', async () => {
    const newUser = { username: 'albin', name: 'Albin', password: '12' }
    const result = await api.post('/api/users').send(newUser).expect(400)
    assert.strictEqual(result.body.error, 'password must be at least 3 characters long')
  })
})

after(async () => {
  await mongoose.connection.close()
})