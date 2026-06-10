import { useState } from 'react'

const Blog = ({ blog, updateBlog, deleteBlog, currentUser }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLike = () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user?.id || blog.user 
    }
    updateBlog(blog.id, updatedBlog)
  }

  const handleRemove = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      deleteBlog(blog.id)
    }
  }

  // Determine ownership for conditional delete visibility
  const blogCreatorUsername = blog.user?.username || blog.user?.user
  const showRemoveButton = currentUser && (blogCreatorUsername === currentUser.username)
return (
  <div style={blogStyle} className="blog">
    {/* Short view container */}
    <div className="blog-short">
      {blog.title} {blog.author}{' '}
      <button onClick={toggleVisibility}>{visible ? 'hide' : 'view'}</button>
    </div>
    
    {/* Detailed view container */}
    {visible && (
      <div className="blog-detailed">
        <div><a href={blog.url} target="_blank" rel="noreferrer">{blog.url}</a></div>
        <div>
          likes {blog.likes} <button onClick={handleLike}>like</button>
        </div>
        <div>{blog.user?.name || currentUser?.name}</div>
        {showRemoveButton && (
          <button onClick={handleRemove}>remove</button>
        )}
      </div>
    )}
  </div>
)
}

export default Blog