# Proof of Dev - Environment Configuration Template
# Copy this file to .env.local and fill in your actual values

# GitHub OAuth Configuration
# Get these from: https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Moca Network Configuration
# Update these with actual Moca Network details
MOCA_RPC_URL=https://moca-rpc.example.com
MOCA_CHAIN_ID=12345

# Smart Contract Addresses
PROOF_OF_DEV_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# WalletConnect Project ID
# Get this from: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Instructions:
# 1. Create a GitHub OAuth App at: https://github.com/settings/developers
#    - Application name: "Proof of Dev"
#    - Homepage URL: http://localhost:3000
#    - Authorization callback URL: http://localhost:3000/api/auth/callback/github
#
# 2. Generate NEXTAUTH_SECRET using: openssl rand -base64 32
#
# 3. Get WalletConnect Project ID from: https://cloud.walletconnect.com/
#
# 4. Update Moca Network configuration with actual network details


