const mongoose = require('mongoose')

// Safety Check: Verify that the user passed at least the password argument
if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

// MongoDB Atlas connection string (uses the dynamic password argument)
// MongoDB Atlas connection string (uses your unique cluster path and appName)
const url = `mongodb+srv://fullstack:${password}@cluster0.rsqdpxe.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`
mongoose.set('strictQuery', false)
mongoose.connect(url)

// Define the Schema for a Person
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

// Define the Model (Mongoose turns 'Person' into the 'people' collection automatically)
const Person = mongoose.model('Person', personSchema)

// =========================================================================
// Case 1: Only the password was provided -> List all entries from database
// =========================================================================
if (process.argv.length === 3) {
  console.log('phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    // CRITICAL: Close the connection only AFTER the asynchronous query finishes
    mongoose.connection.close()
  })
}

// =========================================================================
// Case 2: Name and Number arguments provided -> Add a new entry to database
// =========================================================================
if (process.argv.length > 3) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    // CRITICAL: Close the connection only AFTER the asynchronous save finishes
    mongoose.connection.close()
  })
}