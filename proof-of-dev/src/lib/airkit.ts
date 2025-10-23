// AIR Kit integration for Moca Network identity features
// Based on official AIR Kit documentation and W3C Verifiable Credentials

import { 
  VerifiableCredential, 
  DevPortfolioCredential, 
  SkillCredential, 
  ProjectCredential, 
  CommunityBadgeCredential, 
  EndorsementCredential,
  CredentialFactory 
} from './credential-schemas'

export interface DeveloperIdentity {
  address: string
  verified: boolean
  reputation: number
  credentials: VerifiableCredential[]
  githubUsername?: string
  totalStars?: number
  totalRepos?: number
  skillGraph?: SkillGraph
  trustScore?: number
}

export interface SkillGraph {
  skills: SkillNode[]
  connections: SkillConnection[]
  endorsements: EndorsementNode[]
}

export interface SkillNode {
  skillName: string
  proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  evidence: {
    repositories: string[]
    commits: number
    linesOfCode: number
    projects: string[]
  }
  verifiedAt: string
}

export interface SkillConnection {
  from: string
  to: string
  relationship: "prerequisite" | "related" | "complementary"
  strength: number // 0-1
}

export interface EndorsementNode {
  skillName: string
  endorserType: "Peer" | "Mentor" | "Employer" | "Community"
  rating: number
  count: number
}

export interface CredentialResult {
  success: boolean
  credential?: VerifiableCredential
  error?: string
}

export interface CredentialMetadata {
  githubUsername: string
  reputationScore: number
  totalStars: number
  totalRepos: number
}

export interface Credential {
  id: string
  type: string
  recipient: string
  metadata: CredentialMetadata
  issuedAt: string
  status: 'issued' | 'revoked' | 'pending'
  partnerId: string
}

export interface ReputationEngine {
  calculateTrustScore(credentials: VerifiableCredential[]): number
  calculateSkillScore(skillCredential: SkillCredential): number
  aggregateEndorsements(endorsements: EndorsementCredential[]): EndorsementNode[]
  buildSkillGraph(credentials: VerifiableCredential[]): SkillGraph
}

// AIR Kit configuration for Moca Network
export const airkitConfig = {
  partnerId: process.env.AIRKIT_PARTNER_ID || 'moca-proof-of-dev-2024',
  apiKey: process.env.AIRKIT_API_KEY || 'dev-key',
  baseUrl: 'https://air.api.air3.com/v2',
  buildEnv: 'sandbox', // Use sandbox for testnet
  enableLogging: true,
}

// Intelligent Reputation Engine
export class ReputationEngine implements ReputationEngine {
  calculateTrustScore(credentials: VerifiableCredential[]): number {
    let score = 0
    let weight = 0

    credentials.forEach(credential => {
      const credentialType = credential.type.find(type => type !== "VerifiableCredential")
      
      switch (credentialType) {
        case "DevPortfolioCredential":
          const portfolio = credential as DevPortfolioCredential
          score += portfolio.credentialSubject.reputationScore * 0.4
          weight += 0.4
          break
        case "SkillCredential":
          const skill = credential as SkillCredential
          score += this.calculateSkillScore(skill) * 0.3
          weight += 0.3
          break
        case "ProjectCredential":
          const project = credential as ProjectCredential
          score += Math.min(project.credentialSubject.contributionMetrics.commits * 0.1, 100) * 0.2
          weight += 0.2
          break
        case "EndorsementCredential":
          const endorsement = credential as EndorsementCredential
          score += endorsement.credentialSubject.rating * 20 * 0.1
          weight += 0.1
          break
      }
    })

    return weight > 0 ? Math.round(score / weight) : 0
  }

