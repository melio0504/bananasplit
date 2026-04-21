import { PencilLine, Trash2 } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ExpenseBreakdownCard } from '@/features/expenses/components/expense-breakdown-card'
import { ExpenseResultCard } from '@/features/expenses/components/expense-result-card'
import { useExpenseQuery } from '@/lib/queries/use-app-queries'

export function ExpenseDetailsPage() {
  const { expenseId = '' } = useParams()
  const { data: expense } = useExpenseQuery(expenseId)

  if (!expense) {
    return null
  }

  return (
    <MobileShell>
      <ScreenHeader backHref={`/groups/${expense.groupId}`} title="Expense details" />

      <div className="space-y-4">
        <Card className="border-0 bg-[linear-gradient(160deg,#fff8da,#fffef8)] shadow-[0_16px_32px_rgba(245,181,0,0.16)]">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-sm text-muted-foreground">{expense.date}</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                {expense.title}
              </h2>
              <p className="mt-2 text-xl font-semibold text-[var(--color-banana-950)]">
                {expense.amount}
              </p>
            </div>
            <div className="grid gap-3 rounded-[26px] bg-white/80 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Paid by
                </p>
                <p className="mt-1 text-sm text-foreground">{expense.paidBy}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Split between
                </p>
                <p className="mt-1 text-sm text-foreground">{expense.participants.join(', ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ExpenseBreakdownCard items={expense.breakdown} />
        <ExpenseResultCard items={expense.result} />

        <div className="grid grid-cols-2 gap-3">
          <Button className="h-12 rounded-2xl" variant="secondary">
            <Trash2 className="size-4" />
            Delete
          </Button>
          <Button className="h-12 rounded-2xl">
            <PencilLine className="size-4" />
            Edit split
          </Button>
        </div>
      </div>
    </MobileShell>
  )
}
