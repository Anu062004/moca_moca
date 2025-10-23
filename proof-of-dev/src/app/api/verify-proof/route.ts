import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AirKitService } from '@/lib/airkit'
import { DevPortfolioCredential, SelectiveDisclosurePredicate } from '@/lib/dev-portfolio-credential'

interface CreateProofRequest {
  credentialId: string
  selectiveDisclosure: {
    fields: string[]
    predicates: SelectiveDisclosurePredicate[]
  }
  verifierDid?: string
}

interface CreateProofResponse {
  success: boolean
  proof?: any
  error?: string
  requestId: string
  processingTime: number
}

interface VerifyProofRequest {
  proof: any
  credential: DevPortfolioCredential
  predicates: SelectiveDisclosurePredicate[]
}

interface VerifyProofResponse {
  success: boolean
  verified: boolean
  error?: string
  requestId: string
  processingTime: number
}

/**
 * Create a selective disclosure proof for a credential
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] === CREATE PROOF API CALLED ===`)
    
    // Parse and validate request body
    let body: CreateProofRequest
    try {
      body = await request.json()
      console.log(`[${requestId}] Request body:`, { 
        credentialId: body.credentialId,
        fields: body.selectiveDisclosure?.fields,
        predicates: body.selectiveDisclosure?.predicates
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

    const { credentialId, selectiveDisclosure, verifierDid } = body

    // Validate input
    if (!credentialId || !selectiveDisclosure) {
      console.error(`[${requestId}] Missing required fields`)
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: credentialId, selectiveDisclosure',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    if (!selectiveDisclosure.fields || !Array.isArray(selectiveDisclosure.fields)) {
      console.error(`[${requestId}] Invalid selective disclosure fields`)
      return NextResponse.json({ 
        success: false,
        error: 'selectiveDisclosure.fields must be an array',
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

    // Validate AIR Kit configuration
    if (!process.env.AIRKIT_PARTNER_ID || !process.env.AIRKIT_API_KEY) {
      console.error(`[${requestId}] AIR Kit not configured`)
      return NextResponse.json({ 
        success: false,
        error: 'AIR Kit not configured. Please set AIRKIT_PARTNER_ID and AIRKIT_API_KEY.',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    console.log(`[${requestId}] Session validated, AIR Kit configured`)

    // Create AIR Kit service
    console.log(`[${requestId}] Creating AIR Kit service...`)
    let airService: AirKitService
    try {
      airService = new AirKitService()
      console.log(`[${requestId}] AIR Kit service created successfully`)
    } catch (airKitError) {
      console.error(`[${requestId}] Failed to create AIR Kit service:`, airKitError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to initialize AIR Kit service',
        details: airKitError instanceof Error ? airKitError.message : 'Unknown error',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    // Create selective disclosure proof
    console.log(`[${requestId}] Creating selective disclosure proof...`)
    let proof
    try {
      const createProofResult = await airService.createProof(
        credentialId,
        {
          fields: selectiveDisclosure.fields,
          predicates: selectiveDisclosure.predicates || []
        },
        verifierDid
      )
      
      if (!createProofResult.success) {
        throw new Error(createProofResult.error || 'Failed to create proof')
      }
      
      proof = createProofResult.proof
      console.log(`[${requestId}] Proof created successfully`)
    } catch (proofError) {
      console.error(`[${requestId}] Proof creation failed:`, proofError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create selective disclosure proof',
        details: proofError instanceof Error ? proofError.message : 'Unknown error',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    const response: CreateProofResponse = {
      success: true,
      proof,
      requestId,
      processingTime: Date.now() - startTime
    }

    console.log(`[${requestId}] === PROOF CREATED SUCCESSFULLY ===`, {
      credentialId,
      fields: selectiveDisclosure.fields,
      predicates: selectiveDisclosure.predicates?.length || 0,
      processingTime: response.processingTime
    })

    return NextResponse.json(response)
    
  } catch (error) {
    const err = error as unknown as { message?: string; stack?: string; constructor?: { name?: string } }
    console.error(`[${requestId}] === CREATE PROOF ERROR ===`, error)
    console.error(`[${requestId}] Error message:`, err?.message)
    console.error(`[${requestId}] Error stack:`, err?.stack)
    
    return NextResponse.json({ 
      success: false,
      error: err?.message || 'Proof creation failed',
      details: err?.stack,
      type: err?.constructor?.name || 'Unknown',
      requestId,
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}

/**
 * Verify a selective disclosure proof
 */
export async function PUT(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] === VERIFY PROOF API CALLED ===`)
    
    // Parse and validate request body
    let body: VerifyProofRequest
    try {
      body = await request.json()
      console.log(`[${requestId}] Request body:`, { 
        hasProof: !!body.proof,
        hasCredential: !!body.credential,
        predicates: body.predicates?.length || 0
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

    const { proof, credential, predicates } = body

    // Validate input
    if (!proof || !credential || !predicates) {
      console.error(`[${requestId}] Missing required fields`)
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: proof, credential, predicates',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    // Validate AIR Kit configuration
    if (!process.env.AIRKIT_PARTNER_ID || !process.env.AIRKIT_API_KEY) {
      console.error(`[${requestId}] AIR Kit not configured`)
      return NextResponse.json({ 
        success: false,
        error: 'AIR Kit not configured. Please set AIRKIT_PARTNER_ID and AIRKIT_API_KEY.',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    console.log(`[${requestId}] AIR Kit configuration validated`)

    // Create AIR Kit service
    console.log(`[${requestId}] Creating AIR Kit service...`)
    let airService: AirKitService
    try {
      airService = new AirKitService()
      console.log(`[${requestId}] AIR Kit service created successfully`)
    } catch (airKitError) {
      console.error(`[${requestId}] Failed to create AIR Kit service:`, airKitError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to initialize AIR Kit service',
        details: airKitError instanceof Error ? airKitError.message : 'Unknown error',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    // Verify the proof
    console.log(`[${requestId}] Verifying proof...`)
    let verified: boolean
    try {
      const verifyResult = await airService.verifyProof(
        proof,
        credential,
        predicates
      )
      
      if (!verifyResult.success) {
        throw new Error(verifyResult.error || 'Failed to verify proof')
      }
      
      verified = verifyResult.verified
      console.log(`[${requestId}] Proof verification result:`, verified)
    } catch (verifyError) {
      console.error(`[${requestId}] Proof verification failed:`, verifyError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to verify proof',
        details: verifyError instanceof Error ? verifyError.message : 'Unknown error',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    const response: VerifyProofResponse = {
      success: true,
      verified,
      requestId,
      processingTime: Date.now() - startTime
    }

    console.log(`[${requestId}] === PROOF VERIFICATION COMPLETED ===`, {
      verified,
      predicates: predicates.length,
      processingTime: response.processingTime
    })

    return NextResponse.json(response)
    
  } catch (error) {
    const err = error as unknown as { message?: string; stack?: string; constructor?: { name?: string } }
    console.error(`[${requestId}] === VERIFY PROOF ERROR ===`, error)
    console.error(`[${requestId}] Error message:`, err?.message)
    console.error(`[${requestId}] Error stack:`, err?.stack)
    
    return NextResponse.json({ 
      success: false,
      error: err?.message || 'Proof verification failed',
      details: err?.stack,
      type: err?.constructor?.name || 'Unknown',
      requestId,
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}
