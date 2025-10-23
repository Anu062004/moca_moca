import { VerifiableCredential, CredentialSubject, Proof } from '@mocanetwork/airkit'

/**
 * DevPortfolioCredential - W3C Verifiable Credential Schema
 * Represents a comprehensive developer portfolio with verifiable claims
 */

export interface DevPortfolioCredentialSubject extends CredentialSubject {
  id: string // DID of the developer
  type: 'DevPortfolio'
  
  // Developer Identity
  githubUsername: string
  displayName: string
  email?: string
  avatarUrl?: string
  
  // Reputation Metrics
  reputationScore: number
  totalCommits: number
  totalRepositories: number
  totalStars: number
  totalForks: number
  followers: number
  following: number
  accountAge: number // days since account creation
  
  // Technical Skills
  topLanguages: Array<{
    language: string
    bytes: number
    percentage: number
  }>
  frameworks: string[]
  databases: string[]
  tools: string[]
  
  // Project Portfolio
  featuredProjects: Array<{
    name: string
    description: string
    url: string
    stars: number
    forks: number
    language: string
    lastUpdated: string
  }>
  
  // Community & Social Proof
  organizations: string[]
  contributions: number
  recentActivity: number // commits in last 30 days
  
  // Verification Metadata
  verifiedAt: string
  verificationMethod: string
  dataSource: 'GitHub' | 'GitLab' | 'Bitbucket' | 'Manual'
  
  // Selective Disclosure Predicates
  predicates: {
    reputationScore: {
      min: number
      max: number
    }
    totalStars: {
      min: number
      max: number
    }
    accountAge: {
      min: number
      max: number
    }
    topLanguages: string[]
  }
}

export interface DevPortfolioCredential extends VerifiableCredential {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://moca.network/credentials/dev-portfolio/v1'
  ]
  type: ['VerifiableCredential', 'DevPortfolioCredential']
  credentialSubject: DevPortfolioCredentialSubject
  credentialSchema: {
    id: 'https://moca.network/schemas/dev-portfolio/v1'
    type: 'JsonSchemaValidator2018'
  }
  evidence?: Array<{
    id: string
    type: 'GitHubProfile'
    verifier: string
    evidenceDocument: {
      profileUrl: string
      verifiedAt: string
    }
  }>
}

/**
 * Example DevPortfolioCredential payload
 */
export const exampleDevPortfolioCredential: DevPortfolioCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://moca.network/credentials/dev-portfolio/v1'
  ],
  type: ['VerifiableCredential', 'DevPortfolioCredential'],
  id: 'https://moca.network/credentials/dev-portfolio/123456789',
  issuer: {
    id: 'did:moca:issuer:proof-of-dev-2024',
    name: 'Proof of Dev Wave 3',
    type: 'Organization'
  },
  issuanceDate: '2024-01-15T10:30:00Z',
  expirationDate: '2025-01-15T10:30:00Z',
  credentialSubject: {
    id: 'did:moca:developer:0x1234567890123456789012345678901234567890',
    type: 'DevPortfolio',
    
    // Developer Identity
    githubUsername: 'octocat',
    displayName: 'The Octocat',
    email: 'octocat@github.com',
    avatarUrl: 'https://github.com/images/error/octocat_happy.gif',
    
    // Reputation Metrics
    reputationScore: 95,
    totalCommits: 1250,
    totalRepositories: 45,
    totalStars: 1250,
    totalForks: 320,
    followers: 150,
    following: 75,
    accountAge: 1825, // 5 years
    
    // Technical Skills
    topLanguages: [
      { language: 'JavaScript', bytes: 500000, percentage: 35 },
      { language: 'TypeScript', bytes: 300000, percentage: 21 },
      { language: 'Python', bytes: 250000, percentage: 18 },
      { language: 'Go', bytes: 200000, percentage: 14 },
      { language: 'Rust', bytes: 150000, percentage: 12 }
    ],
    frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI'],
    databases: ['PostgreSQL', 'MongoDB', 'Redis'],
    tools: ['Docker', 'Kubernetes', 'AWS', 'GitHub Actions'],
    
    // Project Portfolio
    featuredProjects: [
      {
        name: 'Awesome Project',
        description: 'A revolutionary open-source project',
        url: 'https://github.com/octocat/awesome-project',
        stars: 500,
        forks: 100,
        language: 'JavaScript',
        lastUpdated: '2024-01-10T15:30:00Z'
      },
      {
        name: 'Dev Tools',
        description: 'Essential developer utilities',
        url: 'https://github.com/octocat/dev-tools',
        stars: 250,
        forks: 50,
        language: 'TypeScript',
        lastUpdated: '2024-01-12T09:15:00Z'
      }
    ],
    
    // Community & Social Proof
    organizations: ['github', 'open-source-community'],
    contributions: 45,
    recentActivity: 25,
    
    // Verification Metadata
    verifiedAt: '2024-01-15T10:30:00Z',
    verificationMethod: 'GitHub API Analysis',
    dataSource: 'GitHub',
    
    // Selective Disclosure Predicates
    predicates: {
      reputationScore: { min: 0, max: 100 },
      totalStars: { min: 0, max: 10000 },
      accountAge: { min: 0, max: 3650 },
      topLanguages: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust']
    }
  },
  credentialSchema: {
    id: 'https://moca.network/schemas/dev-portfolio/v1',
    type: 'JsonSchemaValidator2018'
  },
  evidence: [
    {
      id: 'github-profile-evidence',
      type: 'GitHubProfile',
      verifier: 'Proof of Dev Wave 3',
      evidenceDocument: {
        profileUrl: 'https://github.com/octocat',
        verifiedAt: '2024-01-15T10:30:00Z'
      }
    }
  ],
  proof: {
    type: 'MocaSignature2024',
    created: '2024-01-15T10:30:00Z',
    verificationMethod: 'did:moca:issuer:proof-of-dev-2024#key-1',
    proofPurpose: 'assertionMethod',
    proofValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
}

