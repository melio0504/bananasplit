import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ResultItem = {
  id: string
  text: string
}

type ExpenseResultCardProps = {
  items: ResultItem[]
}

export function ExpenseResultCard({ items }: ExpenseResultCardProps) {
  return (
    <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div className="rounded-[22px] border border-emerald-200 bg-emerald-50/90 px-4 py-3" key={item.id}>
            <p className="text-sm text-emerald-800">{item.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
