'use client'

import { useState } from 'react'
import { Search, User, Star, GitBranch, Calendar, Shield, ExternalLink } from 'lucide-react'

interface DeveloperProfile {
  walletAddress: string
  githubUsername: string
  reputationScore: number
  totalCommits: number
  totalRepositories: number
  totalStars: number
  followers: number
  accountAge: number
  topLanguages: string[]
  mintedAt: number
}

export function VerificationInterface() {
  const [searchInput, setSearchInput] = useState('')
  const [profile, setProfile] = useState<DeveloperProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProfile = async () => {
    if (!searchInput.trim()) return

    setLoading(true)
    setError(null)
    setProfile(null)

    try {
      const isAddress = /^0x[a-fA-F0-9]{40}$/.test(searchInput)
      const searchParam = isAddress ? 'address' : 'github'
      const res = await fetch(`/api/profile?${searchParam}=${encodeURIComponent(searchInput)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Not found')
      const p = data.profile
      const parsed: DeveloperProfile = {
        walletAddress: p.walletAddress || searchInput,
        githubUsername: p.githubUsername,
        reputationScore: Number(p.reputationScore),
        totalCommits: Number(p.totalCommits),
        totalRepositories: Number(p.totalRepositories),
        totalStars: Number(p.totalStars),
        followers: Number(p.followers),
        accountAge: Number(p.accountAge),
        topLanguages: p.topLanguages as string[],
        mintedAt: Number(p.mintedAt) * 1000,
      }
      
      console.log('Profile verification successful:', {
        searchInput: searchInput,
        searchType: isAddress ? 'wallet' : 'github',
        contractAddress: data.profile.contractAddress,
        airKitVerified: data.profile.airKitIdentity?.verified,
        reputation: data.profile.airKitIdentity?.reputation,
        badges: data.profile.airKitIdentity?.badges
      })
      setProfile(parsed)
    } catch (err) {
      setError('Failed to find developer profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchProfile()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Verify Developer Profile
        </h3>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter wallet address or GitHub username..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Searching for developer profile...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {profile && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">
                      @{profile.githubUsername}
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {profile.reputationScore}
                  </div>
                  <div className="text-sm text-gray-300">Reputation Score</div>
                </div>
              </div>

              {/* Verification Badge */}
              <div className="flex items-center space-x-2 text-green-400">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Verified Developer</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-semibold text-white">{profile.totalStars}</div>
                <div className="text-sm text-gray-300">Stars</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <GitBranch className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-semibold text-white">{profile.totalRepositories}</div>
                <div className="text-sm text-gray-300">Repositories</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <User className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-semibold text-white">{profile.followers}</div>
                <div className="text-sm text-gray-300">Followers</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-semibold text-white">{Math.floor(profile.accountAge / 365)}</div>
                <div className="text-sm text-gray-300">Years Active</div>
              </div>
            </div>

            {/* Top Languages */}
            <div className="bg-white/5 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-white mb-3">Top Programming Languages</h5>
              <div className="flex flex-wrap gap-2">
                {profile.topLanguages.map((language) => (
                  <span
                    key={language}
                    className="bg-purple-600/20 text-purple-200 px-3 py-1 rounded-full text-sm"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>

            {/* Token Information */}
            <div className="bg-white/5 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-white mb-3">Proof of Dev Token</h5>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-300 mb-1">Token ID</div>
                  <div className="text-white font-mono">#12345</div>
                </div>
                <div>
                  <div className="text-sm text-gray-300 mb-1">Minted</div>
                  <div className="text-white">
                    {new Date(profile.mintedAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-300 mb-1">Contract Address</div>
                  <div className="text-white font-mono text-sm">
                    0x1234...5678
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-300 mb-1">Network</div>
                  <div className="text-white">Moca Network</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
                <User className="w-4 h-4 mr-2" />
                View GitHub Profile
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!profile && !loading && !error && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">
              Search for a Developer
            </h4>
            <p className="text-gray-300 max-w-md mx-auto">
              Enter a wallet address or GitHub username to view their verified developer profile and reputation score.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
