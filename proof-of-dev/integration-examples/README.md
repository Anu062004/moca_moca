# Proof of Dev Wave 3 - Integration Examples

This directory contains integration examples for hiring platforms, communities, and developers to integrate with the Proof of Dev credential system.

## 📁 Files

- `hiring-platform-integration.js` - Example integration for hiring platforms
- `community-badge-integration.js` - Example for tech communities
- `developer-sdk.js` - SDK for developers to manage their credentials
- `webhook-examples.md` - GitHub webhook and CI integration examples

## 🚀 Quick Start

### For Hiring Platforms

```javascript
import { ProofOfDevVerifier } from './hiring-platform-integration.js'

const verifier = new ProofOfDevVerifier({
  apiBaseUrl: 'https://your-proof-of-dev-instance.com/api'
})

// Verify a developer's credentials
const result = await verifier.verifyDeveloper('0x1234...', {
  includeReputation: true,
  credentialTypes: ['DevPortfolioCredential', 'SkillCredential']
})

console.log(`Trust Score: ${result.developer.trustScore}`)
console.log(`Verified Skills: ${result.developer.credentials.length}`)
```

### For Tech Communities

```javascript
import { CommunityBadgeManager } from './community-badge-integration.js'

const badgeManager = new CommunityBadgeManager({
  apiBaseUrl: 'https://your-proof-of-dev-instance.com/api',
  communityId: 'your-community-id'
})

// Issue a badge to a developer
await badgeManager.issueBadge({
  developerAddress: '0x1234...',
  badgeType: 'contributor',
  badgeLevel: 'Gold',
  achievements: ['Core Contributor', 'Mentor']
})
```

### For Developers

```javascript
import { DeveloperCredentialManager } from './developer-sdk.js'

const credentialManager = new DeveloperCredentialManager({
  apiBaseUrl: 'https://your-proof-of-dev-instance.com/api',
  walletAddress: '0x1234...'
})

// Get all credentials
const credentials = await credentialManager.getCredentials()

// Share specific credentials with selective disclosure
const sharedData = await credentialManager.shareCredentials({
  verifierId: 'hiring-platform-123',
  fields: ['reputationScore', 'topLanguages'],
  zkProof: true
})
```

## 🔧 Configuration

### Environment Variables

```env
PROOF_OF_DEV_API_URL=https://your-instance.com/api
AIRKIT_PARTNER_ID=your-partner-id
AIRKIT_API_KEY=your-api-key
COMMUNITY_ID=your-community-id
```

### API Endpoints

- **Verification**: `POST /api/verify`
- **Selective Disclosure**: `PUT /api/verify`
- **Community Badges**: `POST /api/community-badges`
- **Auto-Verification**: `POST /api/auto-verify`

## 📚 Documentation

For detailed API documentation, see:
- [Verification API](./api-docs/verification.md)
- [Community Badges API](./api-docs/community-badges.md)
- [Auto-Verification API](./api-docs/auto-verification.md)

## 🤝 Support

For integration support:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Discord: [Join our community](https://discord.gg/your-discord)
- Email: support@your-domain.com
