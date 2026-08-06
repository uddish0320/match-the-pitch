export default function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/50 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  )
}
