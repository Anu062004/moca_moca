import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GitHubAnalyzer } from '@/lib/github-analyzer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username } = await request.json()
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const analyzer = new GitHubAnalyzer(session.accessToken)
    const metrics = await analyzer.analyzeDeveloper(username)

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('GitHub analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze GitHub profile' },
      { status: 500 }
    )
  }
}
