# 🚀 Proof of Dev Wave 3 - Verifiable Credentials Platform

**The future of developer credentialing is here.** Proof of Dev Wave 3 transforms developer identity from static Soulbound Tokens to dynamic, portable Verifiable Credentials powered by Moca Network and AIR Stack.

## 🌟 **What's New in Wave 3**

### **🔐 W3C-Compliant Verifiable Credentials**
- **DevPortfolioCredential**: Comprehensive developer portfolio with verifiable claims
- **SkillCredential**: Verified technical skills and proficiency levels
- **ProjectCredential**: Open source contributions and project involvement
- **CommunityBadgeCredential**: Community recognition and achievements

### **🔒 Privacy-Preserving Verification**
- **Selective Disclosure**: Share only what you need to prove
- **ZK Predicates**: Prove statements without revealing underlying data
- **Revocation Support**: Credentials can be revoked when needed
- **Cross-Platform Portability**: Use credentials anywhere

### **🤖 Intelligent Automation**
- **GitHub Integration**: Auto-issue credentials on PR merges
- **CI/CD Hooks**: Seamless integration with development workflows
- **Smart Issuers**: AI-powered credential validation
- **Real-time Verification**: Instant credential verification

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Developers    │    │  Hiring Platforms│    │   Communities   │
│                 │    │                 │    │                 │
│ • GitHub Auth   │    │ • Verify Skills │    │ • Issue Badges  │
│ • Wallet Connect│    │ • Check Rep      │    │ • Endorse Devs  │
│ • Issue Creds   │    │ • Selective Disc│    │ • Verify Claims │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Moca Network   │
                    │                 │
                    │ • AIR Kit       │
                    │ • Verifiable    │
                    │   Credentials   │
                    │ • ZK Proofs     │
                    │ • Revocation    │
                    └─────────────────┘
```

## 🚀 **Quick Start**

### **1. Environment Setup**
```bash
# Clone the repository
git clone https://github.com/Anu062004/moca_moca.git
cd moca_moca/proof-of-dev

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Edit .env.local with your values
nano .env.local
```

### **2. Required Environment Variables**
```env
# Core Application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_TOKEN=your_github_personal_access_token_here

# AIR Kit Configuration
AIRKIT_PARTNER_ID=moca-proof-of-dev-2024
AIRKIT_API_KEY=dev-key

# Moca Network
MOCA_RPC_URL=https://testnet-rpc.mocachain.org
MOCA_CHAIN_ID=222888
PROOF_OF_DEV_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_here

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### **3. Deploy Smart Contract**
```bash
# Deploy to Moca Testnet
npm run deploy

# Or manually
npm run hh:compile
npm run hh:deploy:moca
```

### **4. Start Development Server**
```bash
npm run dev
```

### **5. Test the System**
```bash
# Run diagnostics
npm run test:diagnostics

# Run smoke tests
npm run test:smoke

# Test GitHub integration
npm run test:github
```

## 🎯 **Core Features**

### **1. Verifiable Credential Issuance**
```typescript
// Issue a DevPortfolioCredential
const credential = await fetch('/api/issue-credential', {
  method: 'POST',
  body: JSON.stringify({
    credentialType: 'DevPortfolio',
    subjectDid: 'did:moca:developer:0x1234...',
    credentialData: {
      githubUsername: 'octocat',
      reputationScore: 95,
      totalStars: 1250,
      topLanguages: ['JavaScript', 'TypeScript']
    }
  })
})
```

### **2. Selective Disclosure**
```typescript
// Create a selective disclosure proof
const proof = await fetch('/api/verify-proof', {
  method: 'POST',
  body: JSON.stringify({
    credentialId: 'credential-id',
    selectiveDisclosure: {
      fields: ['reputationScore', 'totalStars'],
      predicates: [
        { field: 'reputationScore', operator: 'gte', value: 80 },
        { field: 'totalStars', operator: 'gte', value: 100 }
      ]
    }
  })
})
```

### **3. Credential Verification**
```typescript
// Verify a credential
const verification = await fetch('/api/verify', {
  method: 'POST',
  body: JSON.stringify({
    credentialId: 'credential-id',
    requiredFields: ['reputationScore', 'totalStars'],
    predicates: [
      { field: 'reputationScore', operator: 'gte', value: 80 }
    ]
  })
})
```

### **4. Revocation**
```typescript
// Revoke a credential
const revocation = await fetch('/api/revoke', {
  method: 'POST',
  body: JSON.stringify({
    credentialId: 'credential-id',
    reason: 'Credential compromised'
  })
})
```

