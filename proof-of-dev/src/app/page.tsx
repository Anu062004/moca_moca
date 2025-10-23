'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Github, Wallet, CheckCircle, Star, Users, Calendar, Code, Zap, X, Award } from 'lucide-react'
import { DeveloperProfile } from '@/components/developer-profile'
import { VerificationInterface } from '@/components/verification-interface'
import { CredentialDashboard } from '@/components/credential-dashboard'
import { WalletConnect } from '@/components/wallet-connect'
import { Planet3D } from '@/components/Planet3D'
import { ActionButtons } from '@/components/ActionButtons'
import { Navbar } from '@/components/Navbar'

export default function Home() {
  const { data: session, status } = useSession()
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'analyze' | 'verify' | 'credentials'>('analyze')
  const [showClassicUI, setShowClassicUI] = useState(false)

  const handleConnectWallet = () => {
    // This will be handled by the WalletConnect component
    console.log('Connect wallet clicked')
  }

  const handleVerifyProfile = () => {
    setActiveTab('verify')
    setShowClassicUI(true)
  }

  const handleViewProfile = () => {
    setActiveTab('analyze')
    setShowClassicUI(true)
  }

  const handleViewCredentials = () => {
    setActiveTab('credentials')
    setShowClassicUI(true)
  }

  const handleMintToken = () => {
    setActiveTab('analyze')
    setShowClassicUI(true)
  }

  const handleExploreNetwork = () => {
    window.open('https://testnet-explorer.mocachain.org/', '_blank')
  }

  const handleViewStats = () => {
    // Show stats modal or navigate to stats page
    console.log('View stats clicked')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading MOCA Network...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      {/* 3D Interactive UI */}
      <AnimatePresence>
        {!showClassicUI ? (
          <motion.div
            key="3d-ui"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Navbar */}
            <Navbar
              onConnectWallet={handleConnectWallet}
              onVerifyProfile={handleVerifyProfile}
              onViewProfile={handleViewProfile}
              onViewCredentials={handleViewCredentials}
              isConnected={isConnected}
              userAddress={address}
            />
            
            {/* 3D Planet Scene */}
            <Planet3D />
            
            {/* Floating Action Buttons */}
            <ActionButtons
              onConnectWallet={handleConnectWallet}
              onVerifyProfile={handleVerifyProfile}
              onViewProfile={handleViewProfile}
              onViewCredentials={handleViewCredentials}
              onMintToken={handleMintToken}
              onExploreNetwork={handleExploreNetwork}
              onViewStats={handleViewStats}
            />
            
            {/* Switch to Classic UI Button */}
            <motion.button
              className="fixed bottom-6 right-6 z-50
                         bg-white/10 backdrop-blur-sm text-white
                         px-4 py-2 rounded-lg border border-white/20
                         hover:bg-white/20 transition-all duration-200
                         flex items-center space-x-2"
              onClick={() => setShowClassicUI(true)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Code className="w-4 h-4" />
              <span>Classic UI</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="classic-ui"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
          >
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Proof of Dev</h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <WalletConnect />
                    <motion.button
                      className="text-white/60 hover:text-white p-2"
                      onClick={() => setShowClassicUI(false)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Mint Your Developer Reputation
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  Transform your GitHub activity into a Soulbound Token on Moca Network. 
                  Your code contributions become immutable proof of your development skills.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">1,234</p>
                      <p className="text-white/60">Developers</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">50,000+</p>
                      <p className="text-white/60">Tokens Minted</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">25,000+</p>
                      <p className="text-white/60">GitHub Stars</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">365</p>
                      <p className="text-white/60">Days Active</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-lg p-1 mb-8">
                <button
                  onClick={() => setActiveTab('analyze')}
                  className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'analyze'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Github className="w-5 h-5" />
                    <span>Analyze & Mint</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('verify')}
                  className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'verify'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Verify Profile</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('credentials')}
                  className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'credentials'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Credentials</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'analyze' ? (
                <DeveloperProfile />
              ) : activeTab === 'verify' ? (
                <VerificationInterface />
              ) : (
                <CredentialDashboard />
              )}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                  <p className="text-white/60">
                    Powered by Moca Network • Built with Next.js • Secured by Blockchain
                  </p>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}