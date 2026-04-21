import { cn } from '@/lib/utils'

type AppLogoProps = {
  className?: string
  compact?: boolean
}

export function AppLogo({ className, compact = false }: AppLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-banana-500),var(--color-banana-300))] shadow-[0_10px_24px_rgba(245,181,0,0.28)]">
        <div className="flex size-8 items-center justify-center rounded-xl bg-background/80 text-sm font-black text-[var(--color-banana-900)]">
          BS
        </div>
      </div>
      {!compact ? (
        <div className="space-y-0.5">
          <p className="text-sm font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            BananaSplit
          </p>
          <p className="text-lg font-semibold text-foreground">
            Split bills. Stay friends.
          </p>
        </div>
      ) : null}
    </div>
  )
}
