// W3C Verifiable Credential Schemas for Developer Credentials
// Based on Moca AIR Kit credential system

export interface VerifiableCredential {
  "@context": string[]
  type: string[]
  id: string
  issuer: {
    id: string
    name: string
    type: string
  }
  credentialSubject: {
    id: string
    type: string
    [key: string]: any
  }
  issuanceDate: string
  expirationDate?: string
  proof: {
    type: string
    created: string
    verificationMethod: string
    proofPurpose: string
    jws: string
  }
}

// Developer Portfolio Credential Schema
export interface DevPortfolioCredential extends VerifiableCredential {
  type: ["VerifiableCredential", "DevPortfolioCredential"]
  credentialSubject: {
    id: string
    type: "DeveloperPortfolio"
    githubUsername: string
    walletAddress: string
    reputationScore: number
    totalStars: number
    totalRepositories: number
    totalCommits: number
    followers: number
    accountAge: number
    topLanguages: string[]
    verifiedAt: string
    issuer: string
  }
}

// Skill Credential Schema
export interface SkillCredential extends VerifiableCredential {
  type: ["VerifiableCredential", "SkillCredential"]
  credentialSubject: {
    id: string
    type: "DeveloperSkill"
    skillName: string
    proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert"
    evidence: {
      repositories: string[]
      commits: number
      linesOfCode: number
      projects: string[]
    }
    verifiedAt: string
    issuer: string
  }
}

// Project Contribution Credential Schema
export interface ProjectCredential extends VerifiableCredential {
  type: ["VerifiableCredential", "ProjectCredential"]
  credentialSubject: {
    id: string
    type: "ProjectContribution"
    projectName: string
    projectUrl: string
    role: "Contributor" | "Maintainer" | "Creator" | "Reviewer"
    contributionType: "Code" | "Documentation" | "Design" | "Testing" | "Review"
    contributionMetrics: {
      commits: number
      linesAdded: number
      linesRemoved: number
      pullRequests: number
      issuesResolved: number
    }
    verifiedAt: string
    issuer: string
  }
}

// Community Badge Credential Schema
export interface CommunityBadgeCredential extends VerifiableCredential {
  type: ["VerifiableCredential", "CommunityBadgeCredential"]
  credentialSubject: {
    id: string
    type: "CommunityBadge"
    communityName: string
    badgeType: "Member" | "Contributor" | "Mentor" | "Organizer" | "Speaker"
    badgeLevel: "Bronze" | "Silver" | "Gold" | "Platinum"
    achievements: string[]
    verifiedAt: string
    issuer: string
  }
}

// Endorsement Credential Schema
export interface EndorsementCredential extends VerifiableCredential {
  type: ["VerifiableCredential", "EndorsementCredential"]
  credentialSubject: {
    id: string
    type: "Endorsement"
    endorsedSkill: string
    endorserType: "Peer" | "Mentor" | "Employer" | "Community"
    endorsementText: string
    rating: number // 1-5 scale
    verifiedAt: string
    issuer: string
  }
}

// Credential Schema Registry
export const CREDENTIAL_SCHEMAS = {
  DEV_PORTFOLIO: {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://moca.network/credentials/dev-portfolio/v1"
    ],
    type: ["VerifiableCredential", "DevPortfolioCredential"],
    schema: {
      id: "https://moca.network/schemas/dev-portfolio/v1",
      type: "JsonSchemaValidator2018"
    }
  },
  SKILL: {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://moca.network/credentials/skill/v1"
    ],
    type: ["VerifiableCredential", "SkillCredential"],
    schema: {
      id: "https://moca.network/schemas/skill/v1",
      type: "JsonSchemaValidator2018"
    }
  },
  PROJECT: {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://moca.network/credentials/project/v1"
    ],
    type: ["VerifiableCredential", "ProjectCredential"],
    schema: {
      id: "https://moca.network/schemas/project/v1",
      type: "JsonSchemaValidator2018"
    }
  },
  COMMUNITY_BADGE: {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://moca.network/credentials/community-badge/v1"
    ],
    type: ["VerifiableCredential", "CommunityBadgeCredential"],
    schema: {
      id: "https://moca.network/schemas/community-badge/v1",
      type: "JsonSchemaValidator2018"
    }
  },
  ENDORSEMENT: {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://moca.network/credentials/endorsement/v1"
    ],
    type: ["VerifiableCredential", "EndorsementCredential"],
    schema: {
      id: "https://moca.network/schemas/endorsement/v1",
      type: "JsonSchemaValidator2018"
    }
  }
} as const

