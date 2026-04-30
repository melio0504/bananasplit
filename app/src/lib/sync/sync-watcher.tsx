import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { getPendingSyncCount, isManualSyncRequired, syncCurrentAccount } from '@/lib/sync/sync-client'
import { getSettingsRecord } from '@/lib/repositories/mock-app-repository/core'

const APP_QUERY_KEYS = [
  'activity',
  'all-groups',
  'dashboard',
  'groups',
  'notifications',
  'pending-sync-count',
  'search',
  'selectable-groups',
  'settings',
]

export function SyncWatcher() {
  const queryClient = useQueryClient()
  const isRunningRef = useRef(false)

  useEffect(() => {
    async function run() {
      if (isRunningRef.current || !navigator.onLine || isManualSyncRequired()) {
        return
      }

      const [settings, pendingCount] = await Promise.all([getSettingsRecord(), getPendingSyncCount()])
      if (!settings.isSignedIn || pendingCount === 0) {
        return
      }

      isRunningRef.current = true
      try {
        await syncCurrentAccount()
        await Promise.all(APP_QUERY_KEYS.map((key) => queryClient.invalidateQueries({ queryKey: [key] })))
      } finally {
        isRunningRef.current = false
      }
    }

    const intervalId = window.setInterval(run, 5000)
    window.addEventListener('focus', run)
    window.addEventListener('online', run)
    void run()

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', run)
      window.removeEventListener('online', run)
    }
  }, [queryClient])

  return null
}
