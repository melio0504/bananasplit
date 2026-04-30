import type { D1Database } from '../types'

export async function ensureOwnerGroupAccess(db: D1Database, ownerUserId: string, groupId: string, now = Date.now()) {
  await db
    .prepare(
      `INSERT INTO group_access (group_id, user_id, owner_user_id, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(group_id, user_id) DO UPDATE SET role = excluded.role, updated_at = excluded.updated_at`,
    )
    .bind(groupId, ownerUserId, ownerUserId, 'owner', now, now)
    .run()
}

export async function grantAccessForGroupMember(
  db: D1Database,
  ownerUserId: string,
  groupId: string | null,
  memberId: string | null,
  now = Date.now(),
) {
  if (!groupId || !memberId) {
    return
  }

  const member = await db
    .prepare('SELECT payload FROM members WHERE user_id = ? AND id = ?')
    .bind(ownerUserId, memberId)
    .first<{ payload: string }>()
  if (!member) {
    return
  }

  const email = (JSON.parse(member.payload) as { email?: string | null }).email?.trim().toLowerCase()
  if (!email) {
    return
  }

  const invitedUser = await db.prepare('SELECT id FROM users WHERE lower(email) = ?').bind(email).first<{ id: string }>()
  if (!invitedUser) {
    return
  }

  await db
    .prepare(
      `INSERT INTO group_access (group_id, user_id, owner_user_id, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(group_id, user_id) DO UPDATE SET role = excluded.role, updated_at = excluded.updated_at`,
    )
    .bind(groupId, invitedUser.id, ownerUserId, 'member', now, now)
    .run()
}

export async function reconcileUserGroupAccessByEmail(db: D1Database, userId: string, email: string, now = Date.now()) {
  await db
    .prepare(
      `INSERT OR IGNORE INTO group_access (group_id, user_id, owner_user_id, role, created_at, updated_at)
       SELECT group_members.group_id, ?, group_members.user_id, 'member', ?, ?
       FROM group_members
       JOIN members
         ON members.user_id = group_members.user_id
        AND members.id = group_members.member_id
       WHERE lower(json_extract(members.payload, '$.email')) = lower(?)
         AND group_members.deleted_at IS NULL`,
    )
    .bind(userId, now, now, email)
    .run()
}

export async function userCanWriteGroup(db: D1Database, userId: string, groupId: string | null) {
  if (!groupId) {
    return true
  }

  const access = await db
    .prepare('SELECT role FROM group_access WHERE user_id = ? AND group_id = ?')
    .bind(userId, groupId)
    .first<{ role: string }>()

  return Boolean(access)
}
