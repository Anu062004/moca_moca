import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// Moca Network configuration (you'll need to update this with actual Moca Network details)
export const mocaNetwork = {
  id: 12345, // Replace with actual Moca Network chain ID
  name: 'Moca Network',
  network: 'moca',
  nativeCurrency: {
    decimals: 18,
    name: 'MOCA',
    symbol: 'MOCA',
  },
  rpcUrls: {
    default: {
      http: ['https://moca-rpc.example.com'], // Replace with actual RPC URL
    },
    public: {
      http: ['https://moca-rpc.example.com'], // Replace with actual RPC URL
    },
  },
  blockExplorers: {
    default: {
      name: 'Moca Explorer',
      url: 'https://moca-explorer.example.com', // Replace with actual explorer URL
    },
  },
  testnet: true,
} as const

export const config = getDefaultConfig({
  appName: 'Proof of Dev',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [mocaNetwork, mainnet, sepolia],
  transports: {
    [mocaNetwork.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  // Disable telemetry to fix Coinbase Wallet SDK error
  enableTelemetry: false,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