  calculateSkillScore(skillCredential: SkillCredential): number {
    const { proficiencyLevel, evidence } = skillCredential.credentialSubject
    
    let score = 0
    
    // Base score from proficiency level
    switch (proficiencyLevel) {
      case "Beginner": score = 25; break
      case "Intermediate": score = 50; break
      case "Advanced": score = 75; break
      case "Expert": score = 100; break
    }
    
    // Evidence multipliers
    const commitsMultiplier = Math.min(evidence.commits / 100, 1)
    const locMultiplier = Math.min(evidence.linesOfCode / 10000, 1)
    const projectsMultiplier = Math.min(evidence.projects.length / 5, 1)
    
    score = score * (0.4 + 0.2 * commitsMultiplier + 0.2 * locMultiplier + 0.2 * projectsMultiplier)
    
    return Math.round(Math.min(score, 100))
  }

  aggregateEndorsements(endorsements: EndorsementCredential[]): EndorsementNode[] {
    const endorsementMap = new Map<string, EndorsementNode>()
    
    endorsements.forEach(endorsement => {
      const skillName = endorsement.credentialSubject.endorsedSkill
      const existing = endorsementMap.get(skillName)
      
      if (existing) {
        existing.rating = (existing.rating * existing.count + endorsement.credentialSubject.rating) / (existing.count + 1)
        existing.count += 1
      } else {
        endorsementMap.set(skillName, {
          skillName,
          endorserType: endorsement.credentialSubject.endorserType,
          rating: endorsement.credentialSubject.rating,
          count: 1
        })
      }
    })
    
    return Array.from(endorsementMap.values())
  }

  buildSkillGraph(credentials: VerifiableCredential[]): SkillGraph {
    const skills: SkillNode[] = []
    const connections: SkillConnection[] = []
    const endorsements: EndorsementNode[] = []
    
    // Extract skills from credentials
    credentials.forEach(credential => {
      const credentialType = credential.type.find(type => type !== "VerifiableCredential")
      
      if (credentialType === "SkillCredential") {
        const skill = credential as SkillCredential
        skills.push({
          skillName: skill.credentialSubject.skillName,
          proficiencyLevel: skill.credentialSubject.proficiencyLevel,
          evidence: skill.credentialSubject.evidence,
          verifiedAt: skill.credentialSubject.verifiedAt
        })
      } else if (credentialType === "EndorsementCredential") {
        const endorsement = credential as EndorsementCredential
        endorsements.push({
          skillName: endorsement.credentialSubject.endorsedSkill,
          endorserType: endorsement.credentialSubject.endorserType,
          rating: endorsement.credentialSubject.rating,
          count: 1
        })
      }
    })
    
    // Build skill connections based on common projects and languages
    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        const skill1 = skills[i]
        const skill2 = skills[j]
        
        // Calculate relationship strength based on shared projects
        const sharedProjects = skill1.evidence.projects.filter(project => 
          skill2.evidence.projects.includes(project)
        ).length
        
        if (sharedProjects > 0) {
          connections.push({
            from: skill1.skillName,
            to: skill2.skillName,
            relationship: "related",
            strength: Math.min(sharedProjects / 3, 1)
          })
        }
      }
    }
    
    return { skills, connections, endorsements }
  }
}

// AIR Kit service implementation based on official docs
export class AirKitService {
  private partnerId: string
  private apiKey: string
  private baseUrl: string
  private reputationEngine: ReputationEngine

  constructor(partnerId: string, apiKey: string, baseUrl: string) {
    this.partnerId = partnerId
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.reputationEngine = new ReputationEngine()
  }

  async init() {
    console.log('AIR Kit Service initialized with partner ID:', this.partnerId)
    return this
  }

