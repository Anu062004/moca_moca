import { NextRequest, NextResponse } from 'next/server'
import { 
  issueCommunityBadgeCredential,
  CredentialResult 
} from '@/lib/airkit'
import { 
  CommunityBadgeCredential,
  CredentialFactory 
} from '@/lib/credential-schemas'

// Community Badge System for tech communities
// Allows communities to issue portable, verifiable membership credentials

export interface Community {
  id: string
  name: string
  description: string
  website: string
  logo: string
  badgeTypes: BadgeType[]
  requirements: BadgeRequirement[]
  verified: boolean
  createdAt: string
}

export interface BadgeType {
  id: string
  name: string
  description: string
  levels: BadgeLevel[]
  requirements: string[]
  icon: string
  color: string
}

export interface BadgeLevel {
  level: "Bronze" | "Silver" | "Gold" | "Platinum"
  name: string
  description: string
  requirements: string[]
  achievements: string[]
  pointsRequired: number
}

export interface BadgeRequirement {
  type: "attendance" | "contribution" | "leadership" | "mentorship" | "speaking"
  description: string
  points: number
  verificationMethod: "manual" | "automatic" | "peer"
}

export interface BadgeIssuanceRequest {
  communityId: string
  developerAddress: string
  badgeType: string
  badgeLevel: "Bronze" | "Silver" | "Gold" | "Platinum"
  achievements: string[]
  evidence: {
    type: string
    description: string
    url?: string
    verifiedBy?: string
  }[]
  issuedBy: string
}

export interface BadgeIssuanceResult {
  success: boolean
  credential: CredentialResult
  badge: {
    communityName: string
    badgeType: string
    badgeLevel: string
    achievements: string[]
    issuedAt: string
  }
  error?: string
}

// Issue community badge credential
export async function POST(request: NextRequest) {
  try {
    const body: BadgeIssuanceRequest = await request.json()
    const { 
      communityId, 
      developerAddress, 
      badgeType, 
      badgeLevel, 
      achievements, 
      evidence,
      issuedBy 
    } = body

    // Validate required fields
    if (!communityId || !developerAddress || !badgeType || !badgeLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get community information
    const community = await getCommunity(communityId)
    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      )
    }

    // Validate badge type and level
    const badgeTypeConfig = community.badgeTypes.find(bt => bt.id === badgeType)
    if (!badgeTypeConfig) {
      return NextResponse.json(
        { error: 'Invalid badge type' },
        { status: 400 }
      )
    }

    const badgeLevelConfig = badgeTypeConfig.levels.find(bl => bl.level === badgeLevel)
    if (!badgeLevelConfig) {
      return NextResponse.json(
        { error: 'Invalid badge level' },
        { status: 400 }
      )
    }

    // Issue the credential
    const credential = await issueCommunityBadgeCredential(developerAddress, {
      communityName: community.name,
      badgeType: badgeTypeConfig.name,
      badgeLevel,
      achievements
    })

    const result: BadgeIssuanceResult = {
      success: credential.success,
      credential,
      badge: {
        communityName: community.name,
        badgeType: badgeTypeConfig.name,
        badgeLevel,
        achievements,
        issuedAt: new Date().toISOString()
      },
      error: credential.error
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Community badge issuance error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to issue community badge' 
      },
      { status: 500 }
    )
  }
}

// Get community information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const communityId = searchParams.get('id')
    const action = searchParams.get('action')

    if (action === 'list') {
      // Return list of all communities
      const communities = await getAllCommunities()
      return NextResponse.json({
        success: true,
        communities
      })
    }

    if (communityId) {
      // Return specific community
      const community = await getCommunity(communityId)
      if (!community) {
        return NextResponse.json(
          { error: 'Community not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        community
      })
    }

    // Return API documentation
    return NextResponse.json({
      success: true,
      endpoints: {
        issueBadge: 'POST /api/community-badges',
        getCommunity: 'GET /api/community-badges?id={communityId}',
        listCommunities: 'GET /api/community-badges?action=list',
        createCommunity: 'PUT /api/community-badges'
      },
      badgeTypes: [
        'Member',
        'Contributor', 
        'Mentor',
        'Organizer',
        'Speaker'
      ],
      badgeLevels: [
        'Bronze',
        'Silver', 
        'Gold',
        'Platinum'
      ]
    })
  } catch (error) {
    console.error('Community badges GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get community information' 
      },
      { status: 500 }
    )
  }
}

// Create new community
export async function PUT(request: NextRequest) {
  try {
    const body: Omit<Community, 'id' | 'createdAt'> = await request.json()
    const { name, description, website, logo, badgeTypes, requirements, verified } = body

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Community name and description are required' },
        { status: 400 }
      )
    }

    // Create new community
    const community: Community = {
      id: `community_${Date.now()}`,
      name,
      description,
      website: website || '',
      logo: logo || '',
      badgeTypes: badgeTypes || [],
      requirements: requirements || [],
      verified: verified || false,
      createdAt: new Date().toISOString()
    }

    // In a real implementation, this would save to a database
    await saveCommunity(community)

    return NextResponse.json({
      success: true,
      community
    })
  } catch (error) {
    console.error('Community creation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create community' 
      },
      { status: 500 }
    )
  }
}

// Mock data and functions (in production, these would connect to a database)

