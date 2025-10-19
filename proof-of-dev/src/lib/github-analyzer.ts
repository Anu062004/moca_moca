import { Octokit } from '@octokit/rest'

export interface DeveloperMetrics {
  totalCommits: number
  totalRepositories: number
  totalStars: number
  totalForks: number
  languages: Record<string, number>
  organizations: string[]
  contributions: number
  followers: number
  following: number
  accountAge: number
  recentActivity: number
  reputationScore: number
}

export class GitHubAnalyzer {
  private octokit: Octokit

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken
    })
  }

  async analyzeDeveloper(username: string): Promise<DeveloperMetrics> {
    try {
      // Get user profile
      const { data: user } = await this.octokit.users.getByUsername({ username })
      
      // Get user repositories
      const { data: repos } = await this.octokit.repos.listForUser({ 
        username,
        per_page: 100,
        sort: 'updated'
      })

      // Get user organizations
      const { data: orgs } = await this.octokit.orgs.listForUser({ username })

      // Calculate metrics
      const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0)
      const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count ?? 0), 0)
      
      // Analyze languages
      const languages: Record<string, number> = {}
      for (const repo of repos) {
        try {
          const { data: repoLanguages } = await this.octokit.repos.listLanguages({
            owner: username,
            repo: repo.name
          })
          
          Object.entries(repoLanguages).forEach(([lang, bytes]) => {
            languages[lang] = (languages[lang] || 0) + bytes
          })
        } catch (error) {
          // Skip private repos or repos with no language data
          continue
        }
      }

      // Calculate account age in days
      const accountAge = Math.floor(
        (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )

      // Calculate recent activity (commits in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      let recentActivity = 0
      for (const repo of repos.slice(0, 10)) { // Check last 10 repos
        try {
          const { data: commits } = await this.octokit.repos.listCommits({
            owner: username,
            repo: repo.name,
            since: thirtyDaysAgo.toISOString(),
            per_page: 100
          })
          recentActivity += commits.length
        } catch (error) {
          continue
        }
      }

      // Calculate reputation score
      const reputationScore = this.calculateReputationScore({
        totalCommits: user.public_repos * 10, // Estimate
        totalRepositories: user.public_repos,
        totalStars,
        totalForks,
        followers: user.followers,
        accountAge,
        recentActivity
      })

      return {
        totalCommits: user.public_repos * 10, // Estimate
        totalRepositories: user.public_repos,
        totalStars,
        totalForks,
        languages,
        organizations: orgs.map(org => org.login),
        contributions: user.public_repos,
        followers: user.followers,
        following: user.following,
        accountAge,
        recentActivity,
        reputationScore
      }
    } catch (error) {
      console.error('Error analyzing developer:', error)
      throw new Error('Failed to analyze developer profile')
    }
  }

  private calculateReputationScore(metrics: Partial<DeveloperMetrics>): number {
    let score = 0

    // Base score from followers (max 100 points)
    score += Math.min(metrics.followers || 0, 100)

    // Stars contribution (max 200 points)
    score += Math.min((metrics.totalStars || 0) * 0.1, 200)

    // Repository count (max 150 points)
    score += Math.min((metrics.totalRepositories || 0) * 2, 150)

    // Account age bonus (max 100 points)
    const ageYears = (metrics.accountAge || 0) / 365
    score += Math.min(ageYears * 10, 100)

    // Recent activity bonus (max 100 points)
    score += Math.min((metrics.recentActivity || 0) * 2, 100)

    // Fork activity (max 50 points)
    score += Math.min((metrics.totalForks || 0) * 0.5, 50)

    return Math.round(score)
  }

  async getTopLanguages(username: string, limit: number = 5): Promise<Array<{language: string, bytes: number}>> {
    const metrics = await this.analyzeDeveloper(username)
    
    return Object.entries(metrics.languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([language, bytes]) => ({ language, bytes }))
  }
}
