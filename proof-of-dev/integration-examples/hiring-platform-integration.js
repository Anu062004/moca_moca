/**
 * Proof of Dev Wave 3 - Hiring Platform Integration Example
 * 
 * This example shows how hiring platforms can integrate with the Proof of Dev
 * credential system to verify developer credentials and make informed hiring decisions.
 */

class ProofOfDevVerifier {
  constructor(config) {
    this.apiBaseUrl = config.apiBaseUrl
    this.apiKey = config.apiKey
  }

  /**
   * Verify a developer's credentials
   * @param {string} developerAddress - The developer's wallet address
   * @param {object} options - Verification options
   * @returns {Promise<object>} Verification result
   */
  async verifyDeveloper(developerAddress, options = {}) {
    const {
      credentialTypes = ['DevPortfolioCredential', 'SkillCredential'],
      includeReputation = true,
      includeSkillGraph = false,
      selectiveDisclosure = null
    } = options

    try {
      const response = await fetch(`${this.apiBaseUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          address: developerAddress,
          credentialTypes,
          includeReputation,
          includeSkillGraph,
          selectiveDisclosure
        })
      })

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`)
      }

      const result = await response.json()
      return this.processVerificationResult(result)
    } catch (error) {
      console.error('Verification error:', error)
      throw error
    }
  }

  /**
   * Process verification result for hiring platform use
   * @param {object} result - Raw verification result
   * @returns {object} Processed result
   */
  processVerificationResult(result) {
    if (!result.success) {
      return {
        verified: false,
        error: result.error,
        developer: null
      }
    }

    const { developer, verificationResults } = result
    const validCredentials = verificationResults.filter(r => r.valid)
    
    return {
      verified: validCredentials.length > 0,
      developer: {
        address: developer.address,
        trustScore: developer.trustScore,
        reputation: developer.reputation,
        credentials: developer.credentials,
        skillSummary: this.extractSkillSummary(developer.credentials),
        projectSummary: this.extractProjectSummary(developer.credentials),
        endorsements: this.extractEndorsements(developer.credentials)
      },
      verificationResults: validCredentials,
      riskAssessment: this.assessRisk(developer, validCredentials)
    }
  }

  /**
   * Extract skill summary from credentials
   * @param {Array} credentials - Developer credentials
   * @returns {object} Skill summary
   */
  extractSkillSummary(credentials) {
    const skillCredentials = credentials.filter(c => 
      c.type.includes('SkillCredential')
    )

    return {
      totalSkills: skillCredentials.length,
      expertSkills: skillCredentials.filter(s => 
        s.credentialSubject.proficiencyLevel === 'Expert'
      ).map(s => s.credentialSubject.skillName),
      advancedSkills: skillCredentials.filter(s => 
        s.credentialSubject.proficiencyLevel === 'Advanced'
      ).map(s => s.credentialSubject.skillName),
      languages: skillCredentials.map(s => s.credentialSubject.skillName)
    }
  }

  /**
   * Extract project summary from credentials
   * @param {Array} credentials - Developer credentials
   * @returns {object} Project summary
   */
  extractProjectSummary(credentials) {
    const projectCredentials = credentials.filter(c => 
      c.type.includes('ProjectCredential')
    )

    const totalCommits = projectCredentials.reduce((sum, p) => 
      sum + p.credentialSubject.contributionMetrics.commits, 0
    )
    const totalPRs = projectCredentials.reduce((sum, p) => 
      sum + p.credentialSubject.contributionMetrics.pullRequests, 0
    )

    return {
      totalProjects: projectCredentials.length,
      totalCommits,
      totalPullRequests: totalPRs,
      projects: projectCredentials.map(p => ({
        name: p.credentialSubject.projectName,
        role: p.credentialSubject.role,
        commits: p.credentialSubject.contributionMetrics.commits
      }))
    }
  }

  /**
   * Extract endorsements from credentials
   * @param {Array} credentials - Developer credentials
   * @returns {Array} Endorsements
   */
  extractEndorsements(credentials) {
    const endorsementCredentials = credentials.filter(c => 
      c.type.includes('EndorsementCredential')
    )

    return endorsementCredentials.map(e => ({
      skill: e.credentialSubject.endorsedSkill,
      rating: e.credentialSubject.rating,
      endorserType: e.credentialSubject.endorserType,
      comment: e.credentialSubject.endorsementText
    }))
  }

  /**
   * Assess hiring risk based on credentials
   * @param {object} developer - Developer data
   * @param {Array} validCredentials - Valid credentials
   * @returns {object} Risk assessment
   */
  assessRisk(developer, validCredentials) {
    const riskFactors = []
    let riskScore = 0

    // Low credential count
    if (validCredentials.length < 2) {
      riskFactors.push('Low credential count')
      riskScore += 30
    }

    // Low trust score
    if (developer.trustScore < 50) {
      riskFactors.push('Low trust score')
      riskScore += 25
    }

    // No recent activity
    const recentCredentials = validCredentials.filter(c => {
      const issuedDate = new Date(c.verifiedAt)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      return issuedDate > sixMonthsAgo
    })

    if (recentCredentials.length === 0) {
      riskFactors.push('No recent activity')
      riskScore += 20
    }

    // No endorsements
    const endorsements = validCredentials.filter(c => 
      c.type.includes('EndorsementCredential')
    )

    if (endorsements.length === 0) {
      riskFactors.push('No endorsements')
      riskScore += 15
    }

    return {
      riskScore: Math.min(riskScore, 100),
      riskLevel: riskScore < 30 ? 'Low' : riskScore < 60 ? 'Medium' : 'High',
      riskFactors,
      recommendation: this.getRecommendation(riskScore, developer.trustScore)
    }
  }

  /**
   * Get hiring recommendation based on risk assessment
   * @param {number} riskScore - Risk score
   * @param {number} trustScore - Trust score
   * @returns {string} Recommendation
   */
  getRecommendation(riskScore, trustScore) {
    if (riskScore < 30 && trustScore > 70) {
      return 'Strong candidate - proceed with interview'
    } else if (riskScore < 60 && trustScore > 50) {
      return 'Good candidate - consider additional verification'
    } else if (riskScore < 80) {
      return 'Moderate candidate - conduct thorough interview'
    } else {
      return 'High risk candidate - require additional verification'
    }
  }

  /**
   * Batch verify multiple developers
   * @param {Array} addresses - Developer addresses
   * @returns {Promise<Array>} Batch verification results
   */
  async batchVerifyDevelopers(addresses) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ addresses })
      })

      if (!response.ok) {
        throw new Error(`Batch verification failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.results.map(r => this.processVerificationResult(r))
    } catch (error) {
      console.error('Batch verification error:', error)
      throw error
    }
  }

  /**
   * Request selective disclosure of specific fields
   * @param {string} developerAddress - Developer address
   * @param {Array} requestedFields - Fields to disclose
   * @param {boolean} zkProof - Use zero-knowledge proofs
   * @returns {Promise<object>} Disclosed data
   */
  async requestSelectiveDisclosure(developerAddress, requestedFields, zkProof = false) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          address: developerAddress,
          requestedFields,
          zkProof,
          verifierId: 'hiring-platform'
        })
      })

      if (!response.ok) {
        throw new Error(`Selective disclosure failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Selective disclosure error:', error)
      throw error
    }
  }
}

