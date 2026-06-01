const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  }

  // Choose the CSS class based on the 'type' prop ('success' or 'error')
  const className = type === 'error' ? 'notification error' : 'notification success'

  return (
    <div className={className}>
      {message}
    </div>
  )
}

export default Notification