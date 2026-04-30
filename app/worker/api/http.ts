import type { ApiContext, SessionUser } from './types'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  })
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return await request.json<T>()
  } catch {
    throw new ApiError(400, 'Invalid JSON body.')
  }
}

export async function requireSession({ env, request }: ApiContext): Promise<SessionUser> {
  const authorization = request.headers.get('authorization') ?? ''
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1]

  if (!token) {
    throw new ApiError(401, 'Missing bearer token.')
  }

  const row = await env.DB.prepare(
    `SELECT users.id, users.email, users.name, users.picture_url AS pictureUrl
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ? AND sessions.expires_at > ?`,
  )
    .bind(token, Date.now())
    .first<SessionUser>()

  if (!row) {
    throw new ApiError(401, 'Invalid or expired session.')
  }

  return row
}

export async function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return json({ error: error.message }, { status: error.status })
  }

  console.error(error)
  return json({ error: 'Unexpected API error.' }, { status: 500 })
}
