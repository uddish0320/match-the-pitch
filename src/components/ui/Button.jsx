import { motion } from 'framer-motion'

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-brand-500 to-berry-500 text-white shadow-lg shadow-brand-500/30 hover:from-brand-400 hover:to-berry-400',
  ghost: 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10',
  dark: 'bg-ink-800 text-slate-100 border border-white/10 hover:bg-ink-700',
}

const SIZES = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-lg',
}

/**
 * Accessible, animated button with three visual variants.
 * Accepts all standard <button> props (onClick, disabled, type, …).
 */
export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl font-semibold tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
