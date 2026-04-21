import { Link } from 'react-router-dom'

import { MobileShell } from '@/components/common/mobile-shell'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <MobileShell showBottomNav={false}>
      <div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          This banana slipped away.
        </h1>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Route not found in this mobile MVP yet.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    </MobileShell>
  )
}