// Credential Factory Functions
export class CredentialFactory {
  static createDevPortfolioCredential(
    recipient: string,
    githubData: {
      username: string
      reputationScore: number
      totalStars: number
      totalRepositories: number
      totalCommits: number
      followers: number
      accountAge: number
      topLanguages: string[]
    },
    issuer: string
  ): DevPortfolioCredential {
    const credentialId = `did:moca:dev-portfolio:${Date.now()}`
    
    return {
      "@context": CREDENTIAL_SCHEMAS.DEV_PORTFOLIO["@context"],
      type: CREDENTIAL_SCHEMAS.DEV_PORTFOLIO.type,
      id: credentialId,
      issuer: {
        id: issuer,
        name: "Moca Network Proof of Dev",
        type: "Organization"
      },
      credentialSubject: {
        id: recipient,
        type: "DeveloperPortfolio",
        githubUsername: githubData.username,
        walletAddress: recipient,
        reputationScore: githubData.reputationScore,
        totalStars: githubData.totalStars,
        totalRepositories: githubData.totalRepositories,
        totalCommits: githubData.totalCommits,
        followers: githubData.followers,
        accountAge: githubData.accountAge,
        topLanguages: githubData.topLanguages,
        verifiedAt: new Date().toISOString(),
        issuer: issuer
      },
      issuanceDate: new Date().toISOString(),
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: new Date().toISOString(),
        verificationMethod: `${issuer}#key-1`,
        proofPurpose: "assertionMethod",
        jws: "" // Will be filled by AIR Kit
      }
    }
  }

  static createSkillCredential(
    recipient: string,
    skillData: {
      skillName: string
      proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert"
      evidence: {
        repositories: string[]
        commits: number
        linesOfCode: number
        projects: string[]
      }
    },
    issuer: string
  ): SkillCredential {
    const credentialId = `did:moca:skill:${Date.now()}`
    
    return {
      "@context": CREDENTIAL_SCHEMAS.SKILL["@context"],
      type: CREDENTIAL_SCHEMAS.SKILL.type,
      id: credentialId,
      issuer: {
        id: issuer,
        name: "Moca Network Skill Verifier",
        type: "Organization"
      },
      credentialSubject: {
        id: recipient,
        type: "DeveloperSkill",
        skillName: skillData.skillName,
        proficiencyLevel: skillData.proficiencyLevel,
        evidence: skillData.evidence,
        verifiedAt: new Date().toISOString(),
        issuer: issuer
      },
      issuanceDate: new Date().toISOString(),
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: new Date().toISOString(),
        verificationMethod: `${issuer}#key-1`,
        proofPurpose: "assertionMethod",
        jws: "" // Will be filled by AIR Kit
      }
    }
  }

  static createProjectCredential(
    recipient: string,
    projectData: {
      projectName: string
      projectUrl: string
      role: "Contributor" | "Maintainer" | "Creator" | "Reviewer"
      contributionType: "Code" | "Documentation" | "Design" | "Testing" | "Review"
      contributionMetrics: {
        commits: number
        linesAdded: number
        linesRemoved: number
        pullRequests: number
        issuesResolved: number
      }
    },
    issuer: string
  ): ProjectCredential {
    const credentialId = `did:moca:project:${Date.now()}`
    
    return {
      "@context": CREDENTIAL_SCHEMAS.PROJECT["@context"],
      type: CREDENTIAL_SCHEMAS.PROJECT.type,
      id: credentialId,
      issuer: {
        id: issuer,
        name: "Moca Network Project Verifier",
        type: "Organization"
      },
      credentialSubject: {
        id: recipient,
        type: "ProjectContribution",
        projectName: projectData.projectName,
        projectUrl: projectData.projectUrl,
        role: projectData.role,
        contributionType: projectData.contributionType,
        contributionMetrics: projectData.contributionMetrics,
        verifiedAt: new Date().toISOString(),
        issuer: issuer
      },
      issuanceDate: new Date().toISOString(),
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: new Date().toISOString(),
        verificationMethod: `${issuer}#key-1`,
        proofPurpose: "assertionMethod",
        jws: "" // Will be filled by AIR Kit
      }
    }
  }

  static createCommunityBadgeCredential(
    recipient: string,
    badgeData: {
      communityName: string
      badgeType: "Member" | "Contributor" | "Mentor" | "Organizer" | "Speaker"
      badgeLevel: "Bronze" | "Silver" | "Gold" | "Platinum"
      achievements: string[]
    },
    issuer: string
  ): CommunityBadgeCredential {
    const credentialId = `did:moca:community-badge:${Date.now()}`
    
    return {
      "@context": CREDENTIAL_SCHEMAS.COMMUNITY_BADGE["@context"],
      type: CREDENTIAL_SCHEMAS.COMMUNITY_BADGE.type,
      id: credentialId,
      issuer: {
        id: issuer,
        name: badgeData.communityName,
        type: "Community"
      },
      credentialSubject: {
        id: recipient,
        type: "CommunityBadge",
        communityName: badgeData.communityName,
        badgeType: badgeData.badgeType,
        badgeLevel: badgeData.badgeLevel,
        achievements: badgeData.achievements,
        verifiedAt: new Date().toISOString(),
        issuer: issuer
      },
      issuanceDate: new Date().toISOString(),
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: new Date().toISOString(),
        verificationMethod: `${issuer}#key-1`,
        proofPurpose: "assertionMethod",
        jws: "" // Will be filled by AIR Kit
      }
    }
  }

  static createEndorsementCredential(
    recipient: string,
    endorsementData: {
      endorsedSkill: string
      endorserType: "Peer" | "Mentor" | "Employer" | "Community"
      endorsementText: string
      rating: number
    },
    issuer: string
  ): EndorsementCredential {
    const credentialId = `did:moca:endorsement:${Date.now()}`
    
    return {
      "@context": CREDENTIAL_SCHEMAS.ENDORSEMENT["@context"],
      type: CREDENTIAL_SCHEMAS.ENDORSEMENT.type,
      id: credentialId,
      issuer: {
        id: issuer,
        name: "Moca Network Endorsement System",
        type: "Organization"
      },
      credentialSubject: {
        id: recipient,
        type: "Endorsement",
        endorsedSkill: endorsementData.endorsedSkill,
        endorserType: endorsementData.endorserType,
        endorsementText: endorsementData.endorsementText,
        rating: endorsementData.rating,
        verifiedAt: new Date().toISOString(),
        issuer: issuer
      },
      issuanceDate: new Date().toISOString(),
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: new Date().toISOString(),
        verificationMethod: `${issuer}#key-1`,
        proofPurpose: "assertionMethod",
        jws: "" // Will be filled by AIR Kit
      }
    }
  }
}

// Credential validation utilities
export class CredentialValidator {
  static validateCredentialStructure(credential: any): boolean {
    return (
      credential["@context"] &&
      credential.type &&
      credential.id &&
      credential.issuer &&
      credential.credentialSubject &&
      credential.issuanceDate &&
      credential.proof
    )
  }

  static isExpired(credential: VerifiableCredential): boolean {
    if (!credential.expirationDate) return false
    return new Date(credential.expirationDate) < new Date()
  }

  static getCredentialType(credential: VerifiableCredential): string {
    return credential.type.find(type => type !== "VerifiableCredential") || "Unknown"
  }
}
