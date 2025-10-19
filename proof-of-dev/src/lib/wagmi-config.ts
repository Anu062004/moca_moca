import { http } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { airConnector } from '@mocanetwork/airkit-connector'

// Disable WalletConnect telemetry to reduce 403 errors
if (typeof window !== 'undefined') {
  const originalFetch = global.fetch
  global.fetch = async (url, options) => {
    if (typeof url === 'string' && url.includes('api.web3modal.org')) {
      // Skip WalletConnect API calls that cause 403 errors
      return new Response(JSON.stringify({}), { status: 200 })
    }
    return originalFetch(url, options)
  }
}

// Moca Network configuration for testnet (Chain ID 222888)
export const mocaNetwork = {
  id: 222888,
  name: 'Moca Testnet',
  network: 'moca-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MOCA',
    symbol: 'MOCA',
  },
  rpcUrls: {
    default: {
      http: [process.env.MOCA_RPC_URL || 'https://testnet-rpc.mocachain.org/'],
    },
    public: {
      http: [process.env.MOCA_RPC_URL || 'https://testnet-rpc.mocachain.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Moca Explorer',
      url: process.env.MOCA_EXPLORER_URL || 'https://testnet-explorer.mocachain.org/',
    },
  },
  testnet: true,
} as const

export const config = getDefaultConfig({
  appName: 'Proof of Dev',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  chains: [mocaNetwork],
  transports: {
    [mocaNetwork.id]: http(process.env.MOCA_RPC_URL || 'https://testnet-rpc.mocachain.org/'),
  },
  connectors: [
    airConnector({
      partnerId: process.env.AIRKIT_PARTNER_ID || 'moca-proof-of-dev-2024',
      chains: [mocaNetwork],
    }),
  ],
  ssr: false, // Disable SSR for wallet connection
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
