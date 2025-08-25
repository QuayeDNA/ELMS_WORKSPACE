import React from 'react'

export const Loader: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => {
  const s = size
  return (
  <output aria-live="polite" className="inline-flex items-center" aria-label="Loading">
      <svg
        className={`animate-spin text-current ${className}`}
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="sr-only">Loading</span>
    </output>
  )
}

export default Loader
