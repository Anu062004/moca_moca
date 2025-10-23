import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface Issuer {
  id: string
  name: string
  did: string
  type: 'Organization' | 'Individual'
  description: string
  website?: string
  verified: boolean
  createdAt: string
  credentials: string[]
}

// In-memory store for demo purposes
// In production, this would be a database
let issuers: Issuer[] = [
  {
    id: '1',
    name: 'GitHub',
    did: 'did:moca:issuer:github',
    type: 'Organization',
    description: 'Leading software development platform and version control system',
    website: 'https://github.com',
    verified: true,
    createdAt: new Date().toISOString(),
    credentials: ['DevPortfolioCredential', 'ProjectCredential']
  },
  {
    id: '2',
    name: 'Microsoft',
    did: 'did:moca:issuer:microsoft',
    type: 'Organization',
    description: 'Technology corporation and cloud services provider',
    website: 'https://microsoft.com',
    verified: true,
    createdAt: new Date().toISOString(),
    credentials: ['SkillCredential', 'CommunityBadgeCredential']
  },
  {
    id: '3',
    name: 'Open Source Foundation',
    did: 'did:moca:issuer:opensource',
    type: 'Organization',
    description: 'Non-profit organization supporting open source software',
    website: 'https://opensource.org',
    verified: false,
    createdAt: new Date().toISOString(),
    credentials: ['CommunityBadgeCredential']
  }
]

/**
 * Get all issuers
 */
export async function GET() {
  try {
    console.log('=== GET ISSUERS API CALLED ===')
    
    // Check session for authentication
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.error('No session found')
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated. Please sign in.',
      }, { status: 401 })
    }

    // Check if user has admin privileges
    // In production, this would check against a user roles system
    const isAdmin = session.user?.email === 'admin@proofofdev.com' || 
                   session.githubLogin === 'admin' ||
                   process.env.NODE_ENV === 'development'

    if (!isAdmin) {
      console.error('User not authorized for admin operations')
      return NextResponse.json({ 
        success: false,
        error: 'Not authorized. Admin privileges required.',
      }, { status: 403 })
    }

    console.log('Admin access granted, returning issuers')
    
    return NextResponse.json({
      success: true,
      issuers,
      count: issuers.length
    })
    
  } catch (error) {
    console.error('Get issuers error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to get issuers'
    }, { status: 500 })
  }
}

/**
 * Create a new issuer
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE ISSUER API CALLED ===')
    
    // Check session for authentication
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.error('No session found')
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated. Please sign in.',
      }, { status: 401 })
    }

    // Check if user has admin privileges
    const isAdmin = session.user?.email === 'admin@proofofdev.com' || 
                   session.githubLogin === 'admin' ||
                   process.env.NODE_ENV === 'development'

    if (!isAdmin) {
      console.error('User not authorized for admin operations')
      return NextResponse.json({ 
        success: false,
        error: 'Not authorized. Admin privileges required.',
      }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { name, did, type, description, website } = body

    // Validate input
    if (!name || !did || !type || !description) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: name, did, type, description'
      }, { status: 400 })
    }

    // Validate DID format
    if (!did.startsWith('did:')) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid DID format. Must start with "did:"'
      }, { status: 400 })
    }

    // Check if issuer already exists
    const existingIssuer = issuers.find(i => i.did === did)
    if (existingIssuer) {
      return NextResponse.json({ 
        success: false,
        error: 'Issuer with this DID already exists'
      }, { status: 409 })
    }

    // Create new issuer
    const newIssuer: Issuer = {
      id: (issuers.length + 1).toString(),
      name,
      did,
      type,
      description,
      website,
      verified: false,
      createdAt: new Date().toISOString(),
      credentials: []
    }

    issuers.push(newIssuer)
    console.log('New issuer created:', newIssuer)

    return NextResponse.json({
      success: true,
      issuer: newIssuer,
      message: 'Issuer created successfully'
    })
    
  } catch (error) {
    console.error('Create issuer error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create issuer'
    }, { status: 500 })
  }
}
