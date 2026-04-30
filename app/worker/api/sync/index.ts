import { randomId } from '../crypto'
import { ApiError, json, readJson, requireSession } from '../http'
import type { ApiContext, SyncChange, SyncOperationInput } from '../types'
import { applyRecord } from './apply-records'

type PushBody = {
  deviceId?: string
  operations?: SyncOperationInput[]
}

export async function handleSyncPush(context: ApiContext) {
  const user = await requireSession(context)
  const body = await readJson<PushBody>(context.request)
  const deviceId = body.deviceId
  const operations = body.operations ?? []

  if (!deviceId) {
    throw new ApiError(400, 'Missing deviceId.')
  }
  if (!Array.isArray(operations)) {
    throw new ApiError(400, 'operations must be an array.')
  }

  const accepted: string[] = []
  const duplicate: string[] = []
  const failed: { id: string; error: string }[] = []
  const now = Date.now()

  for (const operation of operations) {
    try {
      const existing = await context.env.DB.prepare(
        'SELECT id FROM sync_operations WHERE user_id = ? AND client_operation_id = ?',
      )
        .bind(user.id, operation.id)
        .first<{ id: string }>()

      if (existing) {
        duplicate.push(operation.id)
        continue
      }

      const appliedRecords = await applyRecord(context.env.DB, user.id, deviceId, operation)
      const operationId = randomId('op')
      const primaryRecord = appliedRecords[0]
      const payloadText = JSON.stringify(primaryRecord.payload)

      const writeStatements = [
        context.env.DB.prepare(
          `INSERT INTO sync_operations (id, user_id, device_id, client_operation_id, entity_type, entity_id, operation, payload, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(operationId, user.id, deviceId, operation.id, primaryRecord.entityType, primaryRecord.entityId, primaryRecord.operation, payloadText, now),
        ...appliedRecords.map((applied) =>
          context.env.DB.prepare(
            `INSERT INTO sync_changes (user_id, device_id, operation_id, entity_type, entity_id, operation, payload, created_at, group_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).bind(
            user.id,
            deviceId,
            operationId,
            applied.entityType,
            applied.entityId,
            applied.operation,
            JSON.stringify(applied.payload),
            now,
            applied.groupId,
          ),
        ),
      ]

      await context.env.DB.batch(writeStatements)

      accepted.push(operation.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown sync error.'
      failed.push({ id: operation.id, error: message })
      await context.env.DB.prepare(
        `INSERT INTO failed_operations (id, user_id, device_id, client_operation_id, entity_type, entity_id, operation, payload, error, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          randomId('fail'),
          user.id,
          deviceId,
          operation.id,
          operation.entityType ?? null,
          operation.entityId ?? null,
          operation.operation ?? null,
          typeof operation.payload === 'string' ? operation.payload : JSON.stringify(operation.payload ?? null),
          message,
          now,
        )
        .run()
    }
  }

  return json({ accepted, duplicate, failed })
}

export async function handleSyncPull(context: ApiContext) {
  const user = await requireSession(context)
  const cursor = Number(context.url.searchParams.get('cursor') ?? '0')
  const limit = 100
  const rows = await context.env.DB.prepare(
    `SELECT id, device_id AS deviceId, entity_type AS entityType, entity_id AS entityId, operation, payload
     FROM sync_changes
     WHERE id > ?
       AND (
         user_id = ?
         OR group_id IN (SELECT group_id FROM group_access WHERE user_id = ?)
       )
     ORDER BY id ASC
     LIMIT ?`,
  )
    .bind(Number.isFinite(cursor) ? cursor : 0, user.id, user.id, limit + 1)
    .all<{
      deviceId: string
      entityId: string
      entityType: string
      id: number
      operation: string
      payload: string
    }>()

  const results = rows.results ?? []
  const page = results.slice(0, limit)
  const nextCursor = page.length > 0 ? String(page[page.length - 1].id) : String(cursor || 0)
  const changes: SyncChange[] = page.map((row) => ({
    cursor: String(row.id),
    deviceId: row.deviceId,
    entityId: row.entityId,
    entityType: row.entityType,
    operation: row.operation,
    payload: JSON.parse(row.payload),
  }))

  return json({
    changes,
    cursor: nextCursor,
    hasMore: results.length > limit,
  })
}