  async getUserProfile(address: string): Promise<DeveloperIdentity> {
    try {
      // For development, return a mock profile with credentials
      // In production, this would call the AIR Kit API to fetch user credentials
      const mockCredentials: VerifiableCredential[] = [
        CredentialFactory.createDevPortfolioCredential(
          address,
          {
            username: `user_${address.slice(0, 6)}`,
            reputationScore: Math.floor(Math.random() * 100),
            totalStars: Math.floor(Math.random() * 1000),
            totalRepositories: Math.floor(Math.random() * 50),
            totalCommits: Math.floor(Math.random() * 1000),
            followers: Math.floor(Math.random() * 100),
            accountAge: Math.floor(Math.random() * 3650),
            topLanguages: ['JavaScript', 'TypeScript', 'Python', 'Solidity']
          },
          this.partnerId
        )
      ]

      const trustScore = this.reputationEngine.calculateTrustScore(mockCredentials)
      const skillGraph = this.reputationEngine.buildSkillGraph(mockCredentials)

      return {
        address,
        verified: true,
        reputation: trustScore,
        credentials: mockCredentials,
        githubUsername: `user_${address.slice(0, 6)}`,
        totalStars: Math.floor(Math.random() * 1000),
        totalRepos: Math.floor(Math.random() * 50),
        skillGraph,
        trustScore
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  async issueCredential(params: {
    recipient: string
    credentialType: string
    metadata: CredentialMetadata
  }): Promise<VerifiableCredential> {
    try {
      // For development, return a mock credential
      // In production, this would call the AIR Kit API
      const credential = CredentialFactory.createDevPortfolioCredential(
        params.recipient,
        {
          username: params.metadata.githubUsername,
          reputationScore: params.metadata.reputationScore,
          totalStars: params.metadata.totalStars,
          totalRepositories: params.metadata.totalRepos,
          totalCommits: params.metadata.totalRepos * 10, // Estimate
          followers: Math.floor(params.metadata.reputationScore / 2),
          accountAge: 365 * 2, // Estimate 2 years
          topLanguages: ['JavaScript', 'TypeScript', 'Python']
        },
        this.partnerId
      )

      return credential
    } catch (error) {
      console.error('Error issuing credential:', error)
      throw error
    }
  }

  async issueSkillCredential(params: {
    recipient: string
    skillName: string
    proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert"
    evidence: {
      repositories: string[]
      commits: number
      linesOfCode: number
      projects: string[]
    }
  }): Promise<SkillCredential> {
    try {
      const credential = CredentialFactory.createSkillCredential(
        params.recipient,
        {
          skillName: params.skillName,
          proficiencyLevel: params.proficiencyLevel,
          evidence: params.evidence
        },
        this.partnerId
      )

      return credential
    } catch (error) {
      console.error('Error issuing skill credential:', error)
      throw error
    }
  }

  async issueProjectCredential(params: {
    recipient: string
    projectName: string
    projectUrl: string
    role: "Contributor" | "Maintainer" | "Creator" | "Reviewer"
    contributionType: "Code" | "Documentation" | "Design" | "Testing" | "Review"
    contributionMetrics: {
      commits: number
      linesAdded: number
      linesRemoved: number
      pullRequests: number
      issuesResolved: number
    }
  }): Promise<ProjectCredential> {
    try {
      const credential = CredentialFactory.createProjectCredential(
        params.recipient,
        {
          projectName: params.projectName,
          projectUrl: params.projectUrl,
          role: params.role,
          contributionType: params.contributionType,
          contributionMetrics: params.contributionMetrics
        },
        this.partnerId
      )

      return credential
    } catch (error) {
      console.error('Error issuing project credential:', error)
      throw error
    }
  }

  async verifyCredential(credentialId: string): Promise<boolean> {
    try {
      // For development, always return true
      // In production, this would verify the credential signature and check revocation status
      return true
    } catch (error) {
      console.error('Error verifying credential:', error)
      return false
    }
  }

  async getCredentialsByType(address: string, credentialType: string): Promise<VerifiableCredential[]> {
    try {
      // For development, return mock credentials
      // In production, this would query the AIR Kit API
      const profile = await this.getUserProfile(address)
      return profile.credentials.filter(cred => 
        cred.type.includes(credentialType)
      )
    } catch (error) {
      console.error('Error getting credentials by type:', error)
      return []
    }
  }
}

export function createAirService() {
  return new AirKitService(
    airkitConfig.partnerId,
    airkitConfig.apiKey,
    airkitConfig.baseUrl
  )
}

// Initialize AIR Service
export async function initializeAirService() {
  const airService = createAirService()
  await airService.init()
  return airService
}

// AIR Kit identity verification functions
export async function verifyDeveloperIdentity(address: string): Promise<DeveloperIdentity> {
  try {
    const airService = await initializeAirService()
    const identity = await airService.getUserProfile(address)
    return identity
  } catch (error) {
    console.error('AIR Kit verification failed:', error)
    return {
      address,
      verified: false,
      reputation: 0,
      badges: [],
    }
  }
}

export interface GithubBadgeInput {
  username: string
  reputationScore: number
  totalStars: number
  totalRepositories: number
}

export async function mintDeveloperBadge(address: string, githubData: GithubBadgeInput): Promise<CredentialResult> {
  try {
    const airService = await initializeAirService()
    const result = await airService.issueCredential({
      recipient: address,
      credentialType: 'DevPortfolioCredential',
      metadata: {
        githubUsername: githubData.username,
        reputationScore: githubData.reputationScore,
        totalStars: githubData.totalStars,
        totalRepos: githubData.totalRepositories,
      },
    })
    return { success: true, credential: result }
  } catch (error) {
    console.error('AIR Kit credential issuance failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

// New credential issuance functions
export async function issueSkillCredential(
  address: string, 
  skillData: {
    skillName: string
    proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert"
    evidence: {
      repositories: string[]
      commits: number
      linesOfCode: number
      projects: string[]
    }
  }
): Promise<CredentialResult> {
  try {
    const airService = await initializeAirService()
    const result = await airService.issueSkillCredential({
      recipient: address,
      ...skillData
    })
    return { success: true, credential: result }
  } catch (error) {
    console.error('AIR Kit skill credential issuance failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function issueProjectCredential(
  address: string,
  projectData: {
    projectName: string
    projectUrl: string
    role: "Contributor" | "Maintainer" | "Creator" | "Reviewer"
    contributionType: "Code" | "Documentation" | "Design" | "Testing" | "Review"
    contributionMetrics: {
      commits: number
      linesAdded: number
      linesRemoved: number
      pullRequests: number
      issuesResolved: number
    }
  }
): Promise<CredentialResult> {
  try {
    const airService = await initializeAirService()
    const result = await airService.issueProjectCredential({
      recipient: address,
      ...projectData
    })
    return { success: true, credential: result }
  } catch (error) {
    console.error('AIR Kit project credential issuance failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

// Verification functions
export async function verifyCredential(credentialId: string): Promise<boolean> {
  try {
    const airService = await initializeAirService()
    return await airService.verifyCredential(credentialId)
  } catch (error) {
    console.error('AIR Kit credential verification failed:', error)
    return false
  }
}

export async function getDeveloperCredentials(address: string): Promise<VerifiableCredential[]> {
  try {
    const airService = await initializeAirService()
    const profile = await airService.getUserProfile(address)
    return profile.credentials
  } catch (error) {
    console.error('AIR Kit credential retrieval failed:', error)
    return []
  }
}

export async function getCredentialsByType(address: string, credentialType: string): Promise<VerifiableCredential[]> {
  try {
    const airService = await initializeAirService()
    return await airService.getCredentialsByType(address, credentialType)
  } catch (error) {
    console.error('AIR Kit credential type retrieval failed:', error)
    return []
  }
}

// Reputation and skill graph functions
export async function getDeveloperReputation(address: string): Promise<{
  trustScore: number
  skillGraph: SkillGraph
  credentials: VerifiableCredential[]
}> {
  try {
    const airService = await initializeAirService()
    const profile = await airService.getUserProfile(address)
    
    return {
      trustScore: profile.trustScore || 0,
      skillGraph: profile.skillGraph || { skills: [], connections: [], endorsements: [] },
      credentials: profile.credentials
    }
  } catch (error) {
    console.error('AIR Kit reputation retrieval failed:', error)
    return {
      trustScore: 0,
      skillGraph: { skills: [], connections: [], endorsements: [] },
      credentials: []
    }
  }
}
