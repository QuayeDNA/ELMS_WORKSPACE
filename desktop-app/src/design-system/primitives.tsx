import React from 'react'
export const DSButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'outline' }> = ({ variant = 'primary', children, className='', ...rest }) => {
  const base = 'px-4 py-2 rounded-md font-medium focus:outline-none transition'
  if (variant === 'primary') {
    return (
      <button
        {...rest}
        className={`${base} ${className}`}
        style={{ backgroundColor: 'var(--ds-primary)', color: 'var(--ds-on-surface)' }}
      >
        {children}
      </button>
    )
  }
  return (
    <button
      {...rest}
      className={`${base} ${className}`}
      style={{ backgroundColor: 'transparent', borderColor: 'var(--ds-outline)', color: 'var(--ds-primary)', borderWidth: 1 }}
    >
      {children}
    </button>
  )
}

export const DSCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className='' }) => (
  <div className={`rounded-lg p-4 ${className}`} style={{ backgroundColor: 'var(--ds-surface)', border: '1px solid var(--ds-outline)' }}>{children}</div>
)

export default { DSButton, DSCard }
