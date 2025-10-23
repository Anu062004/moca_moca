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
 * Get a specific issuer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== GET ISSUER ${params.id} API CALLED ===`)
    
    // Check session for authentication
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.error('No session found')
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated. Please sign in.',
      }, { status: 401 })
    }

    // Find issuer
    const issuer = issuers.find(i => i.id === params.id)
    
    if (!issuer) {
      return NextResponse.json({ 
        success: false,
        error: 'Issuer not found'
      }, { status: 404 })
    }

    console.log('Issuer found:', issuer.name)
    
    return NextResponse.json({
      success: true,
      issuer
    })
    
  } catch (error) {
    console.error('Get issuer error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to get issuer'
    }, { status: 500 })
  }
}

/**
 * Update an issuer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== UPDATE ISSUER ${params.id} API CALLED ===`)
    
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

    // Find issuer
    const issuerIndex = issuers.findIndex(i => i.id === params.id)
    
    if (issuerIndex === -1) {
      return NextResponse.json({ 
        success: false,
        error: 'Issuer not found'
      }, { status: 404 })
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

    // Check if DID is already used by another issuer
    const existingIssuer = issuers.find(i => i.did === did && i.id !== params.id)
    if (existingIssuer) {
      return NextResponse.json({ 
        success: false,
        error: 'Issuer with this DID already exists'
      }, { status: 409 })
    }

    // Update issuer
    const updatedIssuer: Issuer = {
      ...issuers[issuerIndex],
      name,
      did,
      type,
      description,
      website
    }

    issuers[issuerIndex] = updatedIssuer
    console.log('Issuer updated:', updatedIssuer)

    return NextResponse.json({
      success: true,
      issuer: updatedIssuer,
      message: 'Issuer updated successfully'
    })
    
  } catch (error) {
    console.error('Update issuer error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update issuer'
    }, { status: 500 })
  }
}

/**
 * Delete an issuer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== DELETE ISSUER ${params.id} API CALLED ===`)
    
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

    // Find issuer
    const issuerIndex = issuers.findIndex(i => i.id === params.id)
    
    if (issuerIndex === -1) {
      return NextResponse.json({ 
        success: false,
        error: 'Issuer not found'
      }, { status: 404 })
    }

    // Check if issuer has issued credentials
    const issuer = issuers[issuerIndex]
    if (issuer.credentials.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Cannot delete issuer with issued credentials. Revoke credentials first.'
      }, { status: 409 })
    }

    // Delete issuer
    const deletedIssuer = issuers.splice(issuerIndex, 1)[0]
    console.log('Issuer deleted:', deletedIssuer.name)

    return NextResponse.json({
      success: true,
      message: 'Issuer deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete issuer error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete issuer'
    }, { status: 500 })
  }
}
