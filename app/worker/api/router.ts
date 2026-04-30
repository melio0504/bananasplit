import { handleGoogleAuth, handleMe } from './auth'
import { handleApiError, json } from './http'
import { handleSyncPull, handleSyncPush } from './sync'
import type { Env } from './types'

export async function routeApi(request: Request, env: Env) {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api/, '') || '/'
  const context = { env, request, url }

  try {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204 })
    }
    if (request.method === 'GET' && path === '/health') {
      return json({ ok: true })
    }
    if (request.method === 'POST' && path === '/auth/google') {
      return handleGoogleAuth(context)
    }
    if (request.method === 'GET' && path === '/me') {
      return handleMe(context)
    }
    if (request.method === 'POST' && path === '/sync/push') {
      return handleSyncPush(context)
    }
    if (request.method === 'GET' && path === '/sync/pull') {
      return handleSyncPull(context)
    }

    return json({ error: 'Not found.' }, { status: 404 })
  } catch (error) {
    return handleApiError(error)
  }
}
