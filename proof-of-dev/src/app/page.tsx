'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { Github, Shield, Zap, Users, Star, GitBranch, Calendar } from 'lucide-react'
import { DeveloperProfile } from '@/components/developer-profile'
import { VerificationInterface } from '@/components/verification-interface'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'mint' | 'verify'>('mint')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Mint Your GitHub Reputation
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your GitHub activity into a verifiable Soulbound Token on Moca Network. 
            Build your on-chain developer identity and showcase your skills to the world.
          </p>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Github className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">GitHub Integration</h3>
              <p className="text-gray-300">Connect your GitHub account and analyze your development activity</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Reputation Scoring</h3>
              <p className="text-gray-300">Advanced algorithm calculates your developer reputation score</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Soulbound Token</h3>
              <p className="text-gray-300">Mint a non-transferable NFT representing your skills</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setActiveTab('mint')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'mint'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Mint Profile
              </button>
              <button
                onClick={() => setActiveTab('verify')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'verify'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Verify Developer
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'mint' ? (
            <DeveloperProfile />
          ) : (
            <VerificationInterface />
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">1,234</div>
              <div className="text-gray-300">Developers</div>
            </div>
            <div>
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">50,000+</div>
              <div className="text-gray-300">Total Stars</div>
            </div>
            <div>
              <GitBranch className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">25,000+</div>
              <div className="text-gray-300">Repositories</div>
            </div>
            <div>
              <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">365</div>
              <div className="text-gray-300">Days Active</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Built on Moca Network • Powered by GitHub • Secured by Blockchain
          </p>
        </div>
      </footer>
    </div>
  )
}
