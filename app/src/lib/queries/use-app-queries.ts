import { useQuery } from '@tanstack/react-query'

import {
  getActivityData,
  getDashboardData,
  getExpenseById,
  getGroupById,
  getGroupsData,
  getSettingsData,
} from '@/lib/repositories/mock-app-repository'

export function useActivityQuery() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: getActivityData,
  })
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  })
}

export function useGroupsQuery() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: getGroupsData,
  })
}

export function useGroupQuery(groupId: string) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroupById(groupId),
  })
}

export function useExpenseQuery(expenseId: string) {
  return useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => getExpenseById(expenseId),
  })
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettingsData,
  })
}
