import { NextRequest, NextResponse } from 'next/server'
import { mintDeveloperBadge } from '@/lib/airkit'

// Simplified mint API that works without blockchain setup
export async function POST(req: NextRequest) {
  try {
    console.log('=== SIMPLIFIED MINT API CALLED ===')
    
    const body = await req.json()
    console.log('Request body:', body)
    
    const { developer, metrics, githubUsername } = body as {
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

    // Validate input parameters
    if (!developer || !metrics || !githubUsername) {
      console.error('Missing parameters:', { developer: !!developer, metrics: !!metrics, githubUsername: !!githubUsername })
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    console.log('Parameters validated successfully')

    // Mint AIR Kit credential (this works without blockchain)
    console.log('Starting AIR Kit credential minting...')
    const airKitResult = await mintDeveloperBadge(developer, {
      username: githubUsername,
      reputationScore: metrics.reputationScore,
      totalStars: metrics.totalStars,
      totalRepositories: metrics.totalRepositories,
    })

    console.log('AIR Kit credential result:', airKitResult)

    if (!airKitResult.success) {
      return NextResponse.json({ 
        error: 'Failed to mint AIR Kit credential',
        details: airKitResult.error
      }, { status: 500 })
    }

    // Return success response with AIR Kit credential
    const response = {
      success: true,
      message: 'Credential minted successfully!',
      credential: airKitResult.credential,
      developer: {
        address: developer,
        githubUsername,
        reputationScore: metrics.reputationScore,
        totalStars: metrics.totalStars,
        totalRepositories: metrics.totalRepositories,
        topLanguages: metrics.topLanguages
      },
      airKitCredential: airKitResult.credential,
      timestamp: new Date().toISOString()
    }

    console.log('=== MINT SUCCESS ===', response)
    return NextResponse.json(response)
    
  } catch (e) {
    const err = e as unknown as { message?: string; stack?: string; constructor?: { name?: string } }
    console.error('=== MINT ERROR ===', e)
    console.error('Error message:', err?.message)
    console.error('Error stack:', err?.stack)
    
    return NextResponse.json({ 
      error: err?.message || 'Mint failed',
      details: err?.stack,
      type: err?.constructor?.name || 'Unknown'
    }, { status: 500 })
  }
}
