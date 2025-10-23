# 🚀 Proof of Dev Wave 3 – Intelligent, Portable Developer Credentials

**Transform static Soulbound Tokens into dynamic, intelligent developer credentialing system powered by Moca Network and AIR Stack.**

## 🌟 Project Vision

Proof of Dev Wave 3 evolves the existing "Proof of Dev" concept from static soulbound tokens into a dynamic, intelligent developer credentialing system. Instead of a single Soulbound Token, each developer now has modular, verifiable credentials (VCs) representing skills, project contributions, and endorsements — all managed through AIR Kit and Moca Network's credential layer.

## 🎯 Core Objectives

- ✅ **W3C-Compliant Verifiable Credentials**: Issue and verify developer credentials using AIR Kit
- ✅ **Intelligent Reputation Engine**: ML-driven scoring based on credential provenance, recency, and endorsements
- ✅ **Privacy-Preserving Verification**: Selective disclosure and ZK proofs for sensitive data
- ✅ **Portable Identity**: Credentials travel across platforms and communities
- ✅ **Auto-Verification**: GitHub and CI pipeline integration for automatic credential issuance
- ✅ **Community Integration**: Tech communities can issue portable, verifiable membership credentials

## 🏗️ Architecture Overview

### Credential Types

1. **DevPortfolioCredential**: Overall developer reputation and GitHub activity
2. **SkillCredential**: Verified programming language and technology skills
3. **ProjectCredential**: Contributions to specific projects and repositories
4. **CommunityBadgeCredential**: Membership and achievements in tech communities
5. **EndorsementCredential**: Peer, mentor, and employer endorsements

### Key Components

- **Credential Schemas** (`src/lib/credential-schemas.ts`): W3C-compliant credential definitions
- **AIR Kit Integration** (`src/lib/airkit.ts`): Intelligent reputation engine and credential management
- **Credential Dashboard** (`src/components/credential-dashboard.tsx`): Developer credential management UI
- **Verification API** (`src/app/api/verify/route.ts`): External platform verification endpoints
- **Auto-Verification** (`src/app/api/auto-verify/route.ts`): GitHub webhook and CI integration
- **Community Badges** (`src/app/api/community-badges/route.ts`): Community credential issuance system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Moca Network testnet access
- GitHub account for OAuth integration

### Installation

```bash
cd moca_moca/proof-of-dev
npm install
```

### Environment Setup

Create a `.env.local` file:

```env
# AIR Kit Configuration
AIRKIT_PARTNER_ID=your-partner-id
AIRKIT_API_KEY=your-api-key

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_TOKEN=your-github-token

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Moca Network
MOCA_RPC_URL=https://testnet-rpc.mocachain.org
MOCA_CHAIN_ID=222888
```

### Running the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🔧 API Endpoints

### Verification API (`/api/verify`)

**POST** - Verify developer credentials
```json
{
  "address": "0x...",
  "credentialTypes": ["DevPortfolioCredential", "SkillCredential"],
  "includeReputation": true,
  "includeSkillGraph": true
}
```

**PUT** - Selective disclosure with ZK proofs
```json
{
  "address": "0x...",
  "requestedFields": ["reputationScore", "topLanguages"],
  "zkProof": true,
  "verifierId": "hiring-platform-123"
}
```

**PATCH** - Batch verification for multiple developers
```json
{
  "addresses": ["0x...", "0x..."]
}
```

### Auto-Verification API (`/api/auto-verify`)

**POST** - GitHub webhook handler for automatic credential issuance
**PUT** - CI pipeline integration for test coverage and build status
**GET** - Configuration and documentation

### Community Badges API (`/api/community-badges`)

**POST** - Issue community badge credential
**GET** - List communities and badge types
**PUT** - Create new community

## 🎨 User Interface

### 3D Interactive Landing Page
- Immersive 3D planet scene with floating action buttons
- Smooth animations and transitions
- Responsive design for all devices

### Credential Dashboard
- View all developer credentials
- Filter by credential type
- Export and share credentials
- Detailed credential information modal

### Developer Profile Analysis
- GitHub integration for activity analysis
- Real-time reputation scoring
- Credential issuance workflow

## 🔐 Security Features

### Verifiable Credentials
- W3C-compliant credential structure
- Cryptographic signatures
- Revocation support
- Expiration handling

### Privacy Controls
- Selective disclosure
- Zero-knowledge proofs (mock implementation)
- Field-level privacy controls
- Verifier-specific data sharing

### Authentication
- GitHub OAuth integration
- Wallet connection via Wagmi
- Session management with NextAuth

## 🌐 Integration Examples

### Hiring Platform Integration

```javascript
// Verify developer credentials
const response = await fetch('/api/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x...',
    credentialTypes: ['DevPortfolioCredential', 'SkillCredential'],
    includeReputation: true
  })
})

const { developer, verificationResults } = await response.json()
console.log(`Trust Score: ${developer.trustScore}`)
```

### GitHub Webhook Setup

1. Go to your repository settings
2. Add webhook URL: `https://your-domain.com/api/auto-verify`
3. Select events: `push`, `pull_request`
4. Configure secret token

### Community Badge Issuance

```javascript
// Issue community badge
const response = await fetch('/api/community-badges', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    communityId: 'ethereum-foundation',
    developerAddress: '0x...',
    badgeType: 'contributor',
    badgeLevel: 'Gold',
    achievements: ['Core Contributor', 'Mentor']
  })
})
```

## 📊 Reputation Engine

The intelligent reputation engine calculates trust scores based on:

- **Portfolio Credentials** (40%): GitHub activity, stars, repositories
- **Skill Credentials** (30%): Programming language proficiency, evidence
- **Project Credentials** (20%): Contribution metrics, project impact
- **Endorsements** (10%): Peer ratings and community recognition

### Skill Graph
- Visual representation of developer skills
- Skill relationships and dependencies
- Endorsement aggregation
- Proficiency level mapping

## 🔄 Auto-Verification Workflows

### GitHub Integration
- Automatic skill credential issuance based on language usage
- Project credential creation for significant contributions
- Real-time reputation updates

### CI Pipeline Integration
- Test coverage credentials
- Build success verification
- Code quality metrics
- Automated project contribution tracking

## 🌍 Community Ecosystem

### Supported Communities
- **Ethereum Foundation**: Contributor badges and levels
- **Moca Network**: Developer ecosystem credentials
- **Custom Communities**: Extensible badge system

### Badge Levels
- **Bronze**: Initial contributions and participation
- **Silver**: Regular contributions and community engagement
- **Gold**: Significant contributions and mentorship
- **Platinum**: Leadership roles and ecosystem impact

## 🚀 Deployment

### Vercel Deployment

```bash
npm run build
vercel --prod
```

### Environment Variables
Set the following in your deployment platform:
- `AIRKIT_PARTNER_ID`
- `AIRKIT_API_KEY`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `NEXTAUTH_SECRET`

## 🔮 Future Enhancements

- [ ] **ZK Proof Implementation**: Real zero-knowledge proof integration
- [ ] **Cross-Chain Support**: Multi-chain credential portability
- [ ] **AI-Powered Matching**: Intelligent job-developer matching
- [ ] **Mobile App**: Flutter SDK integration
- [ ] **Enterprise Features**: Advanced analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Moca Network** for the AIR Kit infrastructure
- **W3C** for Verifiable Credentials standards
- **GitHub** for developer activity data
- **Ethereum Foundation** for blockchain inspiration

---

**Built with ❤️ for the decentralized future of developer identity**

For more information, visit [Moca Network Documentation](https://docs.moca.network/airkit/)
