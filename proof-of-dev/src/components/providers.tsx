'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from '@/lib/wagmi-config'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <RainbowKitProvider
            modalSize="compact"
            initialChain={config.chains[0]}
            showRecentTransactions={true}
          >
            {children}
          </RainbowKitProvider>
        </SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
