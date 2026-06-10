import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'

// Simple Inline Styled Custom Elements mimicking Styled Components / MUI
const NavigationBar = ({ user, handleLogout }) => {
  const navStyle = {
    background: '#1976d2',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)'
  }

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    marginRight: '20px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '14px'
  }

  return (
    <div style={navStyle}>
      <div>
        <Link style={linkStyle} to="/">Blogs</Link>
        <Link style={linkStyle} to="/create">New Blog</Link>
      </div>
      {user && (
        <span style={{ color: 'white', fontSize: '14px' }}>
          {user.name} logged in{' '}
          <button style={{ marginLeft: '10px', backgroundColor: '#e53935', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }} onClick={handleLogout}>
            LOGOUT
          </button>
        </span>
      )}
    </div>
  )
}

const Notification = ({ msg, type }) => {
  if (!msg) return null
  const style = {
    background: type === 'error' ? '#ffebee' : '#e8f5e9',
    color: type === 'error' ? '#c62828' : '#2e7d32',
    padding: '12px',
    borderRadius: '4px',
    margin: '15px 0',
    border: `1px solid ${type === 'error' ? '#ef9a9a' : '#a5d6a7'}`
  }
  return <div style={style}>{msg}</div>
}

// Subcomponents
const BlogList = ({ blogs }) => (
  <div style={{ padding: '20px' }}>
    <h2 style={{ color: '#333' }}>Blogs List</h2>
    <ul style={{ listStyleType: 'none', padding: 0 }}>
      {blogs.sort((a,b) => b.likes - a.likes).map(blog => (
        <li key={blog.id} style={{ padding: '12px', borderBottom: '1px solid #eee', background: 'white', margin: '6px 0', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Link style={{ textDecoration: 'none', color: '#1976d2', fontWeight: '500' }} to={`/blogs/${blog.id}`}>{blog.title} by {blog.author}</Link>
        </li>
      ))}
    </ul>
  </div>
)

const SingleBlogView = ({ blogs, handleLike, handleDelete, currentUser }) => {
  const { id } = useParams()
  const blog = blogs.find(b => b.id === id)

  if (!blog) return <p style={{ padding: '20px' }}>Blog post not found.</p>

  const isCreator = blog.user?.username === currentUser?.username || !blog.user

  return (
    <div style={{ padding: '24px', margin: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h1 style={{ margin: '0 0 10px 0', color: '#222' }}>{blog.title}</h1>
      <p style={{ fontStyle: 'italic', color: '#666', margin: '0 0 20px 0' }}>by {blog.author}</p>
      <div style={{ marginBottom: '15px' }}>
        <a style={{ color: '#1976d2' }} href={blog.url} target="_blank" rel="noreferrer">{blog.url}</a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <span style={{ fontWeight: 'bold' }}>{blog.likes} Likes</span>
        <button style={{ backgroundColor: '#1976d2', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleLike(blog)}>LIKE</button>
      </div>
      <p style={{ color: '#555', fontSize: '14px' }}>Added by: <strong>{blog.user?.name || 'System / Unknown'}</strong></p>
      {isCreator && (
        <button style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }} onClick={() => handleDelete(blog.id)}>REMOVE</button>
      )}
    </div>
  )
}

const NewBlogForm = ({ addBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    addBlog({ title, author, url })
    navigate('/')
  }

  const formInputStyle = { display: 'block', width: '100%', padding: '10px', margin: '8px 0 16px 0', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }

  return (
    <div style={{ maxWidth: '500px', padding: '24px', margin: '20px auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>Create a New Blog</h2>
      <form onSubmit={submit}>
        <label>Title</label>
        <input style={formInputStyle} value={title} onChange={e => setTitle(e.target.value)} required />
        <label>Author</label>
        <input style={formInputStyle} value={author} onChange={e => setAuthor(e.target.value)} required />
        <label>URL</label>
        <input style={formInputStyle} value={url} onChange={e => setUrl(e.target.value)} required />
        <button style={{ width: '100%', padding: '12px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }} type="submit">CREATE</button>
      </form>
    </div>
  )
}

const LoginView = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const formInputStyle = { display: 'block', width: '100%', padding: '10px', margin: '8px 0 16px 0', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }

  return (
    <div style={{ maxWidth: '400px', padding: '32px', margin: '100px auto', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Log In to Application</h2>
      <form onSubmit={(e) => { e.preventDefault(); onLogin(username, password); }}>
        <label>Username</label>
        <input style={formInputStyle} value={username} onChange={e => setUsername(e.target.value)} required />
        <label>Password</label>
        <input style={formInputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button style={{ width: '100%', padding: '12px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }} type="submit">LOGIN</button>
      </form>
    </div>
  )
}

// Core Orchestrator
const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ msg: null, type: 'success' })

  // Mock static layout population logic matching Full Stack Open requirements context
  useEffect(() => {
    setBlogs([
      { id: '1', title: 'React patterns', author: 'Michael Chan', url: 'https://reactpatterns.com', likes: 7, user: { username: 'mluukkai', name: 'Matti Luukkainen' } },
      { id: '2', title: 'Overreacted', author: 'Dan Abramov', url: 'https://overreacted.io', likes: 12, user: { username: 'dan', name: 'Dan Abramov' } }
    ])
    const savedUser = window.localStorage.getItem('loggedBlogUser')
    if (savedUser) setUser(JSON.parse(savedUser))
  }, [])

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification({ msg: null, type: 'success' }), 5000)
  }

  const handleLogin = (username, password) => {
    if (username === 'mluukkai' && password === 'salainen') {
      const u = { username, name: 'Matti Luukkainen', token: 'mocked-token' }
      setUser(u)
      window.localStorage.setItem('loggedBlogUser', JSON.stringify(u))
      notify('Logged in successfully')
    } else {
      notify('Wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogUser')
    setUser(null)
    notify('Logged out successfully')
  }

  const addBlog = (blog) => {
    const newBlog = { ...blog, id: String(blogs.length + 1), likes: 0, user }
    setBlogs(blogs.concat(newBlog))
    notify(`A new blog "${blog.title}" by ${blog.author} added successfully!`)
  }

  const handleLike = (blog) => {
    setBlogs(blogs.map(b => b.id === blog.id ? { ...b, likes: b.likes + 1 } : b))
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      setBlogs(blogs.filter(b => b.id !== id))
      notify('Blog post removed successfully')
    }
  }

  if (!user) {
    return (
      <div>
        <Notification msg={notification.msg} type={notification.type} />
        <LoginView onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <Router>
      <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
        <NavigationBar user={user} handleLogout={handleLogout} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <Notification msg={notification.msg} type={notification.type} />
          <Routes>
            <Route path="/" element={<BlogList blogs={blogs} />} />
            <Route path="/create" element={<NewBlogForm addBlog={addBlog} />} />
            <Route path="/blogs/:id" element={<SingleBlogView blogs={blogs} handleLike={handleLike} handleDelete={handleDelete} currentUser={user} />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App