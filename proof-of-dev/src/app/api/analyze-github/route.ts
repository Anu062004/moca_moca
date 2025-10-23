import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GitHubAnalyzer } from '@/lib/github-analyzer'

interface AnalyzeRequest {
  username: string
}

interface AnalyzeResponse {
  success: boolean
  metrics?: any
  error?: string
  requestId: string
  processingTime: number
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] === GITHUB ANALYSIS API CALLED ===`)
    
    // Parse and validate request body
    let body: AnalyzeRequest
    try {
      body = await request.json()
      console.log(`[${requestId}] Request body:`, { username: body.username })
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError)
      return NextResponse.json({ 
        success: false,
        error: 'Invalid JSON in request body',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    const { username } = body

    // Validate input
    if (!username || typeof username !== 'string') {
      console.error(`[${requestId}] Invalid username:`, username)
      return NextResponse.json({ 
        success: false,
        error: 'Username is required and must be a string',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    // Validate username format (basic GitHub username validation)
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      console.error(`[${requestId}] Invalid GitHub username format:`, username)
      return NextResponse.json({ 
        success: false,
        error: 'Invalid GitHub username format',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    // Check session and access token
    console.log(`[${requestId}] Checking session...`)
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.error(`[${requestId}] No session found`)
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated. Please sign in with GitHub.',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 401 })
    }

    if (!session.accessToken) {
      console.error(`[${requestId}] No access token in session`)
      return NextResponse.json({ 
        success: false,
        error: 'GitHub access token not available. Please re-authenticate.',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 401 })
    }

    console.log(`[${requestId}] Session validated, access token present`)

    // Check GitHub OAuth configuration
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      console.error(`[${requestId}] GitHub OAuth not configured`)
      return NextResponse.json({ 
        success: false,
        error: 'GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    console.log(`[${requestId}] GitHub OAuth configuration validated`)

    // Create GitHub analyzer with access token
    console.log(`[${requestId}] Creating GitHub analyzer...`)
    let analyzer: GitHubAnalyzer
    try {
      analyzer = new GitHubAnalyzer(session.accessToken)
      console.log(`[${requestId}] GitHub analyzer created successfully`)
    } catch (analyzerError) {
      console.error(`[${requestId}] Failed to create GitHub analyzer:`, analyzerError)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to initialize GitHub analyzer',
        details: analyzerError instanceof Error ? analyzerError.message : 'Unknown error',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    // Analyze the developer
    console.log(`[${requestId}] Analyzing developer: ${username}`)
    let metrics
    try {
      metrics = await analyzer.analyzeDeveloper(username)
      console.log(`[${requestId}] Analysis completed successfully`)
    } catch (analysisError) {
      console.error(`[${requestId}] GitHub analysis failed:`, analysisError)
      
      // Handle specific GitHub API errors
      if (analysisError instanceof Error) {
        if (analysisError.message.includes('404')) {
          return NextResponse.json({ 
            success: false,
            error: `GitHub user '${username}' not found`,
            requestId,
            processingTime: Date.now() - startTime
          }, { status: 404 })
        }
        
        if (analysisError.message.includes('403') || analysisError.message.includes('rate limit')) {
          return NextResponse.json({ 
            success: false,
            error: 'GitHub API rate limit exceeded. Please try again later.',
            requestId,
            processingTime: Date.now() - startTime
          }, { status: 429 })
        }
        
        if (analysisError.message.includes('401')) {
          return NextResponse.json({ 
            success: false,
            error: 'GitHub authentication failed. Please re-authenticate.',
            requestId,
            processingTime: Date.now() - startTime
          }, { status: 401 })
        }
      }
      
      return NextResponse.json({ 
        success: false,
        error: 'Failed to analyze GitHub profile',
        details: analysisError instanceof Error ? analysisError.message : 'Unknown error',
        requestId,
        processingTime: Date.now() - startTime
      }, { status: 500 })
    }

    const response: AnalyzeResponse = {
      success: true,
      metrics,
      requestId,
      processingTime: Date.now() - startTime
    }

    console.log(`[${requestId}] === ANALYSIS SUCCESS ===`, {
      username,
      metrics: {
        reputationScore: metrics.reputationScore,
        totalRepositories: metrics.totalRepositories,
        totalStars: metrics.totalStars,
        followers: metrics.followers
      },
      processingTime: response.processingTime
    })

    return NextResponse.json(response)
    
  } catch (error) {
    const err = error as unknown as { message?: string; stack?: string; constructor?: { name?: string } }
    console.error(`[${requestId}] === ANALYSIS ERROR ===`, error)
    console.error(`[${requestId}] Error message:`, err?.message)
    console.error(`[${requestId}] Error stack:`, err?.stack)
    
    return NextResponse.json({ 
      success: false,
      error: err?.message || 'Analysis failed',
      details: err?.stack,
      type: err?.constructor?.name || 'Unknown',
      requestId,
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}