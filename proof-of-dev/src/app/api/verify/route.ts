import { NextRequest, NextResponse } from 'next/server'
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
  verifyCredential, 
  getCredentialsByType, 
  getDeveloperReputation,
  DeveloperIdentity,
  SkillGraph 
} from '@/lib/airkit'

// Verification API for hiring platforms and communities
// This API allows external platforms to verify developer credentials

export interface VerificationRequest {
  address: string
  credentialTypes?: string[]
  includeReputation?: boolean
  includeSkillGraph?: boolean
  selectiveDisclosure?: {
    fields: string[]
    zkProof?: boolean
  }
}

export interface VerificationResponse {
  success: boolean
  developer: {
    address: string
    verified: boolean
    trustScore: number
    credentials: VerifiableCredential[]
    reputation?: {
      trustScore: number
      skillGraph: SkillGraph
      credentials: VerifiableCredential[]
    }
  }
  verificationResults: {
    credentialId: string
    valid: boolean
    expired: boolean
    verifiedAt: string
  }[]
  error?: string
}

export interface SelectiveDisclosureRequest {
  address: string
  requestedFields: string[]
  zkProof: boolean
  verifierId: string
}

export interface SelectiveDisclosureResponse {
  success: boolean
  disclosedData: {
    field: string
    value: any
    proof?: string
  }[]
  error?: string
}

// Main verification endpoint
export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json()
    const { address, credentialTypes, includeReputation, includeSkillGraph } = body

    if (!address) {
      return NextResponse.json(
        { error: 'Developer address is required' },
        { status: 400 }
      )
    }

    // Get developer credentials
    const credentials = credentialTypes 
      ? await Promise.all(
          credentialTypes.map(type => getCredentialsByType(address, type))
        ).then(results => results.flat())
      : await getCredentialsByType(address, 'all')

    // Verify each credential
    const verificationResults = await Promise.all(
      credentials.map(async (credential) => {
        const isValid = CredentialValidator.validateCredentialStructure(credential)
        const isExpired = CredentialValidator.isExpired(credential)
        const isVerified = await verifyCredential(credential.id)

        return {
          credentialId: credential.id,
          valid: isValid && !isExpired && isVerified,
          expired: isExpired,
          verifiedAt: new Date().toISOString()
        }
      })
    )

    // Get reputation data if requested
    let reputation
    if (includeReputation || includeSkillGraph) {
      reputation = await getDeveloperReputation(address)
    }

    const response: VerificationResponse = {
      success: true,
      developer: {
        address,
        verified: verificationResults.some(result => result.valid),
        trustScore: reputation?.trustScore || 0,
        credentials,
        ...(reputation && { reputation })
      },
      verificationResults
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Verification API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to verify developer credentials' 
      },
      { status: 500 }
    )
  }
}

// Selective disclosure endpoint for privacy-preserving verification
export async function PUT(request: NextRequest) {
  try {
    const body: SelectiveDisclosureRequest = await request.json()
    const { address, requestedFields, zkProof, verifierId } = body

    if (!address || !requestedFields.length) {
      return NextResponse.json(
        { error: 'Address and requested fields are required' },
        { status: 400 }
      )
    }

    // Get developer credentials
    const credentials = await getCredentialsByType(address, 'all')
    
    // Filter and disclose only requested fields
    const disclosedData = []
    
    for (const credential of credentials) {
      const credentialType = credential.type.find(type => type !== "VerifiableCredential")
      
      for (const field of requestedFields) {
        const value = (credential.credentialSubject as any)[field]
        if (value !== undefined) {
          disclosedData.push({
            field,
            value: zkProof ? `zk-proof-${field}` : value, // Mock ZK proof
            ...(zkProof && { proof: `zk-proof-${credential.id}-${field}` })
          })
        }
      }
    }

    const response: SelectiveDisclosureResponse = {
      success: true,
      disclosedData
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Selective disclosure API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process selective disclosure request' 
      },
      { status: 500 }
    )
  }
}

// Batch verification endpoint for multiple developers
export async function PATCH(request: NextRequest) {
  try {
    const body: { addresses: string[] } = await request.json()
    const { addresses } = body

    if (!addresses || !Array.isArray(addresses)) {
      return NextResponse.json(
        { error: 'Array of addresses is required' },
        { status: 400 }
      )
    }

    // Verify multiple developers in parallel
    const verificationPromises = addresses.map(async (address) => {
      try {
        const credentials = await getCredentialsByType(address, 'all')
        const reputation = await getDeveloperReputation(address)
        
        const verificationResults = await Promise.all(
          credentials.map(async (credential) => {
            const isValid = CredentialValidator.validateCredentialStructure(credential)
            const isExpired = CredentialValidator.isExpired(credential)
            const isVerified = await verifyCredential(credential.id)

            return {
              credentialId: credential.id,
              valid: isValid && !isExpired && isVerified,
              expired: isExpired,
              verifiedAt: new Date().toISOString()
            }
          })
        )

        return {
          address,
          success: true,
          developer: {
            address,
            verified: verificationResults.some(result => result.valid),
            trustScore: reputation.trustScore,
            credentials,
            reputation
          },
          verificationResults
        }
      } catch (error) {
        return {
          address,
          success: false,
          error: error instanceof Error ? error.message : 'Verification failed'
        }
      }
    })

    const results = await Promise.all(verificationPromises)

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Batch verification API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to verify developers' 
      },
      { status: 500 }
    )
  }
}

// Credential schema validation endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const credentialId = searchParams.get('credentialId')
    const address = searchParams.get('address')

    if (credentialId) {
      // Verify specific credential
      const isValid = await verifyCredential(credentialId)
      return NextResponse.json({
        success: true,
        credentialId,
        valid: isValid,
        verifiedAt: new Date().toISOString()
      })
    }

    if (address) {
      // Get all credentials for address
      const credentials = await getCredentialsByType(address, 'all')
      const reputation = await getDeveloperReputation(address)

      return NextResponse.json({
        success: true,
        developer: {
          address,
          verified: credentials.length > 0,
          trustScore: reputation.trustScore,
          credentials,
          reputation
        }
      })
    }

    // Return available credential schemas
    return NextResponse.json({
      success: true,
      schemas: [
        'DevPortfolioCredential',
        'SkillCredential', 
        'ProjectCredential',
        'CommunityBadgeCredential',
        'EndorsementCredential'
      ],
      endpoints: {
        verification: 'POST /api/verify',
        selectiveDisclosure: 'PUT /api/verify',
        batchVerification: 'PATCH /api/verify',
        schemaValidation: 'GET /api/verify'
      }
    })
  } catch (error) {
    console.error('Verification API GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process verification request' 
      },
      { status: 500 }
    )
  }
}
