require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

// Middleware Configuration Pipeline
app.use(express.json())
app.use(cors())
app.use(express.static('dist')) // Serves your production-built React frontend static assets

// Custom Morgan logging token to print incoming JSON request bodies on POST requests
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// ==========================================
// 1. Route Handlers: Frontend Static / API Endpoints
// ==========================================

// GET: Fetch all person documents from MongoDB Atlas
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

// GET: Fetch a singular person record by its unique database object ID
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// POST: Add a new contact record (Enforces Mongoose validations)
app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  const person = new Person({ name, number })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error)) // Passes Mongoose ValidationError bubbles down to our errorHandler
})

// PUT: Update an existing contact's phone number record (Forces update validation checks)
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  // runValidators: true forces Mongoose to check your formatting regex rules during updates
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

// DELETE: Remove a contact from your database collection
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// GET: Application summary operational statistics page
app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      const infoContent = `
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      `
      response.send(infoContent)
    })
    .catch(error => next(error))
})

// Fallback Route: Triggers for non-existent endpoint strings
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// ==========================================
// 2. Centralized Error Interception Middleware
// ==========================================
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    // Extracts validation messages and relays them directly to your React alert banner
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

// ==========================================
// 3. Dynamic Gateway Port Binding Initialization
// ==========================================
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})