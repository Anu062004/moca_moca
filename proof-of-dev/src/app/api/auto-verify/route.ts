import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { 
  issueSkillCredential, 
  issueProjectCredential,
  CredentialResult 
} from '@/lib/airkit'
import { 
  SkillCredential, 
  ProjectCredential,
  CredentialFactory 
} from '@/lib/credential-schemas'

// Auto-verification system for GitHub and CI pipeline integration
// This system automatically issues credentials based on GitHub activity

export interface GitHubWebhookPayload {
  action: string
  repository: {
    id: number
    name: string
    full_name: string
    html_url: string
    owner: {
      login: string
      id: number
    }
  }
  sender: {
    login: string
    id: number
  }
  pull_request?: {
    number: number
    title: string
    body: string
    user: {
      login: string
    }
    head: {
      sha: string
    }
    base: {
      sha: string
    }
  }
  commits?: Array<{
    id: string
    message: string
    author: {
      name: string
      email: string
    }
    added: string[]
    removed: string[]
    modified: string[]
  }>
}

export interface AutoVerificationConfig {
  enabled: boolean
  skillThresholds: {
    commits: number
    linesOfCode: number
    projects: number
  }
  projectThresholds: {
    commits: number
    pullRequests: number
    issuesResolved: number
  }
  languages: string[]
  excludedRepos: string[]
}

export interface AutoVerificationResult {
  success: boolean
  credentialsIssued: CredentialResult[]
  metrics: {
    totalCommits: number
    totalLinesAdded: number
    totalLinesRemoved: number
    languages: Record<string, number>
    projects: string[]
  }
  error?: string
}

// GitHub webhook handler for automatic credential issuance
export async function POST(request: NextRequest) {
  try {
    const payload: GitHubWebhookPayload = await request.json()
    const { action, repository, sender, pull_request, commits } = payload

    // Only process push events and pull request events
    if (action !== 'opened' && action !== 'synchronize' && action !== 'closed') {
      return NextResponse.json({ message: 'Event not processed' })
    }

    const developerAddress = await getDeveloperAddress(sender.login)
    if (!developerAddress) {
      return NextResponse.json({ message: 'Developer not found' })
    }

    let result: AutoVerificationResult

    if (pull_request) {
      // Handle pull request events
      result = await processPullRequestEvent(
        developerAddress,
        repository,
        pull_request,
        sender
      )
    } else if (commits) {
      // Handle push events
      result = await processPushEvent(
        developerAddress,
        repository,
        commits,
        sender
      )
    } else {
      return NextResponse.json({ message: 'No relevant data to process' })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Auto-verification webhook error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process webhook' 
      },
      { status: 500 }
    )
  }
}

