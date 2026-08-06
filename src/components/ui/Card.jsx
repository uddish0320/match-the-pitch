export default function Card({ className = '', children }) {
  return (
    <div
      className={`glass rounded-3xl ${className}`}
    >
      {children}
    </div>
  )
}
