require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    return JSON.stringify(req.body)
  }
  return ''
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// ==========================================
// 3.13 & 3.18: Fetch All
// ==========================================
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

// ==========================================
// 3.18: Info Dashboard linked to DB
// ==========================================
app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      `)
    })
    .catch(error => next(error))
})

// ==========================================
// 3.18: Fetch Single Entry by ID
// ==========================================
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end() // If id doesn't exist, send 404
      }
    })
    .catch(error => next(error)) // Forward malformatted IDs directly to our Error Middleware
})

// ==========================================
// Create New Entry
// ==========================================
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

// ==========================================
// 3.15: Phonebook database, step 3 (DELETE)
// ==========================================
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end() // Successfully removed or already gone
    })
    .catch(error => next(error))
})

// ==========================================
// 3.17*: Phonebook database, step 5 (PUT Update)
// ==========================================
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  // { new: true } returns the modified document instead of the original one
  // { runValidators: true } ensures data remains valid if schemas change later
  Person.findByIdAndUpdate(
    request.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// Catch-all fallback middleware for non-matching URLs
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// ==========================================
// 3.16: Phonebook database, step 4 (Error Middleware)
// CRITICAL: Must be the absolute last loaded middleware!
// ==========================================
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  // Pass along any unhandled errors to standard default Express handler
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})