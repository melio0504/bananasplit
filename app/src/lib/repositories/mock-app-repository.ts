import { mockAppData } from '@/lib/data/mock-data'

function localDelay<T>(value: T) {
  return Promise.resolve(value)
}

export function getDashboardData() {
  return localDelay(mockAppData.dashboard)
}

export function getActivityData() {
  return localDelay(mockAppData.activity)
}

export function getGroupsData() {
  return localDelay(mockAppData.dashboard.groups)
}

export function getGroupById(groupId: string) {
  return localDelay(
    mockAppData.groups[groupId as keyof typeof mockAppData.groups] ?? null,
  )
}

export function getExpenseById(expenseId: string) {
  return localDelay(
    mockAppData.expenses[expenseId as keyof typeof mockAppData.expenses] ?? null,
  )
}

export function getSettingsData() {
  return localDelay(mockAppData.settings)
}
