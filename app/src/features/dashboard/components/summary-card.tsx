import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

type SummaryCardProps = {
  attention: string
  net: string
  openBalances: string
  owed: string
  owes: string
}

export function SummaryCard({ attention, net, openBalances, owed, owes }: SummaryCardProps) {
  return (
    <Card className="overflow-hidden border-0 bg-[linear-gradient(160deg,var(--color-banana-200),var(--color-banana-50)_60%,#fff)] shadow-[0_20px_40px_rgba(245,181,0,0.22)]">
      <CardContent className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-banana-900)]/70">
            Overall position
          </p>
          <p className="text-3xl font-semibold tracking-tight text-[var(--color-banana-950)]">
            {net}
          </p>
          <p className="text-sm text-[var(--color-banana-900)]/70">
            {attention}
          </p>
        </div>
        <div className="rounded-[24px] bg-white/72 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Open balances
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">{openBalances}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[24px] bg-white/70 p-4">
            <ArrowDownLeft className="mb-3 size-4 text-orange-600" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              You owe
            </p>
            <p className="mt-1 text-lg font-semibold text-orange-700">{owes}</p>
          </div>
          <div className="rounded-[24px] bg-white/70 p-4">
            <ArrowUpRight className="mb-3 size-4 text-emerald-600" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              You are owed
            </p>
            <p className="mt-1 text-lg font-semibold text-emerald-700">{owed}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
