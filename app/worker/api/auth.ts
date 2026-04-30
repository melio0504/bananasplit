import { createSessionToken, randomId } from './crypto'
import { ApiError, json, readJson, requireSession } from './http'
import { reconcileUserGroupAccessByEmail } from './sync/collaboration'
import type { ApiContext } from './types'

type GoogleTokenInfo = {
  aud?: string
  email?: string
  email_verified?: string
  name?: string
  picture?: string
  sub?: string
}

type GoogleAuthBody = {
  deviceId?: string
  idToken?: string
}

export async function handleGoogleAuth(context: ApiContext) {
  const { env, request } = context
  const body = await readJson<GoogleAuthBody>(request)

  if (!body.idToken) {
    throw new ApiError(400, 'Missing Google ID token.')
  }

  const tokenInfoUrl = new URL('https://oauth2.googleapis.com/tokeninfo')
  tokenInfoUrl.searchParams.set('id_token', body.idToken)
  const tokenResponse = await fetch(tokenInfoUrl)

  if (!tokenResponse.ok) {
    throw new ApiError(401, 'Google token verification failed.')
  }

  const tokenInfo = await tokenResponse.json<GoogleTokenInfo>()
  if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID || !tokenInfo.sub || !tokenInfo.email) {
    throw new ApiError(401, 'Google token is not valid for this app.')
  }
  if (tokenInfo.email_verified && tokenInfo.email_verified !== 'true') {
    throw new ApiError(401, 'Google email is not verified.')
  }

  const now = Date.now()
  const existingAccount = await env.DB.prepare(
    'SELECT user_id AS userId FROM auth_accounts WHERE provider = ? AND provider_account_id = ?',
  )
    .bind('google', tokenInfo.sub)
    .first<{ userId: string }>()
  const existingUser = existingAccount
    ? await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(existingAccount.userId).first<{ id: string }>()
    : await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(tokenInfo.email).first<{ id: string }>()
  const userId = existingUser?.id ?? randomId('usr')
  const accountId = randomId('acct')
  const deviceId = body.deviceId || randomId('dev')
  const token = await createSessionToken()
  const expiresAt = now + 1000 * 60 * 60 * 24 * 60

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO users (id, email, name, picture_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET email = excluded.email, name = excluded.name, picture_url = excluded.picture_url, updated_at = excluded.updated_at`,
    ).bind(userId, tokenInfo.email, tokenInfo.name ?? null, tokenInfo.picture ?? null, now, now),
    env.DB.prepare(
      `INSERT INTO auth_accounts (id, user_id, provider, provider_account_id, email, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(provider, provider_account_id) DO UPDATE SET email = excluded.email, updated_at = excluded.updated_at`,
    ).bind(accountId, userId, 'google', tokenInfo.sub, tokenInfo.email, now, now),
    env.DB.prepare(
      `INSERT INTO devices (id, user_id, name, created_at, last_seen_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET user_id = excluded.user_id, last_seen_at = excluded.last_seen_at`,
    ).bind(deviceId, userId, 'Browser', now, now),
    env.DB.prepare('INSERT INTO sessions (token, user_id, device_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?)').bind(
      token,
      userId,
      deviceId,
      now,
      expiresAt,
    ),
  ])
  await reconcileUserGroupAccessByEmail(env.DB, userId, tokenInfo.email, now)

  return json({
    token,
    user: {
      email: tokenInfo.email,
      id: userId,
      name: tokenInfo.name ?? null,
      pictureUrl: tokenInfo.picture ?? null,
    },
  })
}

export async function handleMe(context: ApiContext) {
  const user = await requireSession(context)
  return json({ user })
}
