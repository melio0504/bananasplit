import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query'
import { type PropsWithChildren, useState } from 'react'
import { SyncWatcher } from '@/lib/sync/sync-watcher'

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
      retry: false,
    },
  },
}

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () => new QueryClient(queryClientConfig),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SyncWatcher />
      {children}
    </QueryClientProvider>
  )
}
