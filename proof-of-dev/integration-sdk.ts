/**
 * Proof of Dev Wave 3 - Integration SDK
 * 
 * This SDK provides a simple interface for hiring platforms and communities
 * to integrate with the Proof of Dev credential system.
 * 
 * Usage:
 * 1. Import the SDK
 * 2. Initialize with your API endpoint
 * 3. Use the methods to request and verify developer credentials
 */

export interface ProofOfDevConfig {
  apiBaseUrl: string
  apiKey?: string
  timeout?: number
}

export interface DeveloperCredential {
  id: string
  type: string
  issuer: {
    id: string
    name: string
  }
  credentialSubject: any
  issuanceDate: string
  expirationDate?: string
  proof: any
}

export interface VerificationRequest {
  credentialId: string
  requiredFields?: string[]
  predicates?: {
    field: string
    operator: 'gte' | 'lte' | 'eq' | 'in' | 'contains'
    value: any
  }[]
}

export interface VerificationResult {
  verified: boolean
  credential?: DeveloperCredential
  error?: string
  verifiedFields?: string[]
  predicateResults?: { [key: string]: boolean }
}

export interface SelectiveDisclosureRequest {
  credentialId: string
  fields: string[]
  predicates: {
    field: string
    operator: 'gte' | 'lte' | 'eq' | 'in' | 'contains'
    value: any
  }[]
}

export class ProofOfDevSDK {
  private config: ProofOfDevConfig

  constructor(config: ProofOfDevConfig) {
    this.config = {
      timeout: 10000,
      ...config
    }
  }

