'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Github, Loader2, CheckCircle, AlertCircle, Star, GitBranch, Users, Calendar } from 'lucide-react'
import { GitHubAnalyzer, DeveloperMetrics } from '@/lib/github-analyzer'
import { mintDeveloperBadge } from '@/lib/airkit'

export function DeveloperProfile() {
  const { address, isConnected } = useAccount()
  const { data: session, status } = useSession()
  const [metrics, setMetrics] = useState<DeveloperMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [minting, setMinting] = useState(false)

  const analyzeProfile = async () => {
    if (!session?.accessToken) return
    
    setLoading(true)
    setError(null)
    
    try {
      const analyzer = new GitHubAnalyzer(session.accessToken)
      const githubUsername = session.githubLogin || session.user?.name
      
      if (!githubUsername) {
        throw new Error('GitHub username not found')
      }
      
      const developerMetrics = await analyzer.analyzeDeveloper(githubUsername)
      setMetrics(developerMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze profile')
    } finally {
      setLoading(false)
    }
  }

  const mintProfile = async () => {
    if (!metrics || !address) return
    
    setMinting(true)
    try {
      const topLanguages = Object.entries(metrics.languages)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([lang]) => lang)

      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developer: address,
          githubUsername: (session?.githubLogin || session?.user?.name) as string,
          metrics: {
            reputationScore: metrics.reputationScore,
            totalCommits: metrics.totalCommits,
            totalRepositories: metrics.totalRepositories,
            totalStars: metrics.totalStars,
            followers: metrics.followers,
            accountAge: metrics.accountAge,
            topLanguages,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Mint failed')
      
      // Handle different response types
      if (data.message && data.message.includes('already has')) {
        // Developer already has a profile
        const existingMessage = `You already have a Proof of Dev token! 🎉

Token ID: ${data.tokenId}
GitHub Username: ${data.existingProfile?.githubUsername}
Reputation Score: ${data.existingProfile?.reputationScore}
Contract Address: ${data.contractAddress}
Chain ID: ${data.mocaNetwork?.chainId || 222888}
Explorer: ${data.mocaNetwork?.explorerUrl || 'https://testnet-explorer.mocachain.org/'}

Your Proof of Dev token is already live on Moca Network!`
        
        alert(existingMessage)
      } else {
        // New profile minted
        const successMessage = `Profile minted successfully on Moca Testnet! 🚀

Transaction Hash: ${data.txHash}
Contract Address: ${data.contractAddress}
Chain ID: ${data.mocaNetwork?.chainId || 222888}
Explorer: ${data.mocaNetwork?.explorerUrl || 'https://testnet-explorer.mocachain.org/'}
AIR Kit Credential: ${data.airKitCredential?.id || 'N/A'}

Your Proof of Dev token is now live on Moca Network!`
        
        alert(successMessage)
      }
    } catch (err) {
      setError('Failed to mint profile')
    } finally {
      setMinting(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken && !metrics) {
      analyzeProfile()
    }
  }, [session])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Developer Profile Analysis
        </h3>

        {/* GitHub Connection */}
        {!session ? (
          <div className="text-center py-12">
            <Github className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">
              Connect Your GitHub Account
            </h4>
            <p className="text-gray-300 mb-6">
              Sign in with GitHub to analyze your development activity and mint your reputation token.
            </p>
            <button
              onClick={() => signIn('github')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
            >
              <Github className="w-5 h-5 mr-2" />
              Sign in with GitHub
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* GitHub Profile Info */}
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
              <img
                src={session.user?.image || ''}
                alt="Profile"
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h4 className="text-lg font-semibold text-white">
                  {session.user?.name}
                </h4>
                <p className="text-gray-300">@{session.githubLogin}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="ml-auto text-gray-400 hover:text-white"
              >
                Sign Out
              </button>
            </div>

            {/* Wallet Connection */}
            {!isConnected ? (
              <div className="text-center py-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-yellow-200">
                  Please connect your wallet to mint your Proof of Dev token
                </p>
              </div>
            ) : (
              <div className="text-center py-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-green-200">
                  Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            )}

            {/* Analysis Results */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-purple-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-300">Analyzing your GitHub profile...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-200">{error}</p>
                <button
                  onClick={analyzeProfile}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : metrics ? (
              <div className="space-y-6">
                {/* Reputation Score */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {metrics.reputationScore}
                  </div>
                  <div className="text-gray-300">Reputation Score</div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-xl font-semibold text-white">{metrics.totalStars}</div>
                    <div className="text-sm text-gray-300">Stars</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <GitBranch className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-xl font-semibold text-white">{metrics.totalRepositories}</div>
                    <div className="text-sm text-gray-300">Repos</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-xl font-semibold text-white">{metrics.followers}</div>
                    <div className="text-sm text-gray-300">Followers</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-xl font-semibold text-white">{Math.floor(metrics.accountAge / 365)}</div>
                    <div className="text-sm text-gray-300">Years</div>
                  </div>
                </div>

                {/* Top Languages */}
                <div>
                  <h5 className="text-lg font-semibold text-white mb-3">Top Languages</h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(metrics.languages)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([language, bytes]) => (
                        <span
                          key={language}
                          className="bg-purple-600/20 text-purple-200 px-3 py-1 rounded-full text-sm"
                        >
                          {language}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Mint Button */}
                <div className="text-center pt-6">
                  <button
                    onClick={mintProfile}
                    disabled={!isConnected || minting}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center mx-auto"
                  >
                    {minting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Minting...
                      </>
                    ) : (
                      'Mint Proof of Dev Token'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <button
                  onClick={analyzeProfile}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Analyze My Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
