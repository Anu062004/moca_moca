'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Award, 
  Code, 
  Users, 
  Star, 
  GitBranch, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  Share2,
  Plus,
  Filter,
  Search,
  TrendingUp,
  Network,
  Zap
} from 'lucide-react'
import { 
  VerifiableCredential, 
  DevPortfolioCredential, 
  SkillCredential, 
  ProjectCredential,
  CommunityBadgeCredential,
  EndorsementCredential,
  CredentialValidator 
} from '@/lib/credential-schemas'
import { 
  getDeveloperCredentials, 
  getCredentialsByType, 
  getDeveloperReputation,
  DeveloperIdentity,
  SkillGraph 
} from '@/lib/airkit'
import { DiagnosticPanel } from './diagnostic-panel'

export function CredentialDashboard() {
  const { address, isConnected } = useAccount()
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([])
  const [reputation, setReputation] = useState<{
    trustScore: number
    skillGraph: SkillGraph
    credentials: VerifiableCredential[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCredential, setSelectedCredential] = useState<VerifiableCredential | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPrivateInfo, setShowPrivateInfo] = useState(false)

  const credentialTypes = [
    { type: 'all', label: 'All Credentials', icon: Shield, color: 'purple' },
    { type: 'DevPortfolioCredential', label: 'Portfolio', icon: Award, color: 'blue' },
    { type: 'SkillCredential', label: 'Skills', icon: Code, color: 'green' },
    { type: 'ProjectCredential', label: 'Projects', icon: GitBranch, color: 'orange' },
    { type: 'CommunityBadgeCredential', label: 'Badges', icon: Users, color: 'pink' },
    { type: 'EndorsementCredential', label: 'Endorsements', icon: Star, color: 'yellow' }
  ]

  const loadCredentials = async () => {
    if (!address) return
    
    setLoading(true)
    setError(null)
    
    try {
      const [credentialData, reputationData] = await Promise.all([
        getDeveloperCredentials(address),
        getDeveloperReputation(address)
      ])
      
      setCredentials(credentialData)
      setReputation(reputationData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credentials')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      loadCredentials()
    }
  }, [isConnected, address])

  const filteredCredentials = credentials.filter(credential => {
    const matchesType = filterType === 'all' || credential.type.includes(filterType)
    const matchesSearch = searchQuery === '' || 
      credential.credentialSubject.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (credential.credentialSubject as any).skillName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (credential.credentialSubject as any).projectName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesType && matchesSearch
  })

  const getCredentialIcon = (credential: VerifiableCredential) => {
    const credentialType = credential.type.find(type => type !== "VerifiableCredential")
    const typeConfig = credentialTypes.find(t => t.type === credentialType)
    return typeConfig?.icon || Shield
  }

  const getCredentialColor = (credential: VerifiableCredential) => {
    const credentialType = credential.type.find(type => type !== "VerifiableCredential")
    const typeConfig = credentialTypes.find(t => t.type === credentialType)
    return typeConfig?.color || 'purple'
  }

  const formatCredentialData = (credential: VerifiableCredential) => {
    const credentialType = credential.type.find(type => type !== "VerifiableCredential")
    
    switch (credentialType) {
      case 'DevPortfolioCredential':
        const portfolio = credential as DevPortfolioCredential
        return {
          title: 'Developer Portfolio',
          subtitle: `@${portfolio.credentialSubject.githubUsername}`,
          details: [
            { label: 'Reputation Score', value: portfolio.credentialSubject.reputationScore },
            { label: 'Total Stars', value: portfolio.credentialSubject.totalStars },
            { label: 'Repositories', value: portfolio.credentialSubject.totalRepositories },
            { label: 'Followers', value: portfolio.credentialSubject.followers }
          ]
        }
      
      case 'SkillCredential':
        const skill = credential as SkillCredential
        return {
          title: skill.credentialSubject.skillName,
          subtitle: `${skill.credentialSubject.proficiencyLevel} Level`,
          details: [
            { label: 'Commits', value: skill.credentialSubject.evidence.commits },
            { label: 'Lines of Code', value: skill.credentialSubject.evidence.linesOfCode },
            { label: 'Projects', value: skill.credentialSubject.evidence.projects.length },
            { label: 'Repositories', value: skill.credentialSubject.evidence.repositories.length }
          ]
        }
      
      case 'ProjectCredential':
        const project = credential as ProjectCredential
        return {
          title: project.credentialSubject.projectName,
          subtitle: `${project.credentialSubject.role} • ${project.credentialSubject.contributionType}`,
          details: [
            { label: 'Commits', value: project.credentialSubject.contributionMetrics.commits },
            { label: 'Lines Added', value: project.credentialSubject.contributionMetrics.linesAdded },
            { label: 'Pull Requests', value: project.credentialSubject.contributionMetrics.pullRequests },
            { label: 'Issues Resolved', value: project.credentialSubject.contributionMetrics.issuesResolved }
          ]
        }
      
      case 'CommunityBadgeCredential':
        const badge = credential as CommunityBadgeCredential
        return {
          title: `${badge.credentialSubject.communityName} ${badge.credentialSubject.badgeType}`,
          subtitle: `${badge.credentialSubject.badgeLevel} Level`,
          details: [
            { label: 'Achievements', value: badge.credentialSubject.achievements.length },
            { label: 'Community', value: badge.credentialSubject.communityName },
            { label: 'Type', value: badge.credentialSubject.badgeType },
            { label: 'Level', value: badge.credentialSubject.badgeLevel }
          ]
        }
      
      case 'EndorsementCredential':
        const endorsement = credential as EndorsementCredential
        return {
          title: `${endorsement.credentialSubject.endorsedSkill} Endorsement`,
          subtitle: `${endorsement.credentialSubject.endorserType} • ${endorsement.credentialSubject.rating}/5`,
          details: [
            { label: 'Skill', value: endorsement.credentialSubject.endorsedSkill },
            { label: 'Rating', value: `${endorsement.credentialSubject.rating}/5` },
            { label: 'Endorser Type', value: endorsement.credentialSubject.endorserType },
            { label: 'Comment', value: endorsement.credentialSubject.endorsementText }
          ]
        }
      
      default:
        return {
          title: 'Unknown Credential',
          subtitle: 'Unknown Type',
          details: []
        }
    }
  }

  const exportCredential = (credential: VerifiableCredential) => {
    const dataStr = JSON.stringify(credential, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `credential-${credential.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const shareCredential = async (credential: VerifiableCredential) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Developer Credential',
          text: `Check out my ${credential.type[1]} credential!`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Credential link copied to clipboard!')
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Connect Your Wallet
          </h3>
          <p className="text-gray-300 mb-6">
            Connect your wallet to view and manage your developer credentials.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Developer Credentials Dashboard
        </h2>
        <p className="text-gray-300">
          Manage your verifiable credentials and showcase your developer reputation
        </p>
      </div>

      {/* Diagnostic Panel */}
      <DiagnosticPanel />

      {/* Reputation Overview */}
      {reputation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{reputation.trustScore}</p>
                <p className="text-purple-200">Trust Score</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{credentials.length}</p>
                <p className="text-blue-200">Total Credentials</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center space-x-3">
              <Network className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{reputation.skillGraph.skills.length}</p>
                <p className="text-green-200">Verified Skills</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          {credentialTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.type}
                onClick={() => setFilterType(type.type)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  filterType === type.type
                    ? `bg-${type.color}-600 text-white`
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{type.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Credentials Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading credentials...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-200">{error}</p>
          <button
            onClick={loadCredentials}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : filteredCredentials.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Credentials Found</h3>
          <p className="text-gray-300 mb-6">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by minting your first developer credential!'
            }
          </p>
          <button
            onClick={() => window.location.href = '/#analyze'}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Mint Credentials
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCredentials.map((credential) => {
            const Icon = getCredentialIcon(credential)
            const color = getCredentialColor(credential)
            const data = formatCredentialData(credential)
            const isValid = CredentialValidator.validateCredentialStructure(credential)
            const isExpired = CredentialValidator.isExpired(credential)
            
            return (
              <motion.div
                key={credential.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-${color}-500/30 transition-all cursor-pointer`}
                onClick={() => setSelectedCredential(credential)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-${color}-600/20 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${color}-400`} />
                  </div>
                  <div className="flex items-center space-x-2">
                    {isValid && !isExpired ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          exportCredential(credential)
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          shareCredential(credential)
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Share2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-1">
                  {data.title}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {data.subtitle}
                </p>
                
                <div className="space-y-2">
                  {data.details.slice(0, 2).map((detail, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-400">{detail.label}:</span>
                      <span className="text-white">{detail.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Issued: {new Date(credential.issuanceDate).toLocaleDateString()}</span>
                    <span className={`${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                      {isExpired ? 'Expired' : 'Valid'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Credential Detail Modal */}
      <AnimatePresence>
        {selectedCredential && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCredential(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Credential Details</h3>
                <button
                  onClick={() => setSelectedCredential(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Credential Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-white font-mono">{selectedCredential.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white">{selectedCredential.type.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Issuer:</span>
                      <span className="text-white">{selectedCredential.issuer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Issued:</span>
                      <span className="text-white">{new Date(selectedCredential.issuanceDate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Subject Data</h4>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    {JSON.stringify(selectedCredential.credentialSubject, null, 2)}
                  </pre>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => exportCredential(selectedCredential)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => shareCredential(selectedCredential)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
