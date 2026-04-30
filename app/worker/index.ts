import { routeApi } from './api/router'
import type { Env } from './api/types'

export default {
  fetch(request: Request, env: Env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return routeApi(request, env)
    }

    return env.ASSETS.fetch(request)
  },
}