// Usage Example
async function exampleUsage() {
  const verifier = new ProofOfDevVerifier({
    apiBaseUrl: 'https://your-proof-of-dev-instance.com/api',
    apiKey: 'your-api-key'
  })

  try {
    // Verify a single developer
    const result = await verifier.verifyDeveloper('0x1234...', {
      includeReputation: true,
      includeSkillGraph: true
    })

    console.log('Verification Result:', result)
    console.log(`Trust Score: ${result.developer.trustScore}`)
    console.log(`Risk Level: ${result.riskAssessment.riskLevel}`)
    console.log(`Recommendation: ${result.riskAssessment.recommendation}`)

    // Batch verify multiple developers
    const batchResults = await verifier.batchVerifyDevelopers([
      '0x1234...',
      '0x5678...',
      '0x9abc...'
    ])

    console.log('Batch Results:', batchResults)

    // Request selective disclosure
    const disclosedData = await verifier.requestSelectiveDisclosure(
      '0x1234...',
      ['reputationScore', 'topLanguages'],
      true // Use ZK proofs
    )

    console.log('Disclosed Data:', disclosedData)

  } catch (error) {
    console.error('Error:', error)
  }
}

// Export for use in other modules
export { ProofOfDevVerifier }

// Run example if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  exampleUsage()
}
