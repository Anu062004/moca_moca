import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AirKitService } from '@/lib/airkit'
import { DevPortfolioCredentialFactory, DevPortfolioCredential } from '@/lib/dev-portfolio-credential'

interface IssueCredentialRequest {
  credentialType: 'DevPortfolio' | 'Skill' | 'Project' | 'CommunityBadge'
  subjectDid: string
  credentialData: any
  selectiveDisclosure?: {
    fields: string[]
    predicates?: any
  }
}

interface IssueCredentialResponse {
  success: boolean
  credential?: DevPortfolioCredential
  error?: string
  requestId: string
  processingTime: number
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] === ISSUE CREDENTIAL API CALLED ===`)
    
    // Parse and validate request body
    let body: IssueCredentialRequest
    try {
      body = await request.json()
      console.log(`[${requestId}] Request body:`, { 
        credentialType: body.credentialType,
        subjectDid: body.subjectDid,
        hasCredentialData: !!body.credentialData
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

    const { credentialType, subjectDid, credentialData, selectiveDisclosure } = body

    // Validate input
    if (!credentialType || !subjectDid || !credentialData) {
      console.error(`[${requestId}] Missing required fields`)
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: credentialType, subjectDid, credentialData',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    // Validate credential type
    const validTypes = ['DevPortfolio', 'Skill', 'Project', 'CommunityBadge']
    if (!validTypes.includes(credentialType)) {
      console.error(`[${requestId}] Invalid credential type:`, credentialType)
      return NextResponse.json({ 
        success: false,
        error: `Invalid credential type. Must be one of: ${validTypes.join(', ')}`,
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    // Validate DID format
    if (!subjectDid.startsWith('did:')) {
      console.error(`[${requestId}] Invalid DID format:`, subjectDid)
      return NextResponse.json({ 
        success: false,
        error: 'Invalid DID format. Must start with "did:"',
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

    // Issue credential based on type
    console.log(`[${requestId}] Issuing ${credentialType} credential...`)
    let credential: DevPortfolioCredential
    
    try {
      switch (credentialType) {
        case 'DevPortfolio':
          // Create DevPortfolioCredential using factory
          const issuerDid = `did:moca:issuer:${process.env.AIRKIT_PARTNER_ID}`
          credential = DevPortfolioCredentialFactory.create(
            credentialData,
            issuerDid,
            subjectDid
          )
          
          // Issue through AIR Kit
          const issueResult = await airService.issueCredential(
            'DevPortfolioCredential',
            credential.credentialSubject,
            {
              selectiveDisclosure: selectiveDisclosure?.fields || [],
              predicates: selectiveDisclosure?.predicates || {}
            }
          )
          
          if (!issueResult.success) {
            throw new Error(issueResult.error || 'Failed to issue credential')
          }
          
          // Update credential with AIR Kit proof
          credential.proof = issueResult.proof
          break
          
        case 'Skill':
          const skillResult = await airService.issueCredential(
            'SkillCredential',
            {
              id: subjectDid,
              type: 'Skill',
              skill: credentialData.skill,
              level: credentialData.level,
              verifiedAt: new Date().toISOString(),
              evidence: credentialData.evidence
            },
            {
              selectiveDisclosure: selectiveDisclosure?.fields || [],
              predicates: selectiveDisclosure?.predicates || {}
            }
          )
          
          if (!skillResult.success) {
            throw new Error(skillResult.error || 'Failed to issue skill credential')
          }
          
          credential = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'SkillCredential'],
            id: `https://moca.network/credentials/skill/${Date.now()}`,
            issuer: { id: `did:moca:issuer:${process.env.AIRKIT_PARTNER_ID}` },
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
              id: subjectDid,
              type: 'Skill',
              skill: credentialData.skill,
              level: credentialData.level,
              verifiedAt: new Date().toISOString()
            },
            proof: skillResult.proof
          } as DevPortfolioCredential
          break
          
        case 'Project':
          const projectResult = await airService.issueCredential(
            'ProjectCredential',
            {
              id: subjectDid,
              type: 'Project',
              projectName: credentialData.projectName,
              description: credentialData.description,
              url: credentialData.url,
              verifiedAt: new Date().toISOString()
            },
            {
              selectiveDisclosure: selectiveDisclosure?.fields || [],
              predicates: selectiveDisclosure?.predicates || {}
            }
          )
          
          if (!projectResult.success) {
            throw new Error(projectResult.error || 'Failed to issue project credential')
          }
          
          credential = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'ProjectCredential'],
            id: `https://moca.network/credentials/project/${Date.now()}`,
            issuer: { id: `did:moca:issuer:${process.env.AIRKIT_PARTNER_ID}` },
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
              id: subjectDid,
              type: 'Project',
              projectName: credentialData.projectName,
              description: credentialData.description,
              url: credentialData.url,
              verifiedAt: new Date().toISOString()
            },
            proof: projectResult.proof
          } as DevPortfolioCredential
          break
          
        case 'CommunityBadge':
          const badgeResult = await airService.issueCredential(
            'CommunityBadgeCredential',
            {
              id: subjectDid,
              type: 'CommunityBadge',
              badgeName: credentialData.badgeName,
              community: credentialData.community,
              earnedAt: new Date().toISOString()
            },
            {
              selectiveDisclosure: selectiveDisclosure?.fields || [],
              predicates: selectiveDisclosure?.predicates || {}
            }
          )
          
          if (!badgeResult.success) {
            throw new Error(badgeResult.error || 'Failed to issue community badge')
          }
          
          credential = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'CommunityBadgeCredential'],
            id: `https://moca.network/credentials/badge/${Date.now()}`,
            issuer: { id: `did:moca:issuer:${process.env.AIRKIT_PARTNER_ID}` },
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
              id: subjectDid,
              type: 'CommunityBadge',
              badgeName: credentialData.badgeName,
              community: credentialData.community,
              earnedAt: new Date().toISOString()
            },
            proof: badgeResult.proof
          } as DevPortfolioCredential
          break
          
        default:
          throw new Error(`Unsupported credential type: ${credentialType}`)
      }
      
      console.log(`[${requestId}] Credential issued successfully`)
    } catch (issueError) {
      console.error(`[${requestId}] Credential issuance failed:`, issueError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to issue credential',
        details: issueError instanceof Error ? issueError.message : 'Unknown error',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    const response: IssueCredentialResponse = {
      success: true,
      credential,
      requestId,
      processingTime: Date.now() - startTime
    }

    console.log(`[${requestId}] === CREDENTIAL ISSUED SUCCESSFULLY ===`, {
      credentialType,
      subjectDid,
      credentialId: credential.id,
      processingTime: response.processingTime
    })

    return NextResponse.json(response)
    
  } catch (error) {
    const err = error as unknown as { message?: string; stack?: string; constructor?: { name?: string } }
    console.error(`[${requestId}] === ISSUE CREDENTIAL ERROR ===`, error)
    console.error(`[${requestId}] Error message:`, err?.message)
    console.error(`[${requestId}] Error stack:`, err?.stack)
    
    return NextResponse.json({ 
      success: false,
      error: err?.message || 'Credential issuance failed',
      details: err?.stack,
      type: err?.constructor?.name || 'Unknown',
      requestId,
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}