/**
 * Selective Disclosure Predicates for ZK Proofs
 */
export interface SelectiveDisclosurePredicate {
  field: string
  operator: 'gte' | 'lte' | 'eq' | 'in' | 'contains'
  value: any
  description: string
}

export const examplePredicates: SelectiveDisclosurePredicate[] = [
  {
    field: 'reputationScore',
    operator: 'gte',
    value: 80,
    description: 'Reputation score is at least 80'
  },
  {
    field: 'totalStars',
    operator: 'gte',
    value: 100,
    description: 'Has at least 100 stars across repositories'
  },
  {
    field: 'accountAge',
    operator: 'gte',
    value: 365,
    description: 'Account is at least 1 year old'
  },
  {
    field: 'topLanguages',
    operator: 'contains',
    value: 'JavaScript',
    description: 'Proficient in JavaScript'
  }
]

/**
 * Credential Factory for creating DevPortfolioCredentials
 */
export class DevPortfolioCredentialFactory {
  static create(
    developerData: any,
    issuerDid: string,
    subjectDid: string
  ): DevPortfolioCredential {
    const now = new Date().toISOString()
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    
    return {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://moca.network/credentials/dev-portfolio/v1'
      ],
      type: ['VerifiableCredential', 'DevPortfolioCredential'],
      id: `https://moca.network/credentials/dev-portfolio/${Date.now()}`,
      issuer: {
        id: issuerDid,
        name: 'Proof of Dev Wave 3',
        type: 'Organization'
      },
      issuanceDate: now,
      expirationDate: oneYearFromNow,
      credentialSubject: {
        id: subjectDid,
        type: 'DevPortfolio',
        githubUsername: developerData.githubUsername,
        displayName: developerData.displayName || developerData.githubUsername,
        email: developerData.email,
        avatarUrl: developerData.avatarUrl,
        reputationScore: developerData.reputationScore,
        totalCommits: developerData.totalCommits,
        totalRepositories: developerData.totalRepositories,
        totalStars: developerData.totalStars,
        totalForks: developerData.totalForks,
        followers: developerData.followers,
        following: developerData.following,
        accountAge: developerData.accountAge,
        topLanguages: developerData.topLanguages || [],
        frameworks: developerData.frameworks || [],
        databases: developerData.databases || [],
        tools: developerData.tools || [],
        featuredProjects: developerData.featuredProjects || [],
        organizations: developerData.organizations || [],
        contributions: developerData.contributions,
        recentActivity: developerData.recentActivity,
        verifiedAt: now,
        verificationMethod: 'GitHub API Analysis',
        dataSource: 'GitHub',
        predicates: {
          reputationScore: { min: 0, max: 100 },
          totalStars: { min: 0, max: 10000 },
          accountAge: { min: 0, max: 3650 },
          topLanguages: (developerData.topLanguages || []).map((lang: any) => lang.language || lang)
        }
      },
      credentialSchema: {
        id: 'https://moca.network/schemas/dev-portfolio/v1',
        type: 'JsonSchemaValidator2018'
      },
      evidence: [
        {
          id: 'github-profile-evidence',
          type: 'GitHubProfile',
          verifier: 'Proof of Dev Wave 3',
          evidenceDocument: {
            profileUrl: `https://github.com/${developerData.githubUsername}`,
            verifiedAt: now
          }
        }
      ]
    } as DevPortfolioCredential
  }
}
