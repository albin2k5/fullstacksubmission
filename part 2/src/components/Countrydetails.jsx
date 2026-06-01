import { useState, useEffect } from 'react'
import axios from 'axios'

const CountryDetail = ({ country }) => {
  const [weather, setWeather] = useState(null)
  
  // Extract individual language names into an array
  const languages = Object.values(country.languages || {})
  const capital = country.capital ? country.capital[0] : null

  // 2.20*: Fetch live weather info whenever the component mounts or capital changes
  useEffect(() => {
    if (!capital) return

    // Read key seamlessly from Vite's injection context layer
    const apiKey = import.meta.env.VITE_SOME_KEY
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${apiKey}`

    axios
      .get(weatherUrl)
      .then(response => {
        setWeather(response.data)
      })
      .catch(error => console.log('Weather fetch failed:', error))
  }, [capital])

  return (
    <div>
      <h1>{country.name.common}</h1>
      <p>capital {capital}</p>
      <p>area {country.area}</p>

      <h3>Languages</h3>
      <ul>
        {languages.map(lang => (
          <li key={lang}>{lang}</li>
        ))}
      </ul>

      <img 
        src={country.flags.png} 
        alt={`Flag of ${country.name.common}`} 
        style={{ width: '150px', border: '1px solid #eee' }} 
      />

      {/* 2.20*: Render weather sub-block safely if the promise data returned */}
      {weather && (
        <div>
          <h3>Weather in {capital}</h3>
          <p>temperature {weather.main.temp} Celsius</p>
          <img 
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
            alt={weather.weather[0].description} 
          />
          <p>wind {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  )
}

export default CountryDetail