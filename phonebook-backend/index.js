const express = require('express')
const morgan = require('morgan') // 1. Import morgan (Step 3.7)
const app = express()
const cors = require('cors')

app.use(cors()) // Add this near your other app.use() lines at the top
app.use(express.json())

// 2. Create a custom token to extract the request body (Step 3.8)
// Only returns a stringified body if the method is POST
morgan.token('body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return '' // Returns nothing for GET, DELETE, etc.
})

// 3. Configure Morgan to use the 'tiny' format plus our custom 'body' token
// Format: :method :url :status :res[content-length] - :response-time ms :body
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Hardcoded initial data pool
let persons = [
  { id: "1", name: "Arto Hellas", number: "040-123456" },
  { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
  { id: "3", name: "Dan Abramov", number: "12-43-234345" },
  { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" }
]

// ... Leave all your route handlers (app.get, app.delete, app.post) exactly as they were before ...

// ==========================================
// 3.1: Phonebook backend step 1
// Fetch all phonebook entries
// ==========================================
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// ==========================================
// 3.2: Phonebook backend step 2
// Summary dashboard page showing counts and request timestamp
// ==========================================
app.get('/info', (request, response) => {
  const entriesCount = persons.length
  const dateInfo = new Date()

  response.send(`
    <p>Phonebook has info for ${entriesCount} people</p>
    <p>${dateInfo}</p>
  `)
})

// ==========================================
// 3.3: Phonebook backend step 3
// Retrieve details for a single item by unique ID
// ==========================================
app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)

  if (person) {
    response.json(person)
  } else {
    // Respond with 404 Not Found if ID does not exist
    response.status(404).end()
  }
})

// ==========================================
// 3.4: Phonebook backend step 4
// Remove an entry by ID
// ==========================================
app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)
  
  // 244 No Content is standard for a successful deletion path
  response.status(204).end()
})

// ==========================================
// 3.5 & 3.6: Phonebook backend steps 5 & 6
// Create new resource with validation logic
// ==========================================
app.post('/api/persons', (request, response) => {
  const body = request.body

  // Error validation: Check if payload properties exist (Step 3.6)
  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name or number is missing' 
    })
  }

  // Error validation: Ensure name uniqueness across current pool (Step 3.6)
  const nameExists = persons.some(p => p.name.toLowerCase() === body.name.toLowerCase())
  if (nameExists) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  // Generate large random id value (Step 3.5)
  const randomId = Math.floor(Math.random() * 10000000)

  const newPerson = {
    id: String(randomId),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(newPerson)
  response.json(newPerson)
})
app.get('/', (request, response) => {
  response.send('<h1>Welcome to the Phonebook Backend!</h1><p>Try visiting <a href="/api/persons">/api/persons</a> or <a href="/info">/info</a></p>')
})

// Setup fallback port configurations
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})