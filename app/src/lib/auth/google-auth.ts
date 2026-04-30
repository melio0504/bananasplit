const API_TOKEN_KEY = 'bananasplit.apiToken'
const GOOGLE_SCRIPT_ID = 'google-identity-services'

type GoogleCredentialResponse = {
  credential?: string
}

type GoogleAccounts = {
  id: {
    initialize(options: {
      callback: (response: GoogleCredentialResponse) => void
      client_id: string
    }): void
    renderButton(element: HTMLElement, options: Record<string, unknown>): void
  }
}

type GoogleJwtPayload = {
  email?: string
  name?: string
  picture?: string
}

type GoogleAuthResponse = {
  token: string
  user: {
    email: string
    id: string
    name: string | null
    pictureUrl: string | null
  }
}

export type GoogleSignInResult = Awaited<ReturnType<typeof signInWithGoogleIdToken>>

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts
    }
  }
}

export function getApiToken() {
  return localStorage.getItem(API_TOKEN_KEY)
}

export function clearApiToken() {
  localStorage.removeItem(API_TOKEN_KEY)
}

function getGoogleClientId() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    throw new Error('Google client ID is not configured.')
  }

  return clientId
}

function decodeBase64Url(value: string) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  return decodeURIComponent(
    Array.from(atob(padded))
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
}

export function decodeGoogleIdToken(idToken: string) {
  const [, payload] = idToken.split('.')

  if (!payload) {
    throw new Error('Invalid Google ID token.')
  }

  return JSON.parse(decodeBase64Url(payload)) as GoogleJwtPayload
}

function loadGoogleIdentityScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts) {
      resolve()
      return
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Google sign-in failed to load.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Google sign-in failed to load.')), { once: true })
    document.head.append(script)
  })
}

export async function signInWithGoogleIdToken(idToken: string, deviceId: string) {
  const profile = decodeGoogleIdToken(idToken)
  const response = await fetch('/api/auth/google', {
    body: JSON.stringify({ deviceId, idToken }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Google sign-in failed.')
  }

  const auth = (await response.json()) as GoogleAuthResponse
  localStorage.setItem(API_TOKEN_KEY, auth.token)

  return {
    accountAvatarUrl: auth.user.pictureUrl ?? profile.picture ?? null,
    accountEmail: auth.user.email || profile.email || null,
    googleName: auth.user.name ?? profile.name ?? null,
    token: auth.token,
    userId: auth.user.id,
  }
}

export async function renderGoogleSignInButton({
  container,
  deviceId,
  onError,
  onSuccess,
}: {
  container: HTMLElement
  deviceId: string
  onError?: (error: Error) => void
  onSuccess: (result: Awaited<ReturnType<typeof signInWithGoogleIdToken>>) => void | Promise<void>
}) {
  await loadGoogleIdentityScript()
  const clientId = getGoogleClientId()

  container.innerHTML = ''
  window.google?.accounts.id.initialize({
    client_id: clientId,
    callback: async (response) => {
      try {
        if (!response.credential) {
          throw new Error('Google did not return an ID token.')
        }

        await onSuccess(await signInWithGoogleIdToken(response.credential, deviceId))
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Google sign-in failed.'))
      }
    },
  })
  window.google?.accounts.id.renderButton(container, {
    shape: 'pill',
    size: 'large',
    text: 'signin_with',
    theme: 'outline',
    type: 'standard',
    width: container.offsetWidth || 320,
  })
}
