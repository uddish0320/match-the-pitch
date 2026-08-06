import { motion } from 'framer-motion'

function Star({ filled, size, delay }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={size}
      initial={{ scale: 0, rotate: -40, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, delay }}
      aria-hidden
    >
      <defs>
        <linearGradient id="star-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l2.94 6.26 6.56.7-4.9 4.5 1.35 6.54L12 16.9 6.05 20l1.35-6.54-4.9-4.5 6.56-.7z"
        fill={filled ? 'url(#star-grad)' : 'rgba(255,255,255,0.10)'}
        stroke={filled ? 'none' : 'rgba(255,255,255,0.28)'}
        strokeWidth="1"
      />
    </motion.svg>
  )
}

/** Three-star rating. `rating` is 0–3; unfilled stars show as faint outlines. */
export default function StarRating({ rating, size = 'h-14 w-14' }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label={`${rating} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <Star key={i} filled={i < rating} size={size} delay={0.2 + i * 0.18} />
      ))}
    </div>
  )
}
