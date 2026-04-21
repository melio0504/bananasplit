import { useEffect, useState } from 'react'

import {
  ArrowRight,
  Coins,
  Delete,
  HandCoins,
  Plus,
  ReceiptText,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type QuickActionSheetProps = {
  isOpen: boolean
  onClose: () => void
  onOpenChange: (open: boolean) => void
  onSelectExpense: () => void
  onSelectSettlement: () => void
  view: 'actions' | 'expense' | 'settlement'
}

type ActionCardProps = {
  description: string
  icon: typeof ReceiptText
  onClick?: () => void
  title: string
}

type ExpenseStep = 'amount' | 'details'
type AdjustmentEntry = {
  amount: string
  id: string
  member: string
}

const GROUP_NAME = 'Beach Trip'
const MEMBERS = ['You', 'Ana', 'Mark', 'Lou']

function shouldShowMemberAvatar(index: number) {
  return index % 2 === 0
}

function ActionCard({
  description,
  icon: Icon,
  onClick,
  title,
}: ActionCardProps) {
  return (
    <button
      className="flex w-full items-start gap-3 rounded-[28px] border border-white/80 bg-white/85 p-4 text-left shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors hover:bg-white"
      onClick={onClick}
      type="button"
    >
      <div className="rounded-2xl bg-secondary p-3 text-secondary-foreground">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <ArrowRight className="size-4 text-muted-foreground" />
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </button>
  )
}

function Pill({
  active = false,
  showAvatar = false,
  children,
  onClick,
}: {
  active?: boolean
  children: string
  onClick?: () => void
  showAvatar?: boolean
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-white/80 text-foreground hover:bg-white',
      )}
      onClick={onClick}
      type="button"
    >
      {showAvatar ? (
        <Avatar className="size-6 border border-white/70">
          <AvatarFallback
            className={cn(
              'text-[10px] font-semibold',
              active
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            {children.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : null}
      {children}
    </button>
  )
}

function ActionChooser({
  onSelectExpense,
  onSelectGroup,
  onSelectSettlement,
}: {
  onSelectExpense: () => void
  onSelectGroup: () => void
  onSelectSettlement: () => void
}) {
  return (
    <div className="space-y-3 px-4 pb-2">
      <ActionCard
        description="Log who paid, split with members, and keep balances updated."
        icon={ReceiptText}
        onClick={onSelectExpense}
        title="Add expense"
      />
      <ActionCard
        description="Start a new household, trip, or barkada group."
        icon={Users}
        onClick={onSelectGroup}
        title="Create group"
      />
      <ActionCard
        description="Record a payment between members and reduce open balances."
        icon={HandCoins}
        onClick={onSelectSettlement}
        title="Settle up"
      />
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(value)
}

function parseAmount(raw: string) {
  if (!raw || raw === '.') {
    return 0
  }

  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatAmountDisplay(raw: string) {
  return formatCurrency(parseAmount(raw))
}

function appendAmountInput(current: string, next: string) {
  if (next === '.') {
    if (!current) {
      return '0.'
    }

    if (current.includes('.')) {
      return current
    }

    return `${current}.`
  }

  if (current === '0') {
    return next
  }

  const [whole = '', fractional = ''] = current.split('.')
  if (current.includes('.') && fractional.length >= 2) {
    return current
  }

  if (!current && next === '0') {
    return '0'
  }

  if (whole.length >= 7 && !current.includes('.')) {
    return current
  }

  return `${current}${next}`
}

function AmountKeypad({
  onBackspace,
  onClear,
  onDigit,
}: {
  onBackspace: () => void
  onClear: () => void
  onDigit: (value: string) => void
}) {
  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ] as const

  return (
    <div className="grid gap-3">
      {keypadRows.map((row) => (
        <div key={row.join('-')} className="grid grid-cols-3 gap-3">
          {row.map((key) => {
            if (key === 'backspace') {
              return (
                <button
                  key={key}
                  className="flex h-16 items-center justify-center rounded-[24px] border border-white/80 bg-white/85 text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors hover:bg-white"
                  onClick={onBackspace}
                  type="button"
                >
                  <Delete className="size-5" />
                </button>
              )
            }

            return (
              <button
                key={key}
                className="h-16 rounded-[24px] border border-white/80 bg-white/85 text-2xl font-semibold text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors hover:bg-white"
                onClick={() => onDigit(key)}
                type="button"
              >
                {key}
              </button>
            )
          })}
        </div>
      ))}

      <button
        className="h-14 rounded-[24px] bg-transparent text-sm font-medium text-destructive transition-colors hover:bg-white/40"
        onClick={onClear}
        type="button"
      >
        Clear
      </button>
    </div>
  )
}

function AmountStep({
  amountInput,
  title,
  onBackspace,
  onClear,
  onDigit,
}: {
  amountInput: string
  title: string
  onBackspace: () => void
  onClear: () => void
  onDigit: (value: string) => void
}) {
  return (
    <div className="space-y-5 px-4 pb-2">
      <div className="rounded-[28px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] px-5 py-6 text-center shadow-[0_18px_40px_rgba(63,52,25,0.08)]">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </p>
        <p className="mt-3 text-5xl font-semibold tracking-tight text-foreground">
          {formatAmountDisplay(amountInput)}
        </p>
      </div>

      <AmountKeypad onBackspace={onBackspace} onClear={onClear} onDigit={onDigit} />
    </div>
  )
}

function ExpenseDetailsStep({
  amountInput,
}: {
  amountInput: string
}) {
  const [paidBy, setPaidBy] = useState('You')
  const [selectedMembers, setSelectedMembers] = useState<string[]>(MEMBERS)
  const [adjustments, setAdjustments] = useState<AdjustmentEntry[]>([])
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false)
  const [adjustmentMember, setAdjustmentMember] = useState('')
  const [adjustmentAmountInput, setAdjustmentAmountInput] = useState('')
  const allSelected = selectedMembers.length === MEMBERS.length
  const hasValidAdjustment =
    adjustmentMember.length > 0 && parseAmount(adjustmentAmountInput) > 0

  const resetAdjustmentDraft = () => {
    setAdjustmentMember('')
    setAdjustmentAmountInput('')
  }

  const closeAdjustmentDrawer = () => {
    setIsAdjustmentOpen(false)
    resetAdjustmentDraft()
  }

  return (
    <>
      <div className="space-y-5 px-4 pb-2">
        <div className="grid gap-4">
          <div>
            <label
              className="mb-3 block text-sm font-medium text-foreground"
              htmlFor="expense-title"
            >
              Title
            </label>
            <Input
              className="mt-1 h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
              placeholder="Dinner"
              id="expense-title"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Group</p>
            <div className="rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-none">
              {GROUP_NAME}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Paid by</p>
            <div className="flex flex-wrap gap-2">
              {MEMBERS.map((member, index) => (
                <Pill
                  key={member}
                  active={paidBy === member}
                  onClick={() => setPaidBy(member)}
                  showAvatar={shouldShowMemberAvatar(index)}
                >
                  {member}
                </Pill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[minmax(0,9fr)_minmax(3.5rem,1fr)] gap-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Split with</p>
                <div className="flex flex-wrap gap-2">
                  {MEMBERS.map((member, index) => {
                    const active = selectedMembers.includes(member)

                    return (
                      <Pill
                        key={member}
                        active={active}
                        showAvatar={shouldShowMemberAvatar(index)}
                        onClick={() => {
                          if (allSelected) {
                            setSelectedMembers(MEMBERS.filter((item) => item !== member))
                            return
                          }

                          if (active) {
                            if (selectedMembers.length === 1) {
                              return
                            }

                            setSelectedMembers((current) =>
                              current.filter((item) => item !== member),
                            )
                            return
                          }

                          setSelectedMembers((current) => [...current, member])
                        }}
                      >
                        {member}
                      </Pill>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-start justify-end pt-7">
                <button
                  className={cn(
                    'h-10 w-full rounded-full border text-sm font-medium transition-colors',
                    allSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-white/80 text-foreground hover:bg-white',
                  )}
                  onClick={() => setSelectedMembers(MEMBERS)}
                  type="button"
                >
                  All
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">Adjustments</p>
              <button
                className="flex size-9 items-center justify-center rounded-full border border-white/80 bg-white/85 text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors hover:bg-white"
                onClick={() => setIsAdjustmentOpen(true)}
                type="button"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {adjustments.length > 0 ? (
              <div className="space-y-2">
                {adjustments.map((adjustment) => (
                  <div
                    key={adjustment.id}
                    className="flex items-center justify-between rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-none"
                  >
                    <span className="font-medium">{adjustment.member}</span>
                    <span className="text-muted-foreground">
                      {formatAmountDisplay(adjustment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-border/80 bg-white/50 px-4 py-3 text-sm text-muted-foreground">
                No adjustments yet.
              </div>
            )}
          </div>

          <div className="rounded-[26px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Coins className="size-4 text-[var(--color-banana-900)]" />
              Preview
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {selectedMembers.length} member
              {selectedMembers.length === 1 ? '' : 's'} selected. Current amount is{' '}
              {formatAmountDisplay(amountInput)}.
            </p>
          </div>
        </div>
      </div>

      <Drawer
        direction="bottom"
        modal
        open={isAdjustmentOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeAdjustmentDrawer()
            return
          }

          setIsAdjustmentOpen(true)
        }}
      >
        <DrawerContent className="mx-auto h-[100svh] max-h-[100svh] max-w-3xl border-none bg-[#fffdf6] data-[vaul-drawer-direction=bottom]:top-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none data-[vaul-drawer-direction=bottom]:rounded-none sm:data-[vaul-drawer-direction=bottom]:rounded-t-[32px]">
          <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
            <DrawerTitle className="text-xl font-semibold">Adjustments</DrawerTitle>
            <DrawerDescription>
              {adjustmentAmountInput
                ? formatAmountDisplay(adjustmentAmountInput)
                : 'Select member and enter amount'}
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">User selection</p>
                <div className="flex flex-wrap gap-2">
                  {MEMBERS.map((member, index) => (
                    <Pill
                      key={member}
                      active={adjustmentMember === member}
                      showAvatar={shouldShowMemberAvatar(index)}
                      onClick={() => setAdjustmentMember(member)}
                    >
                      {member}
                    </Pill>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] px-5 py-6 text-center shadow-[0_18px_40px_rgba(63,52,25,0.08)]">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Adjustment amount
                </p>
                <p className="mt-3 text-5xl font-semibold tracking-tight text-foreground">
                  {formatAmountDisplay(adjustmentAmountInput)}
                </p>
              </div>

              <AmountKeypad
                onBackspace={() =>
                  setAdjustmentAmountInput((current) => current.slice(0, -1))
                }
                onClear={() => setAdjustmentAmountInput('')}
                onDigit={(value) =>
                  setAdjustmentAmountInput((current) =>
                    appendAmountInput(current, value),
                  )
                }
              />
            </div>
          </div>

          <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
            <Button
              className="h-12 rounded-2xl"
              disabled={!hasValidAdjustment}
              onClick={() => {
                setAdjustments((current) => [
                  ...current,
                  {
                    amount: adjustmentAmountInput,
                    id: `${adjustmentMember}-${Date.now()}`,
                    member: adjustmentMember,
                  },
                ])
                closeAdjustmentDrawer()
              }}
              type="button"
            >
              Confirm
            </Button>
            <Button
              className="h-12 rounded-2xl"
              variant="secondary"
              onClick={closeAdjustmentDrawer}
              type="button"
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

function SettlementDetailsStep({
  amountInput,
}: {
  amountInput: string
}) {
  const [paidBy, setPaidBy] = useState('You')
  const [receivedBy, setReceivedBy] = useState('Ana')
  const canConfirmSettlement = paidBy !== receivedBy

  return (
    <div className="space-y-5 px-4 pb-2">
      <div className="grid gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Group</p>
          <div className="rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-none">
            {GROUP_NAME}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Paid by</p>
          <div className="flex flex-wrap gap-2">
            {MEMBERS.map((member, index) => (
              <Pill
                key={member}
                active={paidBy === member}
                onClick={() => setPaidBy(member)}
                showAvatar={shouldShowMemberAvatar(index)}
              >
                {member}
              </Pill>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Received by</p>
          <div className="flex flex-wrap gap-2">
            {MEMBERS.map((member, index) => (
              <Pill
                key={member}
                active={receivedBy === member}
                onClick={() => setReceivedBy(member)}
                showAvatar={shouldShowMemberAvatar(index)}
              >
                {member}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <label
            className="mb-3 block text-sm font-medium text-foreground"
            htmlFor="settlement-note"
          >
            Note
          </label>
          <Input
            className="mt-1 h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
            id="settlement-note"
            placeholder="Transfer after dinner"
          />
        </div>

        <div className="rounded-[26px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Coins className="size-4 text-[var(--color-banana-900)]" />
            Preview
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {paidBy} pays {receivedBy} {formatAmountDisplay(amountInput)}.
          </p>
          {!canConfirmSettlement ? (
            <p className="mt-2 text-sm text-destructive">
              Paid by and received by must be different.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function QuickActionSheet({
  isOpen,
  onClose,
  onOpenChange,
  onSelectExpense,
  onSelectSettlement,
  view,
}: QuickActionSheetProps) {
  const [expenseStep, setExpenseStep] = useState<ExpenseStep>('amount')
  const [amountInput, setAmountInput] = useState('')
  const hasValidAmount = parseAmount(amountInput) > 0
  const actionView = view === 'settlement' ? 'settlement' : 'expense'
  const actionTitle = actionView === 'expense' ? 'Add expense' : 'Settle up'
  const amountPrompt =
    actionView === 'expense' ? 'Enter expense amount' : 'Enter payment amount'

  useEffect(() => {
    if (!isOpen || view === 'actions') {
      setExpenseStep('amount')
      setAmountInput('')
    }
  }, [isOpen, view])

  return (
    <Drawer
      direction="bottom"
      modal
      open={isOpen}
      shouldScaleBackground
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          onClose()
        }
      }}
    >
      <DrawerContent className="mx-auto h-[100svh] max-h-[100svh] max-w-3xl border-none bg-[#fffdf6] data-[vaul-drawer-direction=bottom]:top-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none data-[vaul-drawer-direction=bottom]:rounded-none sm:data-[vaul-drawer-direction=bottom]:rounded-t-[32px]">
        <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
          <DrawerTitle className="text-xl font-semibold">
            {view === 'actions' ? 'Quick actions' : actionTitle}
          </DrawerTitle>
          <DrawerDescription>
            {view === 'actions'
              ? 'Choose what you want to do next. This is wireframe-only for now.'
              : expenseStep === 'amount'
                ? amountPrompt
                : formatAmountDisplay(amountInput)}
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {view === 'actions' ? (
            <ActionChooser
              onSelectExpense={onSelectExpense}
              onSelectGroup={() => {
                onClose()
                window.location.assign('/groups/new')
              }}
              onSelectSettlement={onSelectSettlement}
            />
          ) : expenseStep === 'amount' ? (
            <AmountStep
              amountInput={amountInput}
              title={amountPrompt}
              onBackspace={() => setAmountInput((current) => current.slice(0, -1))}
              onClear={() => setAmountInput('')}
              onDigit={(value) => setAmountInput((current) => appendAmountInput(current, value))}
            />
          ) : actionView === 'settlement' ? (
            <SettlementDetailsStep amountInput={amountInput} />
          ) : (
            <ExpenseDetailsStep amountInput={amountInput} />
          )}
        </div>

        <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
          {view === 'actions' ? (
            <Button className="h-12 rounded-2xl" onClick={onSelectExpense} type="button">
              <Plus className="size-4" />
              Add expense
            </Button>
          ) : expenseStep === 'amount' ? (
            <Button
              className="h-12 rounded-2xl"
              disabled={!hasValidAmount}
              onClick={() => setExpenseStep('details')}
              type="button"
            >
              Continue
            </Button>
          ) : actionView === 'settlement' ? (
            <Button className="h-12 rounded-2xl" type="button">
              Confirm settlement
            </Button>
          ) : (
            <Button className="h-12 rounded-2xl" type="button">
              Confirm expense
            </Button>
          )}
          <Button className="h-12 rounded-2xl" variant="secondary" onClick={onClose} type="button">
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
