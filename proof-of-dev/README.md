# Proof of Dev - Developer Reputation Protocol

Transform your GitHub activity into a verifiable Soulbound Token on Moca Network. Build your on-chain developer identity and showcase your skills to the world.

## 🚀 Features

- **GitHub Integration**: Connect your GitHub account and analyze your development activity
- **Reputation Scoring**: Advanced algorithm calculates your developer reputation score
- **Soulbound Token**: Mint a non-transferable NFT representing your skills
- **Verification Interface**: View and verify developer profiles on-chain
- **Moca Network**: Built on the Moca blockchain for decentralized identity

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with GitHub OAuth
- **Blockchain**: Wagmi, RainbowKit, Viem
- **GitHub API**: Octokit for repository analysis
- **Smart Contracts**: Solidity (OpenZeppelin)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub OAuth App
- Moca Network wallet

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd proof-of-dev
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Moca Network Configuration
MOCA_RPC_URL=https://moca-rpc.example.com
MOCA_CHAIN_ID=12345

# Smart Contract Addresses
PROOF_OF_DEV_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 3. GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Application name: "Proof of Dev"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Client Secret to your `.env.local`

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
proof-of-dev/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   └── page.tsx        # Main page
│   ├── components/          # React components
│   ├── lib/                # Utility libraries
│   └── types/              # TypeScript types
├── contracts/              # Smart contracts
└── public/                 # Static assets
```

## 🔗 Smart Contract

The Proof of Dev contract is a Soulbound Token (SBT) that stores developer reputation data:

- **Non-transferable**: Tokens cannot be sold or transferred
- **Reputation Data**: Stores GitHub metrics and reputation score
- **Verification**: Anyone can verify a developer's on-chain reputation

## 🎯 How It Works

1. **Connect GitHub**: Sign in with GitHub OAuth
2. **Analyze Profile**: System analyzes your GitHub activity
3. **Calculate Score**: Reputation algorithm calculates your score
4. **Mint Token**: Mint your Proof of Dev SBT on Moca Network
5. **Verify Others**: Search and verify other developers' profiles

## 📊 Reputation Scoring

The reputation score is calculated based on:

- **Followers**: Social proof and community recognition
- **Stars**: Project quality and popularity
- **Repositories**: Activity and contribution volume
- **Account Age**: Longevity and commitment
- **Recent Activity**: Current engagement level
- **Forks**: Community contribution and collaboration

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Moca Network](https://github.com/MocaNetwork) for blockchain infrastructure
- [Next.js](https://nextjs.org/) for the React framework
- [RainbowKit](https://rainbowkit.com/) for wallet connection
- [GitHub](https://github.com/) for developer data

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Join our Discord community
- Check the documentation

---

Built with ❤️ for the developer community
