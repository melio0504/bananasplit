import { useCallback, useEffect, useState } from 'react'
import {
  CloudCheck,
  CloudOff,
  Download,
  LogOut,
  Mail,
  MoonStar,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Wallet,
  Sun,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { MobileShell } from '@/components/common/mobile-shell'
import { RootPageHeader } from '@/components/common/root-page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ProUpgradeCard } from '@/features/pro/components/pro-upgrade-card'
import { GoogleSignInButton } from '@/features/settings/components/google-sign-in-button'
import { CurrencyDrawer } from '@/features/settings/pages/settings-page/currency-drawer'
import { ResetDataDrawer } from '@/features/settings/pages/settings-page/reset-data-drawer'
import { SettingsRow } from '@/features/settings/pages/settings-page/settings-row'
import { clearApiToken } from '@/lib/auth/google-auth'
import {
  usePendingSyncCountQuery,
  useResetLocalDataMutation,
  useSettingsQuery,
  useUpdateAuthStateMutation,
  useUpdateCurrencyMutation,
} from '@/lib/queries/use-app-queries'
import { getPendingSyncCount, isManualSyncRequired, setManualSyncRequired, syncCurrentAccount } from '@/lib/sync/sync-client'

export function SettingsPage() {
  const { data } = useSettingsQuery()

  if (!data) {
    return null
  }

  return <SettingsPageContent key={data.deviceId} data={data} />
}

function SettingsPageContent({
  data,
}: {
  data: NonNullable<ReturnType<typeof useSettingsQuery>['data']>
}) {
  const updateAuthStateMutation = useUpdateAuthStateMutation()
  const updateCurrencyMutation = useUpdateCurrencyMutation()
  const resetLocalDataMutation = useResetLocalDataMutation()
  const pendingSyncCountQuery = usePendingSyncCountQuery()
  const queryClient = useQueryClient()
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(data.currency)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light')
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [manualSyncRequiredState, setManualSyncRequiredState] = useState(() => isManualSyncRequired())

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const updateOnlineState = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateOnlineState)
    window.addEventListener('offline', updateOnlineState)

    return () => {
      window.removeEventListener('online', updateOnlineState)
      window.removeEventListener('offline', updateOnlineState)
    }
  }, [])
  
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  const accountName = data.userName
  const accountEmail = data.accountEmail ?? 'Not signed in'
  const sessionMode = data.isSignedIn ? 'Signed in' : 'Local only'
  const accountProvider = data.isSignedIn ? 'Google linked' : 'No external provider'
  const shortDeviceId = data.deviceId.slice(0, 8).toUpperCase()
  const pendingSyncCount = pendingSyncCountQuery.data ?? 0
  const hasPendingSyncRows = pendingSyncCount > 0
  const showSyncNow = data.isSignedIn && isOnline && hasPendingSyncRows && manualSyncRequiredState

  const invalidateSyncData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['activity'] }),
      queryClient.invalidateQueries({ queryKey: ['all-groups'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['groups'] }),
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      queryClient.invalidateQueries({ queryKey: ['pending-sync-count'] }),
      queryClient.invalidateQueries({ queryKey: ['search'] }),
      queryClient.invalidateQueries({ queryKey: ['selectable-groups'] }),
      queryClient.invalidateQueries({ queryKey: ['settings'] }),
    ])
  }, [queryClient])

  const runAccountSync = useCallback(async () => {
    setIsSyncing(true)
    setSyncError(false)
    try {
      await syncCurrentAccount()
      setManualSyncRequiredState(isManualSyncRequired())
      await invalidateSyncData()
    } catch {
      setSyncError(true)
    } finally {
      setIsSyncing(false)
    }
  }, [invalidateSyncData])

  const handleGoogleSignedIn = useCallback(
    async ({
      accountAvatarUrl,
      accountEmail: nextAccountEmail,
    }: {
      accountAvatarUrl: string | null
      accountEmail: string | null
    }) => {
      const pendingBeforeLogin = await getPendingSyncCount()
      await updateAuthStateMutation.mutateAsync({
        accountAvatarUrl,
        accountEmail: nextAccountEmail,
        authProvider: 'google',
        isSignedIn: true,
      })

      const shouldRequireManualSync = pendingBeforeLogin > 0 && data.lastSyncCursor !== null
      setManualSyncRequired(shouldRequireManualSync)
      setManualSyncRequiredState(shouldRequireManualSync)
      await invalidateSyncData()

      if (!shouldRequireManualSync && isOnline) {
        await runAccountSync()
      }
    },
    [data.lastSyncCursor, invalidateSyncData, isOnline, runAccountSync, updateAuthStateMutation],
  )

  const handleLogout = async () => {
    clearApiToken()
    setManualSyncRequired(false)
    setManualSyncRequiredState(false)
    await updateAuthStateMutation.mutateAsync({
      accountEmail: null,
      authProvider: 'local',
      isSignedIn: false,
    })
    await invalidateSyncData()
  }

  const syncStatus = (() => {
    if (!data.isSignedIn) {
      return { icon: CloudOff, iconClassName: undefined, value: 'Offline only' }
    }
    if (!isOnline) {
      return { icon: CloudOff, iconClassName: undefined, value: 'Offline' }
    }
    if (isSyncing) {
      return { icon: RefreshCw, iconClassName: 'bg-amber-100 text-amber-700', value: 'Syncing...' }
    }
    if (syncError) {
      return { icon: RefreshCw, iconClassName: 'bg-amber-100 text-amber-700', value: 'Sync issue' }
    }
    if (hasPendingSyncRows && manualSyncRequiredState) {
      return { icon: RefreshCw, iconClassName: 'bg-amber-100 text-amber-700', value: 'Needs sync' }
    }

    return { icon: CloudCheck, iconClassName: 'bg-emerald-100 text-emerald-700', value: 'Synced' }
  })()

  return (
    <MobileShell>
      <div className="space-y-5">
        <RootPageHeader
          showNotifications
          showSearch
          subtitle="Account, preferences, and local data"
          title="Settings"
        />

        <Card className="border-0 bg-[linear-gradient(160deg,#fff7d3,#fffef8)] shadow-[0_16px_32px_rgba(245,181,0,0.16)]">
          <CardContent className="space-y-5 p-5">
            <Link className="block rounded-[28px] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring/50" to="/profile">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 border border-white/80">
                  {data.accountAvatarUrl ? (
                    <AvatarImage alt="" referrerPolicy="no-referrer" src={data.accountAvatarUrl} />
                  ) : null}
                  <AvatarFallback className="bg-secondary text-lg font-semibold text-secondary-foreground">
                    {accountName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-banana-900)]/60">
                      Account
                    </p>
                    <p className="truncate text-[1.65rem] font-semibold tracking-tight text-[var(--color-banana-950)] sm:text-[1.8rem]">
                      {accountName}
                    </p>
                  </div>
                  <p className="truncate text-sm leading-6 text-muted-foreground sm:text-[15px]">{accountEmail}</p>
                </div>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-[var(--color-banana-900)]">
                {data.isSignedIn ? 'Signed in' : 'Local mode'}
              </Badge>
              <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-[var(--color-banana-900)]">
                Offline first
              </Badge>
            </div>

            <div className="rounded-[24px] bg-white/75 px-4 py-4 text-sm leading-6 text-muted-foreground sm:text-[15px]">
              {data.isSignedIn
                ? 'Your account is connected for a simpler sign-in experience. Local data still stays first in this MVP.'
                : 'You are currently using the app in local mode. Sign in when you want a linked account later.'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
          <CardHeader className="pb-1">
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] bg-secondary/35 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/80 p-2 text-foreground">
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium text-foreground sm:text-base">Google sign in</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                    Your local display name stays yours. Google adds account email and profile image for sync.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {!data.isSignedIn ? (
                  <GoogleSignInButton deviceId={data.deviceId} onSuccess={handleGoogleSignedIn} />
                ) : (
                  <Button
                    className="h-12 rounded-2xl"
                    variant="secondary"
                    disabled={updateAuthStateMutation.isPending}
                    type="button"
                  >
                    Connected to Google
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-[24px] bg-white/70 px-4 py-4 text-sm leading-6 text-muted-foreground sm:text-[15px]">
              BananaSplit keeps working offline. Sync runs when you are signed in and online.
            </div>

            {data.isSignedIn ? (
              <Button
                className="h-12 w-full rounded-2xl text-destructive hover:text-destructive"
                variant="secondary"
                disabled={updateAuthStateMutation.isPending}
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
          <CardHeader className="pb-1">
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsRow
              icon={Wallet}
              label="Currency"
              onClick={() => setIsCurrencyOpen(true)}
              value={data.currency}
            />
            <Separator />
           <SettingsRow
            icon={theme === 'dark' ? Sun : MoonStar}
            label="Theme"
            onClick={toggleTheme}
            showChevron={false}
            value={theme === 'dark' ? 'Choco Banana' : 'Ripe Banana'}
          />
          </CardContent>
        </Card>

        <ProUpgradeCard />

        <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
          <CardHeader className="pb-1">
            <CardTitle>Data & safety</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsRow icon={Download} label="Export local data" value="Ready" />
            <Separator />
            <SettingsRow
              icon={syncStatus.icon}
              iconClassName={syncStatus.iconClassName}
              label="Sync status"
              showChevron={false}
              value={syncStatus.value}
            />
            <Separator />
            {showSyncNow ? (
              <>
                <div className="py-3">
                  <Button
                    className="h-12 w-full rounded-2xl"
                    disabled={isSyncing}
                    onClick={runAccountSync}
                    type="button"
                  >
                    <RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync now
                  </Button>
                </div>
                <Separator />
              </>
            ) : null}
            <div className="space-y-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-secondary p-2 text-secondary-foreground">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-[15px] text-foreground sm:text-base">Session security</p>
                  <p className="text-sm leading-6 text-muted-foreground sm:text-[15px]">
                    Local account state and device identity for this installation.
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-[24px] bg-white/70 px-4 py-4 text-sm sm:text-[15px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Access mode</span>
                  <span className="font-medium text-foreground">{sessionMode}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Account provider</span>
                  <span className="font-medium text-foreground">{accountProvider}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Device ID</span>
                  <span className="inline-flex items-center gap-2 font-medium text-foreground">
                    <Smartphone className="size-4 text-muted-foreground" />
                    <span className="font-mono">{shortDeviceId}</span>
                  </span>
                </div>
              </div>

              <Button
                className="h-12 w-full rounded-2xl text-destructive hover:text-destructive"
                disabled={resetLocalDataMutation.isPending}
                onClick={() => setIsResetOpen(true)}
                type="button"
                variant="secondary"
              >
                <RotateCcw className="size-4" />
                Reset local data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <CurrencyDrawer
        currentCurrency={data.currency}
        isPending={updateCurrencyMutation.isPending}
        open={isCurrencyOpen}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        onOpenChange={(open) => {
          setIsCurrencyOpen(open)
          if (open) {
            setSelectedCurrency(data.currency)
          }
        }}
        onSave={async () => {
          await updateCurrencyMutation.mutateAsync({
            currency: selectedCurrency,
          })
          setIsCurrencyOpen(false)
        }}
      />

      <ResetDataDrawer
        isPending={resetLocalDataMutation.isPending}
        open={isResetOpen}
        onConfirm={async () => {
          await resetLocalDataMutation.mutateAsync()
          setIsResetOpen(false)
        }}
        onOpenChange={setIsResetOpen}
      />
    </MobileShell>
  )
}
