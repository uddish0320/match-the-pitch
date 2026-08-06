import { motion } from 'framer-motion'

/** Shared enter/exit transition so every game screen swaps fluidly. */
export default function Screen({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -26, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex w-full flex-col items-center justify-center"
    >
      {children}
    </motion.div>
  )
}
