import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AirKitService } from '@/lib/airkit'

interface RevokeCredentialRequest {
  credentialId: string
  reason?: string
  revokerDid?: string
}

interface RevokeCredentialResponse {
  success: boolean
  revoked?: boolean
  error?: string
  requestId: string
  processingTime: number
}

interface CheckRevocationRequest {
  credentialId: string
}

interface CheckRevocationResponse {
  success: boolean
  revoked?: boolean
  revocationReason?: string
  revokedAt?: string
  error?: string
  requestId: string
  processingTime: number
}

/**
 * Revoke a credential
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] === REVOKE CREDENTIAL API CALLED ===`)
    
    // Parse and validate request body
    let body: RevokeCredentialRequest
    try {
      body = await request.json()
      console.log(`[${requestId}] Request body:`, { 
        credentialId: body.credentialId,
        reason: body.reason,
        revokerDid: body.revokerDid
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

    const { credentialId, reason, revokerDid } = body

    // Validate input
    if (!credentialId) {
      console.error(`[${requestId}] Missing credential ID`)
      return NextResponse.json({ 
        success: false,
        error: 'Missing required field: credentialId',
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

    // Revoke the credential
    console.log(`[${requestId}] Revoking credential: ${credentialId}`)
    let revoked: boolean
    try {
      const revokeResult = await airService.revokeCredential(
        credentialId,
        {
          reason: reason || 'Credential revoked by issuer',
          revokerDid: revokerDid || `did:moca:issuer:${process.env.AIRKIT_PARTNER_ID}`
        }
      )
      
      if (!revokeResult.success) {
        throw new Error(revokeResult.error || 'Failed to revoke credential')
      }
      
      revoked = revokeResult.revoked
      console.log(`[${requestId}] Credential revocation result:`, revoked)
    } catch (revokeError) {
      console.error(`[${requestId}] Credential revocation failed:`, revokeError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to revoke credential',
        details: revokeError instanceof Error ? revokeError.message : 'Unknown error',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    const response: RevokeCredentialResponse = {
      success: true,
      revoked,
      requestId,
      processingTime: Date.now() - startTime
    }

    console.log(`[${requestId}] === CREDENTIAL REVOKED SUCCESSFULLY ===`, {
      credentialId,
      revoked,
      reason,
      processingTime: response.processingTime
    })

    return NextResponse.json(response)
    
  } catch (error) {
    const err = error as unknown as { message?: string; stack?: string; constructor?: { name?: string } }
    console.error(`[${requestId}] === REVOKE CREDENTIAL ERROR ===`, error)
    console.error(`[${requestId}] Error message:`, err?.message)
    console.error(`[${requestId}] Error stack:`, err?.stack)
    
    return NextResponse.json({ 
      success: false,
      error: err?.message || 'Credential revocation failed',
      details: err?.stack,
      type: err?.constructor?.name || 'Unknown',
      requestId,
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}

/**
 * Check if a credential is revoked
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] === CHECK REVOCATION API CALLED ===`)
    
    const { searchParams } = new URL(request.url)
    const credentialId = searchParams.get('credentialId')

    // Validate input
    if (!credentialId) {
      console.error(`[${requestId}] Missing credential ID`)
      return NextResponse.json({ 
        success: false,
        error: 'Missing required parameter: credentialId',
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

    // Check revocation status
    console.log(`[${requestId}] Checking revocation status for: ${credentialId}`)
    let revocationStatus
    try {
      const checkResult = await airService.checkRevocation(credentialId)
      
      if (!checkResult.success) {
        throw new Error(checkResult.error || 'Failed to check revocation status')
      }
      
      revocationStatus = checkResult
      console.log(`[${requestId}] Revocation status:`, revocationStatus)
    } catch (checkError) {
      console.error(`[${requestId}] Revocation check failed:`, checkError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to check revocation status',
        details: checkError instanceof Error ? checkError.message : 'Unknown error',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    const response: CheckRevocationResponse = {
      success: true,
      revoked: revocationStatus.revoked,
      revocationReason: revocationStatus.reason,
      revokedAt: revocationStatus.revokedAt,
      requestId,
      processingTime: Date.now() - startTime
    }

    console.log(`[${requestId}] === REVOCATION CHECK COMPLETED ===`, {
      credentialId,
      revoked: revocationStatus.revoked,
      processingTime: response.processingTime
    })

    return NextResponse.json(response)
    
  } catch (error) {
    const err = error as unknown as { message?: string; stack?: string; constructor?: { name?: string } }
    console.error(`[${requestId}] === CHECK REVOCATION ERROR ===`, error)
    console.error(`[${requestId}] Error message:`, err?.message)
    console.error(`[${requestId}] Error stack:`, err?.stack)
    
    return NextResponse.json({ 
      success: false,
      error: err?.message || 'Revocation check failed',
      details: err?.stack,
      type: err?.constructor?.name || 'Unknown',
      requestId,
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}
