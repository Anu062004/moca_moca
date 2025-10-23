'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Github, Loader2, CheckCircle, AlertCircle, Star, GitBranch, Users, Calendar, Search, RefreshCw } from 'lucide-react'
import { DeveloperMetrics } from '@/lib/github-analyzer'

interface GitHubAnalysisResponse {
  success: boolean
  metrics?: DeveloperMetrics
  error?: string
  requestId?: string
  processingTime?: number
}

export function DeveloperProfile() {
  const { address, isConnected } = useAccount()
  const { data: session, status } = useSession()
  const [metrics, setMetrics] = useState<DeveloperMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [minting, setMinting] = useState(false)
  const [searchUsername, setSearchUsername] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Auto-analyze current user's profile on session load
  useEffect(() => {
    if (session?.accessToken && session.githubLogin && !metrics) {
      analyzeProfile(session.githubLogin)
    }
  }, [session, metrics])

  const analyzeProfile = async (username?: string) => {
    const targetUsername = username || session?.githubLogin || session?.user?.name
    
    if (!targetUsername) {
      setError('No GitHub username available')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('Analyzing GitHub profile for:', targetUsername)
      
      const response = await fetch('/api/analyze-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: targetUsername }),
      })

      const data: GitHubAnalysisResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (!data.metrics) {
        throw new Error('No metrics returned from analysis')
      }

      console.log('Analysis successful:', data.metrics)
      setMetrics(data.metrics)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze profile'
      console.error('Analysis error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const searchUser = async () => {
    if (!searchUsername.trim()) {
      setSearchError('Please enter a GitHub username')
      return
    }

    setIsSearching(true)
    setSearchError(null)
    
    try {
      console.log('Searching for GitHub user:', searchUsername)
      
      const response = await fetch('/api/analyze-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: searchUsername.trim() }),
      })

      const data: GitHubAnalysisResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (!data.metrics) {
        throw new Error('No metrics returned from analysis')
      }

      console.log('User search successful:', data.metrics)
      setMetrics(data.metrics)
      setSearchUsername('') // Clear search input
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze user'
      console.error('Search error:', errorMessage)
      setSearchError(errorMessage)
    } finally {
      setIsSearching(false)
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

      const res = await fetch('/api/mint-simple', {
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
      
      // Handle success response
      const successMessage = `Credential minted successfully! 🚀

Developer: ${data.developer?.githubUsername || 'Unknown'}
Address: ${data.developer?.address}
Reputation Score: ${data.developer?.reputationScore}
Total Stars: ${data.developer?.totalStars}
Total Repositories: ${data.developer?.totalRepositories}
Top Languages: ${data.developer?.topLanguages?.join(', ') || 'None'}

Credential ID: ${data.credential?.id || 'N/A'}
Issued At: ${new Date(data.timestamp).toLocaleString()}

Your developer credential is now ready! You can view it in the Credentials tab.`
      
      alert(successMessage)
    } catch (err) {
      setError('Failed to mint profile')
    } finally {
      setMinting(false)
    }
  }

  const handleSignIn = () => {
    signIn('github', { callbackUrl: '/' })
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
    setMetrics(null)
    setError(null)
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <span className="ml-2 text-white">Loading...</span>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <div className="text-center">
          <Github className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Sign in with GitHub
          </h3>
          <p className="text-gray-300 mb-6">
            Connect your GitHub account to analyze your developer profile and mint credentials
          </p>
          <button
            onClick={handleSignIn}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto"
          >
            <Github className="w-5 h-5" />
            <span>Sign in with GitHub</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Search Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Search GitHub User
        </h3>
        
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Enter GitHub username (e.g., octocat)"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && searchUser()}
          />
          <button
            onClick={searchUser}
            disabled={isSearching || !searchUsername.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        </div>

        {searchError && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-200">{searchError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Current User Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Github className="w-6 h-6 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                {session.githubLogin || session.user?.name || 'GitHub User'}
              </h3>
              <p className="text-gray-400 text-sm">
                {session.user?.email || 'No email available'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => analyzeProfile()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{loading ? 'Analyzing...' : 'Analyze My Profile'}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="ml-2 text-white">Analyzing GitHub profile...</span>
          </div>
        )}

        {metrics && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{metrics.totalStars}</p>
                    <p className="text-gray-400 text-sm">Total Stars</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{metrics.totalRepositories}</p>
                    <p className="text-gray-400 text-sm">Repositories</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{metrics.followers}</p>
                    <p className="text-gray-400 text-sm">Followers</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{Math.floor(metrics.accountAge / 365)}</p>
                    <p className="text-gray-400 text-sm">Years Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reputation Score */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Reputation Score</h4>
                  <p className="text-3xl font-bold text-yellow-400">{metrics.reputationScore}</p>
                  <p className="text-gray-400 text-sm">Based on activity, stars, and contributions</p>
                </div>
                <div className="text-right">
                  <div className="w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center">
                    <span className="text-2xl font-bold text-yellow-400">
                      {Math.min(Math.floor(metrics.reputationScore / 10), 10)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Languages */}
            {Object.keys(metrics.languages).length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Top Languages</h4>
                <div className="space-y-2">
                  {Object.entries(metrics.languages)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([language, bytes]) => (
                      <div key={language} className="flex items-center justify-between">
                        <span className="text-white font-medium">{language}</span>
                        <span className="text-gray-400 text-sm">
                          {Math.round((bytes / Object.values(metrics.languages).reduce((a, b) => a + b, 0)) * 100)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Mint Button */}
            {isConnected && (
              <div className="text-center">
                <button
                  onClick={mintProfile}
                  disabled={minting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 mx-auto"
                >
                  {minting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                  <CheckCircle className="w-5 h-5" />
                  )}
                  <span>{minting ? 'Minting...' : 'Mint Proof of Dev Token'}</span>
                </button>
                <p className="text-gray-400 text-sm mt-2">
                  Create your verifiable developer credential on Moca Network
                </p>
              </div>
            )}

            {!isConnected && (
              <div className="text-center p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-yellow-200">
                  Connect your wallet to mint your Proof of Dev token
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}