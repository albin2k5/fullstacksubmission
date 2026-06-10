// Add this to your existing src/services/blogs.js file
const create = async newObject => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

// Update the export at the bottom:
export default { getAll, setToken, create }