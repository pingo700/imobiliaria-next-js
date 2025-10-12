'use client'
import { useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
  type DehydratedState,
} from '@tanstack/react-query'
import { ApiError } from '@/lib/api'

export function QueryProvider({
  children,
  state,
}: {
  children: React.ReactNode
  state?: DehydratedState | null
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.status === 401) return false
              return failureCount < 2
            },
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={state ?? null}>{children}</HydrationBoundary>
    </QueryClientProvider>
  )
}
