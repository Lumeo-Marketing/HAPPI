import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@happi/utils'

export interface AuthShellProps extends HTMLAttributes<HTMLDivElement> {
  brand?: ReactNode
  children: ReactNode
  contentClassName?: string
  footer?: ReactNode
  visual?: ReactNode
}

export function AuthShell({
  brand,
  children,
  className,
  contentClassName,
  footer,
  visual,
  ...props
}: AuthShellProps) {
  return (
    <div
      className={cn(
        'happi-auth-shell',
        visual && 'happi-auth-shell--with-visual',
        className,
      )}
      {...props}
    >
      {visual ? (
        <aside className="happi-auth-shell__visual">{visual}</aside>
      ) : null}

      <main className="happi-auth-shell__main">
        <div className={cn('happi-auth-shell__content', contentClassName)}>
          {brand ? (
            <div className="happi-auth-shell__brand">{brand}</div>
          ) : null}
          {children}
          {footer ? (
            <footer className="happi-auth-shell__footer">{footer}</footer>
          ) : null}
        </div>
      </main>
    </div>
  )
}
