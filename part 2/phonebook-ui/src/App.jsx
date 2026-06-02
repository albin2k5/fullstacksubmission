import { useState, useEffect } from 'react'
import axios from 'axios'

// Simple Inline Component for Notification Alerts
const Notification = ({ message, isError }) => {
  if (message === null) return null

  const notificationStyle = {
    color: isError ? 'red' : 'green',
    background: '#lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '15px',
    backgroundColor: '#eee'
  }

  return (
    <div style={notificationStyle}>
      {message}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [alertMessage, setAlertMessage] = useState(null)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    axios.get('/api/persons')
      .then(response => {
        setPersons(response.data)
      })
      .catch(err => console.error('Error fetching data:', err))
  }, [])

  const showNotification = (message, errorStatus = false) => {
    setAlertMessage(message)
    setIsError(errorStatus)
    setTimeout(() => {
      setAlertMessage(null)
    }, 5000)
  }

  const addPerson = (event) => {
    event.preventDefault()
    const cleanName = newName.trim()
    const existing = persons.find(p => p.name.toLowerCase() === cleanName.toLowerCase())
    
    if (existing) {
      if (window.confirm(`${cleanName} is already added to phonebook, replace the old number with a new one?`)) {
        axios.put(`/api/persons/${existing.id}`, { name: existing.name, number: newNumber })
          .then(response => {
            setPersons(persons.map(p => p.id !== existing.id ? p : response.data))
            showNotification(`Updated number for ${existing.name}`)
            setNewName('')
            setNewNumber('')
          })
          .catch(err => {
            // Handle PUT verification failures (like invalid numbers)
            showNotification(err.response.data.error, true)
          })
      }
      return
    }

    axios.post('/api/persons', { name: cleanName, number: newNumber })
      .then(response => {
        setPersons(persons.concat(response.data))
        showNotification(`Added ${cleanName}`)
        setNewName('')
        setNewNumber('')
      })
      .catch(err => {
        // 3.19: Catch Mongoose validation messages sent back by backend
        showNotification(err.response.data.error, true)
      })
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      axios.delete(`/api/persons/${id}`)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          showNotification(`Removed ${name}`)
        })
        .catch(err => console.error(err))
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Phonebook Dashboard</h2>
      
      <Notification message={alertMessage} isError={isError} />

      <form onSubmit={addPerson}>
        <div>name: <input value={newName} onChange={e => setNewName(e.target.value)} /></div>
        <div style={{ marginTop: '5px' }}>number: <input value={newNumber} onChange={e => setNewNumber(e.target.value)} /></div>
        <div style={{ marginTop: '10px' }}><button type="submit">Add Entry</button></div>
      </form>
      
      <h2>Numbers</h2>
      <ul>
        {persons.map(p => (
          <li key={p.id} style={{ marginBottom: '5px' }}>
            {p.name}: {p.number} {' '}
            <button onClick={() => deletePerson(p.id, p.name)}>delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App