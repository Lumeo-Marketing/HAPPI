import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@happi/utils'

export interface DashboardShellProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  contentClassName?: string
  header?: ReactNode
  mainId?: string
  sidebar: ReactNode
}

export function DashboardShell({
  children,
  className,
  contentClassName,
  header,
  mainId = 'main-content',
  sidebar,
  ...props
}: DashboardShellProps) {
  return (
    <div className={cn('happi-dashboard-shell', className)} {...props}>
      <aside className="happi-dashboard-shell__sidebar">{sidebar}</aside>

      <div className="happi-dashboard-shell__workspace">
        {header ? (
          <header className="happi-dashboard-shell__header">{header}</header>
        ) : null}
        <main
          className={cn('happi-dashboard-shell__content', contentClassName)}
          id={mainId}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
