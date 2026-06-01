import { useState, useEffect } from 'react'
import axios from 'axios'
import CountryList from './components/CountryList'

const App = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [allCountries, setAllCountries] = useState([])
  
  // 2.18*: Fetch the entire massive country roster on initial landing load phase
  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setAllCountries(response.data)
      })
      .catch(error => console.log('Failed to fetch country records:', error))
  }, [])

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
  }

  // 2.19*: Set search input directly to target common name when button fires
  const handleShowCountry = (countryName) => {
    setSearchQuery(countryName)
  }

  // Compute live match items against active structural dataset
  const countriesToShow = searchQuery.trim() === ''
    ? []
    : allCountries.filter(country =>
        country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
      )

  return (
    <div>
      <div>
        find countries <input value={searchQuery} onChange={handleSearchChange} />
      </div>
      
      {searchQuery.trim() !== '' && (
        <CountryList 
          countries={countriesToShow} 
          onShowClick={handleShowCountry} 
        />
      )}
    </div>
  )
}

export default App