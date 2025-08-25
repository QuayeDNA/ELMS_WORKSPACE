import React from 'react'

export const Skeleton: React.FC<{ width?: string; height?: string; className?: string }> = ({ width='100%', height='1rem', className='' }) => (
  <div
    className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded ${className}`}
    style={{ width, height }}
  />
)

export default Skeleton