## 🔧 **Integration Guide**

### **For Hiring Platforms**
```typescript
import { HiringPlatformIntegration } from './integration-sdk'

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
    minExperience: 2
  }
)

if (result.qualified) {
  console.log('Applicant is qualified!')
  console.log('Verified skills:', result.verifiedSkills)
}
```

### **For Communities**
```typescript
// Issue community badges
const badge = await fetch('/api/community-badges', {
  method: 'POST',
  body: JSON.stringify({
    badgeName: 'Open Source Contributor',
    community: 'GitHub',
    recipientDid: 'did:moca:developer:0x1234...',
    criteria: {
      minContributions: 10,
      requiredRepositories: ['open-source-project']
    }
  })
})
```

### **For CI/CD Pipelines**
```yaml
# .github/workflows/issue-contribution-credential.yml
name: Issue Contribution Credential
on:
  pull_request:
    types: [closed]

jobs:
  issue-credential:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Issue Project Credential
        run: |
          curl -X POST "$API_BASE_URL/api/auto-verify" \
            -H "Content-Type: application/json" \
            -d '{
              "type": "ProjectCredential",
              "subjectDid": "did:moca:developer:${{ github.actor }}",
              "credentialData": {
                "projectName": "${{ github.event.pull_request.title }}",
                "url": "${{ github.event.pull_request.html_url }}"
              }
            }'
```

## 📊 **Credential Schemas**

### **DevPortfolioCredential**
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "DevPortfolioCredential"],
  "credentialSubject": {
    "id": "did:moca:developer:0x1234...",
    "type": "DevPortfolio",
    "githubUsername": "octocat",
    "reputationScore": 95,
    "totalStars": 1250,
    "topLanguages": [
      { "language": "JavaScript", "bytes": 500000, "percentage": 35 }
    ],
    "predicates": {
      "reputationScore": { "min": 0, "max": 100 },
      "totalStars": { "min": 0, "max": 10000 }
    }
  }
}
```

### **SkillCredential**
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "SkillCredential"],
  "credentialSubject": {
    "id": "did:moca:developer:0x1234...",
    "type": "Skill",
    "skill": "JavaScript",
    "level": "Expert",
    "evidence": {
      "type": "GitHub Contribution",
      "repository": "https://github.com/user/project",
      "verifiedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

## 🛡️ **Security & Privacy**

### **Zero-Knowledge Proofs**
- Prove statements without revealing underlying data
- Selective disclosure of credential fields
- Privacy-preserving verification

### **Revocation Support**
- Credentials can be revoked when compromised
- Real-time revocation checking
- On-chain revocation registry

### **Cryptographic Security**
- AIR Kit digital signatures
- Moca Network blockchain anchoring
- Tamper-proof credential storage

## 🧪 **Testing**

### **Run All Tests**
```bash
# System diagnostics
npm run test:diagnostics

# Smoke tests
npm run test:smoke

# GitHub integration tests
npm run test:github

# End-to-end tests
npm run test:e2e
```

### **Manual Testing Checklist**
- [ ] GitHub OAuth authentication works
- [ ] Wallet connection successful
- [ ] Credential issuance functional
- [ ] Selective disclosure working
- [ ] Verification process complete
- [ ] Revocation system operational
- [ ] GitHub Action triggers correctly

## 📈 **Performance Metrics**

- **Credential Issuance**: < 3 seconds
- **Verification**: < 1 second
- **Selective Disclosure**: < 2 seconds
- **Revocation Check**: < 500ms
- **API Response Time**: < 5 seconds

## 🔮 **Future Roadmap**

### **Phase 1: Core Platform** ✅
- W3C Verifiable Credentials
- Selective disclosure
- Revocation support
- Basic verification

### **Phase 2: Intelligence** 🚧
- AI-powered credential validation
- Smart reputation scoring
- Automated skill assessment
- Predictive analytics

### **Phase 3: Ecosystem** 📋
- Multi-chain support
- Advanced ZK proofs
- Decentralized identity
- Cross-platform integration

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**
```bash
# Fork the repository
git clone https://github.com/your-username/moca_moca.git
cd moca_moca/proof-of-dev

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Moca Network** for the blockchain infrastructure
- **AIR Stack** for verifiable credential technology
- **W3C** for the Verifiable Credentials standard
- **GitHub** for developer platform integration
- **Open Source Community** for inspiration and support

---

**🚀 Ready to revolutionize developer credentialing? Start building with Proof of Dev Wave 3 today!**