import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'

import { QuickActionSheet } from '@/features/quick-actions/components/quick-action-sheet'

type SheetView = 'actions' | 'expense' | 'settlement'

type QuickActionContextValue = {
  closeSheet: () => void
  openActionSheet: () => void
  openExpenseSheet: () => void
  openSettlementSheet: () => void
}

const QuickActionContext = createContext<QuickActionContextValue | null>(null)

export function QuickActionProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<SheetView>('actions')

  const value = useMemo<QuickActionContextValue>(
    () => ({
      closeSheet: () => {
        setIsOpen(false)
        setView('actions')
      },
      openActionSheet: () => {
        setView('actions')
        setIsOpen(true)
      },
      openExpenseSheet: () => {
        setView('expense')
        setIsOpen(true)
      },
      openSettlementSheet: () => {
        setView('settlement')
        setIsOpen(true)
      },
    }),
    [],
  )

  return (
    <QuickActionContext.Provider value={value}>
      {children}
      <QuickActionSheet
        isOpen={isOpen}
        onClose={value.closeSheet}
        onOpenChange={setIsOpen}
        onSelectExpense={value.openExpenseSheet}
        onSelectSettlement={value.openSettlementSheet}
        view={view}
      />
    </QuickActionContext.Provider>
  )
}

export function useQuickActions() {
  const context = useContext(QuickActionContext)

  if (!context) {
    throw new Error('useQuickActions must be used within QuickActionProvider')
  }

  return context
}
