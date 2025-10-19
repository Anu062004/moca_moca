'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { mocaNetwork } from '@/lib/wagmi-config'
import { Wallet, LogOut, AlertCircle } from 'lucide-react'

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const isWrongNetwork = chainId !== mocaNetwork.id

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: mocaNetwork.id })
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </button>
                )
              }

              if (isWrongNetwork) {
                return (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSwitchNetwork}
                      type="button"
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Switch to Moca Testnet
                    </button>
                    <button
                      onClick={() => disconnect()}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Moca Testnet (222888)
                  </button>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    {account?.displayName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
