import { useEffect, useRef, useState } from 'react'

import { renderGoogleSignInButton, type GoogleSignInResult } from '@/lib/auth/google-auth'

type GoogleSignInButtonProps = {
  deviceId: string
  onSuccess: (result: GoogleSignInResult) => void | Promise<void>
}

export function GoogleSignInButton({ deviceId, onSuccess }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!buttonRef.current) {
      return
    }

    let isMounted = true
    renderGoogleSignInButton({
      container: buttonRef.current,
      deviceId,
      onError: (error) => {
        if (isMounted) {
          setLoadError(error.message)
        }
      },
      onSuccess,
    }).catch((error: unknown) => {
      if (isMounted) {
        setLoadError(error instanceof Error ? error.message : 'Google sign-in failed to load.')
      }
    })

    return () => {
      isMounted = false
    }
  }, [deviceId, onSuccess])

  return (
    <div className="grid gap-2">
      <div className="flex min-h-12 w-full items-center [&>div]:w-full" ref={buttonRef} />
      {loadError ? <p className="text-sm leading-6 text-destructive">{loadError}</p> : null}
    </div>
  )
}
