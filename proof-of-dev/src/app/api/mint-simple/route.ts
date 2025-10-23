import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface MintSimpleRequest {
  developer: string
  githubUsername: string
  metrics: {
    reputationScore: number
    totalCommits: number
    totalRepositories: number
    totalStars: number
    followers: number
    accountAge: number
    topLanguages: string[]
  }
}

interface MintSimpleResponse {
  success: boolean
  developer?: any
  credential?: any
  timestamp?: string
  error?: string
  requestId: string
  processingTime: number
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] === MINT SIMPLE API CALLED ===`)
    
    // Parse and validate request body
    let body: MintSimpleRequest
    try {
      body = await request.json()
      console.log(`[${requestId}] Request body:`, { 
        developer: body.developer,
        githubUsername: body.githubUsername,
        hasMetrics: !!body.metrics
      })
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError)
      return NextResponse.json({ 
        success: false,
        error: 'Invalid JSON in request body',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    const { developer, githubUsername, metrics } = body

    // Validate input
    if (!developer || !githubUsername || !metrics) {
      console.error(`[${requestId}] Missing required fields`)
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: developer, githubUsername, metrics',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    // Check session for authentication
    console.log(`[${requestId}] Checking session...`)
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.error(`[${requestId}] No session found`)
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated. Please sign in.',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 401 })
    }

    console.log(`[${requestId}] Session validated`)

    // Create a mock credential (simplified for demo)
    const mockCredential = {
      id: `credential-${Date.now()}`,
      type: 'DevPortfolioCredential',
      issuer: 'Proof of Dev Wave 3',
      issuedAt: new Date().toISOString(),
      subject: {
        did: developer,
        githubUsername,
        reputationScore: metrics.reputationScore,
        totalStars: metrics.totalStars,
        totalRepositories: metrics.totalRepositories,
        topLanguages: metrics.topLanguages
      }
    }

    const response: MintSimpleResponse = {
      success: true,
      developer: {
        address: developer,
        githubUsername,
        reputationScore: metrics.reputationScore,
        totalStars: metrics.totalStars,
        totalRepositories: metrics.totalRepositories,
        topLanguages: metrics.topLanguages
      },
      credential: mockCredential,
      timestamp: new Date().toISOString(),
      requestId,
      processingTime: Date.now() - startTime
    }

    console.log(`[${requestId}] === MINT SIMPLE SUCCESS ===`, {
      developer,
      githubUsername,
      credentialId: mockCredential.id,
      processingTime: response.processingTime
    })

    return NextResponse.json(response)
    
  } catch (error) {
    const err = error as unknown as { message?: string; stack?: string; constructor?: { name?: string } }
    console.error(`[${requestId}] === MINT SIMPLE ERROR ===`, error)
    console.error(`[${requestId}] Error message:`, err?.message)
    console.error(`[${requestId}] Error stack:`, err?.stack)
    
    return NextResponse.json({ 
      success: false,
      error: err?.message || 'Mint failed',
      details: err?.stack,
      type: err?.constructor?.name || 'Unknown',
      requestId,
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}