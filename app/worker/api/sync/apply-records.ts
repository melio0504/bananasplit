import type { AppliedSyncRecord, D1Database, SyncOperationInput } from '../types'
import { ensureOwnerGroupAccess, grantAccessForGroupMember, userCanWriteGroup } from './collaboration'

const tableByEntityType: Record<string, string> = {
  budget: 'budgets',
  expense: 'expenses',
  expenseShare: 'expense_shares',
  group: 'groups',
  groupMember: 'group_members',
  member: 'members',
  recurringExpense: 'recurring_expenses',
  settlement: 'settlements',
  settings: 'user_settings',
}

function parsePayload(payload: SyncOperationInput['payload']) {
  if (typeof payload !== 'string') {
    return payload
  }

  return JSON.parse(payload) as Record<string, unknown>
}

function normalizeOperation(operation: SyncOperationInput) {
  const payload = parsePayload(operation.payload)
  if (operation.entityType === 'expense' && 'expense' in payload) {
    const expense = payload.expense as Record<string, unknown>
    return {
      ...operation,
      entityId: String(expense.id ?? operation.entityId),
      payload: {
        expense,
        shares: Array.isArray(payload.shares) ? payload.shares : [],
      },
    }
  }
  if (operation.entityType === 'expense' && 'recurringExpense' in payload) {
    return {
      ...operation,
      entityId: String((payload.recurringExpense as { id?: string }).id ?? operation.entityId),
      entityType: 'recurringExpense',
      payload: payload.recurringExpense as Record<string, unknown>,
    }
  }

  return { ...operation, payload }
}

export async function applyRecord(db: D1Database, userId: string, deviceId: string, input: SyncOperationInput) {
  const operation = normalizeOperation(input)
  const table = tableByEntityType[operation.entityType]

  if (!table) {
    throw new Error(`Unsupported entity type: ${operation.entityType}`)
  }

  const payload = operation.payload as Record<string, unknown>
  const recordPayload = 'expense' in payload && operation.entityType === 'expense'
    ? payload.expense as Record<string, unknown>
    : payload
  const payloadText = JSON.stringify(recordPayload)
  const updatedAt = Number(recordPayload.updatedAt ?? recordPayload.createdAt ?? Date.now())
  const deletedAt = typeof recordPayload.deletedAt === 'number' ? recordPayload.deletedAt : null

  if (operation.entityType === 'settings') {
    await db
      .prepare(
        `INSERT INTO user_settings (user_id, device_id, payload, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id, device_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
      )
      .bind(userId, deviceId, payloadText, updatedAt)
      .run()
    return [{ ...operation, groupId: null, payload: { ...payload, accountAvatarUrl: payload.accountAvatarUrl ?? null } }]
  }

  const groupId = typeof recordPayload.groupId === 'string' ? recordPayload.groupId : null
  const memberId = typeof recordPayload.memberId === 'string' ? recordPayload.memberId : null
  const expenseId = typeof recordPayload.expenseId === 'string' ? recordPayload.expenseId : null
  const canWrite = await userCanWriteGroup(db, userId, groupId)
  if (!canWrite) {
    throw new Error('You do not have access to this group.')
  }

  if (table === 'groups' || table === 'members') {
    await db
      .prepare(
        `INSERT INTO ${table} (user_id, id, payload, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id, id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at, deleted_at = excluded.deleted_at`,
      )
      .bind(userId, operation.entityId, payloadText, updatedAt, deletedAt)
      .run()
    if (table === 'groups') {
      await ensureOwnerGroupAccess(db, userId, operation.entityId)
    }
  } else if (table === 'expense_shares') {
    await db
      .prepare(
        `INSERT INTO expense_shares (user_id, id, expense_id, payload, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id, id) DO UPDATE SET expense_id = excluded.expense_id, payload = excluded.payload, updated_at = excluded.updated_at`,
      )
      .bind(userId, operation.entityId, expenseId, payloadText, updatedAt)
      .run()
  } else if (table === 'group_members') {
    await db
      .prepare(
        `INSERT INTO group_members (user_id, id, group_id, member_id, payload, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, id) DO UPDATE SET group_id = excluded.group_id, member_id = excluded.member_id, payload = excluded.payload, updated_at = excluded.updated_at, deleted_at = excluded.deleted_at`,
      )
      .bind(userId, operation.entityId, groupId, memberId, payloadText, updatedAt, deletedAt)
      .run()
    await grantAccessForGroupMember(db, userId, groupId, memberId)
  } else {
    await db
      .prepare(
        `INSERT INTO ${table} (user_id, id, group_id, payload, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, id) DO UPDATE SET group_id = excluded.group_id, payload = excluded.payload, updated_at = excluded.updated_at, deleted_at = excluded.deleted_at`,
      )
      .bind(userId, operation.entityId, groupId, payloadText, updatedAt, deletedAt)
      .run()
  }

  const applied: AppliedSyncRecord[] = [{
    entityId: operation.entityId,
    entityType: operation.entityType,
    groupId: operation.entityType === 'group' ? operation.entityId : groupId,
    operation: operation.operation,
    payload: recordPayload,
  }]

  if (operation.entityType === 'expense' && 'expense' in payload && Array.isArray(payload.shares)) {
    await db.prepare('DELETE FROM expense_shares WHERE user_id = ? AND expense_id = ?').bind(userId, operation.entityId).run()
    for (const share of payload.shares as Array<Record<string, unknown>>) {
      const shareId = String(share.id)
      await db
        .prepare(
          `INSERT INTO expense_shares (user_id, id, expense_id, payload, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(user_id, id) DO UPDATE SET expense_id = excluded.expense_id, payload = excluded.payload, updated_at = excluded.updated_at`,
        )
        .bind(userId, shareId, operation.entityId, JSON.stringify(share), Number(share.updatedAt ?? updatedAt))
        .run()
      applied.push({
        entityId: shareId,
        entityType: 'expenseShare',
        groupId,
        operation: operation.operation,
        payload: share,
      })
    }
  }

  return applied
}
