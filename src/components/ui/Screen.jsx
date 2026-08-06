import { motion } from 'framer-motion'

/** Shared enter/exit transition so every game screen swaps fluidly. */
export default function Screen({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full flex-col items-center justify-center"
    >
      {children}
    </motion.div>
  )
}
