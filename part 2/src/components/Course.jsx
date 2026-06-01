
const Header = ({ name }) => <h1>{name}</h1>

const Total = ({ parts }) => {
  // 2.3*: Using reduce to calculate the total exercises
  const total = parts.reduce((sum, part) => sum + part.exercises, 0)
  return <b>total of {total} exercises</b>
}

const Part = ({ part }) => (
  <p>
    {part.name} {part.exercises}
  </p>
)

const Content = ({ parts }) => (
  <div>
    {parts.map(part => (
      <Part key={part.id} part={part} />
    ))}
  </div>
)

const Course = ({ course }) => (
  <div>
    <Header name={course.name} />
    <Content parts={course.parts} />
    <Total parts={course.parts} />
  </div>
)

export default Course