  /**
   * Request a developer credential from the Proof of Dev system
   */
  async requestCredential(
    developerDid: string,
    credentialType: 'DevPortfolio' | 'Skill' | 'Project' | 'CommunityBadge',
    credentialData: any,
    selectiveDisclosure?: {
      fields: string[]
      predicates?: any
    }
  ): Promise<{ success: boolean; credential?: DeveloperCredential; error?: string }> {
    try {
      const response = await this.makeRequest('/api/issue-credential', {
        method: 'POST',
        body: {
          credentialType,
          subjectDid: developerDid,
          credentialData,
          selectiveDisclosure
        }
      })

      if (response.success) {
        return {
          success: true,
          credential: response.credential
        }
      } else {
        return {
          success: false,
          error: response.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Verify a developer credential
   */
  async verifyCredential(request: VerificationRequest): Promise<VerificationResult> {
    try {
      const response = await this.makeRequest('/api/verify', {
        method: 'POST',
        body: {
          credentialId: request.credentialId,
          requiredFields: request.requiredFields,
          predicates: request.predicates
        }
      })

      if (response.success) {
        return {
          verified: response.verified,
          credential: response.credential,
          verifiedFields: response.verifiedFields,
          predicateResults: response.predicateResults
        }
      } else {
        return {
          verified: false,
          error: response.error
        }
      }
    } catch (error) {
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Create a selective disclosure proof
   */
  async createSelectiveDisclosureProof(
    credentialId: string,
    request: SelectiveDisclosureRequest
  ): Promise<{ success: boolean; proof?: any; error?: string }> {
    try {
      const response = await this.makeRequest('/api/verify-proof', {
        method: 'POST',
        body: {
          credentialId,
          selectiveDisclosure: {
            fields: request.fields,
            predicates: request.predicates
          }
        }
      })

      if (response.success) {
        return {
          success: true,
          proof: response.proof
        }
      } else {
        return {
          success: false,
          error: response.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Verify a selective disclosure proof
   */
  async verifySelectiveDisclosureProof(
    proof: any,
    credential: DeveloperCredential,
    predicates: any[]
  ): Promise<{ success: boolean; verified: boolean; error?: string }> {
    try {
      const response = await this.makeRequest('/api/verify-proof', {
        method: 'PUT',
        body: {
          proof,
          credential,
          predicates
        }
      })

      if (response.success) {
        return {
          success: true,
          verified: response.verified
        }
      } else {
        return {
          success: false,
          verified: false,
          error: response.error
        }
      }
    } catch (error) {
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check if a credential is revoked
   */
  async checkRevocation(credentialId: string): Promise<{ success: boolean; revoked: boolean; error?: string }> {
    try {
      const response = await this.makeRequest(`/api/revoke?credentialId=${credentialId}`, {
        method: 'GET'
      })

      if (response.success) {
        return {
          success: true,
          revoked: response.revoked
        }
      } else {
        return {
          success: false,
          revoked: false,
          error: response.error
        }
      }
    } catch (error) {
      return {
        success: false,
        revoked: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get developer credentials by DID
   */
  async getDeveloperCredentials(developerDid: string): Promise<{ success: boolean; credentials?: DeveloperCredential[]; error?: string }> {
    try {
      const response = await this.makeRequest(`/api/credentials?did=${developerDid}`, {
        method: 'GET'
      })

      if (response.success) {
        return {
          success: true,
          credentials: response.credentials
        }
      } else {
        return {
          success: false,
          error: response.error
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Make HTTP request to the API
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.apiBaseUrl}${endpoint}`
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        ...options.headers
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
}

/**
 * Example usage for hiring platforms
 */
export class HiringPlatformIntegration {
  private sdk: ProofOfDevSDK

  constructor(apiBaseUrl: string, apiKey?: string) {
    this.sdk = new ProofOfDevSDK({ apiBaseUrl, apiKey })
  }

  /**
   * Verify a developer's credentials for a job application
   */
  async verifyJobApplicant(
    developerDid: string,
    jobRequirements: {
      minReputationScore?: number
      requiredSkills?: string[]
      minExperience?: number
      requiredLanguages?: string[]
    }
  ): Promise<{
    qualified: boolean
    credentials: DeveloperCredential[]
    missingRequirements: string[]
    verifiedSkills: string[]
  }> {
    // Get developer credentials
    const credentialsResult = await this.sdk.getDeveloperCredentials(developerDid)
    
    if (!credentialsResult.success || !credentialsResult.credentials) {
      return {
        qualified: false,
        credentials: [],
        missingRequirements: ['Unable to verify credentials'],
        verifiedSkills: []
      }
    }

    const credentials = credentialsResult.credentials
    const missingRequirements: string[] = []
    const verifiedSkills: string[] = []

    // Check for DevPortfolioCredential
    const portfolioCredential = credentials.find(c => c.type.includes('DevPortfolioCredential'))
    
    if (!portfolioCredential) {
      missingRequirements.push('Developer portfolio credential required')
    } else {
      const subject = portfolioCredential.credentialSubject
      
      // Check reputation score
      if (jobRequirements.minReputationScore && subject.reputationScore < jobRequirements.minReputationScore) {
        missingRequirements.push(`Reputation score must be at least ${jobRequirements.minReputationScore}`)
      }

      // Check required skills
      if (jobRequirements.requiredSkills) {
        const developerSkills = subject.topLanguages?.map((lang: any) => lang.language) || []
        const missingSkills = jobRequirements.requiredSkills.filter(skill => 
          !developerSkills.some((devSkill: string) => 
            devSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
        
        if (missingSkills.length > 0) {
          missingRequirements.push(`Missing required skills: ${missingSkills.join(', ')}`)
        } else {
          verifiedSkills.push(...jobRequirements.requiredSkills)
        }
      }

      // Check experience (account age)
      if (jobRequirements.minExperience && subject.accountAge < jobRequirements.minExperience * 365) {
        missingRequirements.push(`Must have at least ${jobRequirements.minExperience} years of experience`)
      }
    }

    // Check for skill credentials
    const skillCredentials = credentials.filter(c => c.type.includes('SkillCredential'))
    skillCredentials.forEach(credential => {
      const skill = credential.credentialSubject.skill
      if (skill) {
        verifiedSkills.push(skill)
      }
    })

    return {
      qualified: missingRequirements.length === 0,
      credentials,
      missingRequirements,
      verifiedSkills: [...new Set(verifiedSkills)]
    }
  }

  /**
   * Create a selective disclosure request for privacy-preserving verification
   */
  async requestSelectiveDisclosure(
    developerDid: string,
    requiredFields: string[],
    predicates: any[]
  ): Promise<{ success: boolean; proof?: any; error?: string }> {
    // First, get the developer's credentials
    const credentialsResult = await this.sdk.getDeveloperCredentials(developerDid)
    
    if (!credentialsResult.success || !credentialsResult.credentials) {
      return {
        success: false,
        error: 'No credentials found for developer'
      }
    }

    // Find the most relevant credential (DevPortfolioCredential)
    const portfolioCredential = credentialsResult.credentials.find(c => 
      c.type.includes('DevPortfolioCredential')
    )

    if (!portfolioCredential) {
      return {
        success: false,
        error: 'No portfolio credential found'
      }
    }

    // Create selective disclosure proof
    return await this.sdk.createSelectiveDisclosureProof(portfolioCredential.id, {
      credentialId: portfolioCredential.id,
      fields: requiredFields,
      predicates
    })
  }
}

// Export for easy importing
export { ProofOfDevSDK, HiringPlatformIntegration }

// Example usage:
/*
// Initialize the SDK
const sdk = new ProofOfDevSDK({
  apiBaseUrl: 'https://proofofdev.moca.network',
  apiKey: 'your-api-key'
})

// Initialize hiring platform integration
const hiringPlatform = new HiringPlatformIntegration(
  'https://proofofdev.moca.network',
  'your-api-key'
)

// Verify a job applicant
const result = await hiringPlatform.verifyJobApplicant(
  'did:moca:developer:0x1234...',
  {
    minReputationScore: 80,
    requiredSkills: ['JavaScript', 'TypeScript'],
    minExperience: 2,
    requiredLanguages: ['JavaScript', 'Python']
  }
)

if (result.qualified) {
  console.log('Applicant is qualified!')
  console.log('Verified skills:', result.verifiedSkills)
} else {
  console.log('Applicant missing requirements:', result.missingRequirements)
}
*/