async function getCommunity(communityId: string): Promise<Community | null> {
  // Mock communities data
  const mockCommunities: Community[] = [
    {
      id: 'ethereum-foundation',
      name: 'Ethereum Foundation',
      description: 'Building the decentralized future',
      website: 'https://ethereum.org',
      logo: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.png',
      badgeTypes: [
        {
          id: 'contributor',
          name: 'Contributor',
          description: 'Active contributor to Ethereum ecosystem',
          levels: [
            {
              level: 'Bronze',
              name: 'Bronze Contributor',
              description: 'Made initial contributions',
              requirements: ['5+ commits', '1+ PR merged'],
              achievements: ['First Contribution', 'Community Member'],
              pointsRequired: 100
            },
            {
              level: 'Silver',
              name: 'Silver Contributor',
              description: 'Regular contributor',
              requirements: ['25+ commits', '5+ PRs merged', '3+ months active'],
              achievements: ['Regular Contributor', 'Code Reviewer'],
              pointsRequired: 500
            },
            {
              level: 'Gold',
              name: 'Gold Contributor',
              description: 'Significant contributor',
              requirements: ['100+ commits', '20+ PRs merged', '6+ months active'],
              achievements: ['Core Contributor', 'Mentor'],
              pointsRequired: 1000
            },
            {
              level: 'Platinum',
              name: 'Platinum Contributor',
              description: 'Leading contributor',
              requirements: ['500+ commits', '50+ PRs merged', '1+ year active'],
              achievements: ['Lead Contributor', 'Architecture Contributor'],
              pointsRequired: 2500
            }
          ],
          requirements: ['GitHub activity', 'Code quality', 'Community engagement'],
          icon: 'code',
          color: 'blue'
        }
      ],
      requirements: [
        {
          type: 'contribution',
          description: 'Code contributions to Ethereum projects',
          points: 50,
          verificationMethod: 'automatic'
        },
        {
          type: 'mentorship',
          description: 'Mentoring new developers',
          points: 100,
          verificationMethod: 'peer'
        }
      ],
      verified: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'moca-network',
      name: 'Moca Network',
      description: 'Building the future of decentralized identity',
      website: 'https://moca.network',
      logo: 'https://moca.network/logo.png',
      badgeTypes: [
        {
          id: 'developer',
          name: 'Developer',
          description: 'Moca Network developer',
          levels: [
            {
              level: 'Bronze',
              name: 'Bronze Developer',
              description: 'New Moca developer',
              requirements: ['Completed onboarding', 'First project'],
              achievements: ['Moca Developer', 'Onboarded'],
              pointsRequired: 50
            },
            {
              level: 'Silver',
              name: 'Silver Developer',
              description: 'Active Moca developer',
              requirements: ['3+ projects', 'Community participation'],
              achievements: ['Active Developer', 'Community Member'],
              pointsRequired: 200
            },
            {
              level: 'Gold',
              name: 'Gold Developer',
              description: 'Senior Moca developer',
              requirements: ['10+ projects', 'Mentoring others'],
              achievements: ['Senior Developer', 'Mentor'],
              pointsRequired: 500
            },
            {
              level: 'Platinum',
              name: 'Platinum Developer',
              description: 'Moca ecosystem leader',
              requirements: ['25+ projects', 'Leadership role'],
              achievements: ['Ecosystem Leader', 'Architect'],
              pointsRequired: 1000
            }
          ],
          requirements: ['Moca projects', 'Community engagement', 'Technical excellence'],
          icon: 'zap',
          color: 'purple'
        }
      ],
      requirements: [
        {
          type: 'contribution',
          description: 'Contributions to Moca ecosystem',
          points: 25,
          verificationMethod: 'automatic'
        },
        {
          type: 'leadership',
          description: 'Leading community initiatives',
          points: 75,
          verificationMethod: 'manual'
        }
      ],
      verified: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ]

  return mockCommunities.find(c => c.id === communityId) || null
}

async function getAllCommunities(): Promise<Community[]> {
  // Return all mock communities
  return [
    {
      id: 'ethereum-foundation',
      name: 'Ethereum Foundation',
      description: 'Building the decentralized future',
      website: 'https://ethereum.org',
      logo: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.png',
      badgeTypes: [],
      requirements: [],
      verified: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'moca-network',
      name: 'Moca Network',
      description: 'Building the future of decentralized identity',
      website: 'https://moca.network',
      logo: 'https://moca.network/logo.png',
      badgeTypes: [],
      requirements: [],
      verified: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ]
}

async function saveCommunity(community: Community): Promise<void> {
  // In production, this would save to a database
  console.log('Saving community:', community)
}

// Helper function to issue community badge credential
async function issueCommunityBadgeCredential(
  developerAddress: string,
  badgeData: {
    communityName: string
    badgeType: string
    badgeLevel: "Bronze" | "Silver" | "Gold" | "Platinum"
    achievements: string[]
  }
): Promise<CredentialResult> {
  try {
    // This would use the actual AIR Kit service
    const credential = CredentialFactory.createCommunityBadgeCredential(
      developerAddress,
      badgeData,
      'moca-network-community-system'
    )

    return {
      success: true,
      credential
    }
  } catch (error) {
    console.error('Error issuing community badge credential:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