// Process pull request events
async function processPullRequestEvent(
  developerAddress: string,
  repository: GitHubWebhookPayload['repository'],
  pullRequest: GitHubWebhookPayload['pull_request'],
  sender: GitHubWebhookPayload['sender']
): Promise<AutoVerificationResult> {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    })

    // Get pull request details
    const { data: prData } = await octokit.pulls.get({
      owner: repository.owner.login,
      repo: repository.name,
      pull_number: pullRequest.number
    })

    // Get commit details
    const { data: commits } = await octokit.pulls.listCommits({
      owner: repository.owner.login,
      repo: repository.name,
      pull_number: pullRequest.number
    })

    // Calculate contribution metrics
    const contributionMetrics = {
      commits: commits.length,
      linesAdded: prData.additions,
      linesRemoved: prData.deletions,
      pullRequests: 1,
      issuesResolved: 0 // Would need to parse PR body for issue references
    }

    // Issue project credential if thresholds are met
    const credentialsIssued: CredentialResult[] = []
    
    if (contributionMetrics.commits >= 5) {
      const projectCredential = await issueProjectCredential(developerAddress, {
        projectName: repository.name,
        projectUrl: repository.html_url,
        role: 'Contributor',
        contributionType: 'Code',
        contributionMetrics
      })
      
      credentialsIssued.push(projectCredential)
    }

    return {
      success: true,
      credentialsIssued,
      metrics: {
        totalCommits: contributionMetrics.commits,
        totalLinesAdded: contributionMetrics.linesAdded,
        totalLinesRemoved: contributionMetrics.linesRemoved,
        languages: {}, // Would need to analyze file changes
        projects: [repository.name]
      }
    }
  } catch (error) {
    console.error('Error processing pull request:', error)
    return {
      success: false,
      credentialsIssued: [],
      metrics: {
        totalCommits: 0,
        totalLinesAdded: 0,
        totalLinesRemoved: 0,
        languages: {},
        projects: []
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Process push events
async function processPushEvent(
  developerAddress: string,
  repository: GitHubWebhookPayload['repository'],
  commits: GitHubWebhookPayload['commits'],
  sender: GitHubWebhookPayload['sender']
): Promise<AutoVerificationResult> {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    })

    // Get repository languages
    const { data: languages } = await octokit.repos.listLanguages({
      owner: repository.owner.login,
      repo: repository.name
    })

    // Calculate metrics
    const totalCommits = commits.length
    const totalLinesAdded = commits.reduce((sum, commit) => 
      sum + commit.added.length, 0
    )
    const totalLinesRemoved = commits.reduce((sum, commit) => 
      sum + commit.removed.length, 0
    )

    const credentialsIssued: CredentialResult[] = []

    // Issue skill credentials for languages
    for (const [language, bytes] of Object.entries(languages)) {
      if (bytes > 10000) { // Threshold for significant contribution
        const skillCredential = await issueSkillCredential(developerAddress, {
          skillName: language,
          proficiencyLevel: calculateProficiencyLevel(bytes, totalCommits),
          evidence: {
            repositories: [repository.full_name],
            commits: totalCommits,
            linesOfCode: bytes,
            projects: [repository.name]
          }
        })
        
        credentialsIssued.push(skillCredential)
      }
    }

    return {
      success: true,
      credentialsIssued,
      metrics: {
        totalCommits,
        totalLinesAdded,
        totalLinesRemoved,
        languages,
        projects: [repository.name]
      }
    }
  } catch (error) {
    console.error('Error processing push event:', error)
    return {
      success: false,
      credentialsIssued: [],
      metrics: {
        totalCommits: 0,
        totalLinesAdded: 0,
        totalLinesRemoved: 0,
        languages: {},
        projects: []
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Calculate proficiency level based on contribution metrics
function calculateProficiencyLevel(bytes: number, commits: number): "Beginner" | "Intermediate" | "Advanced" | "Expert" {
  const score = (bytes / 1000) + (commits * 10)
  
  if (score >= 1000) return "Expert"
  if (score >= 500) return "Advanced"
  if (score >= 100) return "Intermediate"
  return "Beginner"
}

// Get developer address from GitHub username
async function getDeveloperAddress(githubUsername: string): Promise<string | null> {
  try {
    // In a real implementation, this would query a database
    // For now, we'll use a mock mapping
    const mockMappings: Record<string, string> = {
      'octocat': '0x1234567890123456789012345678901234567890',
      'developer': '0x0987654321098765432109876543210987654321'
    }
    
    return mockMappings[githubUsername] || null
  } catch (error) {
    console.error('Error getting developer address:', error)
    return null
  }
}

// CI Pipeline integration endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      developerAddress, 
      projectName, 
      projectUrl, 
      testResults, 
      buildStatus,
      coverage,
      metrics 
    } = body

    if (!developerAddress || !projectName) {
      return NextResponse.json(
        { error: 'Developer address and project name are required' },
        { status: 400 }
      )
    }

    const credentialsIssued: CredentialResult[] = []

    // Issue project credential for successful CI runs
    if (buildStatus === 'success' && testResults.passed > 0) {
      const projectCredential = await issueProjectCredential(developerAddress, {
        projectName,
        projectUrl: projectUrl || '',
        role: 'Contributor',
        contributionType: 'Testing',
        contributionMetrics: {
          commits: metrics.commits || 0,
          linesAdded: metrics.linesAdded || 0,
          linesRemoved: metrics.linesRemoved || 0,
          pullRequests: metrics.pullRequests || 0,
          issuesResolved: testResults.passed || 0
        }
      })
      
      credentialsIssued.push(projectCredential)
    }

    // Issue skill credential for high test coverage
    if (coverage && coverage.percentage >= 80) {
      const skillCredential = await issueSkillCredential(developerAddress, {
        skillName: 'Test-Driven Development',
        proficiencyLevel: coverage.percentage >= 95 ? 'Expert' : 'Advanced',
        evidence: {
          repositories: [projectName],
          commits: metrics.commits || 0,
          linesOfCode: coverage.linesCovered || 0,
          projects: [projectName]
        }
      })
      
      credentialsIssued.push(skillCredential)
    }

    return NextResponse.json({
      success: true,
      credentialsIssued,
      metrics: {
        buildStatus,
        testResults,
        coverage,
        projectName
      }
    })
  } catch (error) {
    console.error('CI integration error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process CI integration' 
      },
      { status: 500 }
    )
  }
}

// Configuration endpoint for auto-verification settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'config') {
      const config: AutoVerificationConfig = {
        enabled: true,
        skillThresholds: {
          commits: 10,
          linesOfCode: 1000,
          projects: 1
        },
        projectThresholds: {
          commits: 5,
          pullRequests: 2,
          issuesResolved: 1
        },
        languages: ['JavaScript', 'TypeScript', 'Python', 'Solidity', 'Rust'],
        excludedRepos: ['test-repo', 'demo-repo']
      }

      return NextResponse.json({
        success: true,
        config
      })
    }

    // Return webhook endpoints and documentation
    return NextResponse.json({
      success: true,
      endpoints: {
        webhook: 'POST /api/auto-verify',
        ciIntegration: 'PUT /api/auto-verify',
        config: 'GET /api/auto-verify?action=config'
      },
      documentation: {
        githubWebhook: 'Configure GitHub webhook to POST to /api/auto-verify',
        ciIntegration: 'Send CI results to PUT /api/auto-verify',
        supportedEvents: ['push', 'pull_request.opened', 'pull_request.closed']
      }
    })
  } catch (error) {
    console.error('Auto-verification config error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get configuration' 
      },
      { status: 500 }
    )
  }
}
