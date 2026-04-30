import { appDb, type AppSettingsRecord, type SyncOutboxRecord } from '@/lib/db/app-db'
import { getApiToken } from '@/lib/auth/google-auth'
import { getSettingsRecord } from '@/lib/repositories/mock-app-repository/core'

const MANUAL_SYNC_REQUIRED_KEY = 'bananasplit.manualSyncRequired'

type PushResponse = {
  accepted: string[]
  duplicate: string[]
  failed: { error: string; id: string }[]
}

type PullChange = {
  cursor: string
  deviceId: string
  entityId: string
  entityType: SyncOutboxRecord['entityType']
  operation: SyncOutboxRecord['operation']
  payload: Record<string, unknown>
}

type PullResponse = {
  changes: PullChange[]
  cursor: string
  hasMore: boolean
}

const tableByEntityType = {
  budget: appDb.budgets,
  expense: appDb.expenses,
  expenseShare: appDb.expenseShares,
  group: appDb.groups,
  groupMember: appDb.groupMembers,
  member: appDb.members,
  recurringExpense: appDb.recurringExpenses,
  settlement: appDb.settlements,
} as const

export async function getPendingSyncCount() {
  return appDb.syncOutbox.where('status').anyOf('pending', 'failed').count()
}

export function isManualSyncRequired() {
  return localStorage.getItem(MANUAL_SYNC_REQUIRED_KEY) === 'true'
}

export function setManualSyncRequired(required: boolean) {
  if (required) {
    localStorage.setItem(MANUAL_SYNC_REQUIRED_KEY, 'true')
  } else {
    localStorage.removeItem(MANUAL_SYNC_REQUIRED_KEY)
  }
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getApiToken()

  if (!token) {
    throw new Error('Not signed in.')
  }

  const response = await fetch(path, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...init.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Sync request failed: ${response.status}`)
  }

  return response
}

async function pushPendingOperations(settings: AppSettingsRecord) {
  const operations = await appDb.syncOutbox.where('status').anyOf('pending', 'failed').sortBy('createdAt')

  if (operations.length === 0) {
    return
  }

  const response = await apiFetch('/api/sync/push', {
    body: JSON.stringify({
      deviceId: settings.deviceId,
      operations: operations.map((operation) => ({
        entityId: operation.entityId,
        entityType: operation.entityType,
        id: operation.id,
        operation: operation.operation,
        payload: operation.payload,
      })),
    }),
    method: 'POST',
  })
  const result = (await response.json()) as PushResponse
  const sentIds = new Set([...result.accepted, ...result.duplicate])
  const failedById = new Map(result.failed.map((item) => [item.id, item.error]))

  await appDb.transaction('rw', appDb.syncOutbox, async () => {
    await Promise.all(
      operations.map((operation) => {
        if (sentIds.has(operation.id)) {
          return appDb.syncOutbox.update(operation.id, { status: 'sent' })
        }

        if (failedById.has(operation.id)) {
          return appDb.syncOutbox.update(operation.id, {
            retryCount: operation.retryCount + 1,
            status: 'failed',
          })
        }

        return Promise.resolve()
      }),
    )
  })
}

async function applyPullChanges(settings: AppSettingsRecord, changes: PullChange[]) {
  const remoteChanges = changes.filter((change) => change.deviceId !== settings.deviceId)

  await appDb.transaction(
    'rw',
    [
      appDb.budgets,
      appDb.expenseShares,
      appDb.expenses,
      appDb.groupMembers,
      appDb.groups,
      appDb.members,
      appDb.recurringExpenses,
      appDb.settings,
      appDb.settlements,
    ],
    async () => {
      for (const change of remoteChanges) {
        if (change.entityType === 'settings') {
          continue
        }

        const table = tableByEntityType[change.entityType as keyof typeof tableByEntityType]
        if (!table) {
          continue
        }

        await table.put({ ...change.payload, id: change.entityId } as never)
      }
    },
  )
}

async function pullRemoteChanges(settings: AppSettingsRecord) {
  let cursor = settings.lastSyncCursor ?? '0'
  let hasMore = true

  while (hasMore) {
    const response = await apiFetch(`/api/sync/pull?cursor=${encodeURIComponent(cursor)}`)
    const result = (await response.json()) as PullResponse
    await applyPullChanges(settings, result.changes)
    cursor = result.cursor
    hasMore = result.hasMore
  }

  await appDb.settings.update('settings', { lastSyncCursor: cursor, updatedAt: Date.now() })
}

export async function syncCurrentAccount() {
  if (!navigator.onLine) {
    return
  }

  const settings = await getSettingsRecord()
  if (!settings.isSignedIn || !getApiToken()) {
    return
  }

  await pushPendingOperations(settings)
  await pullRemoteChanges(settings)
  setManualSyncRequired(false)
}
