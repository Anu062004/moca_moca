# 🔧 Proof of Dev Wave 3 - Troubleshooting Guide

## Common Issues and Solutions

### 1. **Environment Variables Missing**

The most common issue is missing environment variables. Create a `.env.local` file in `moca_moca/proof-of-dev/` with:

```env
# Required for minting
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
AIRKIT_PARTNER_ID=moca-proof-of-dev-2024
AIRKIT_API_KEY=dev-key
MOCA_RPC_URL=https://testnet-rpc.mocachain.org
PROOF_OF_DEV_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 2. **Contract Not Deployed**

If you see "Server configuration missing" error, the contract needs to be deployed:

```bash
cd moca_moca/proof-of-dev
npm run hh:compile
npm run hh:deploy:moca
```

### 3. **GitHub OAuth Not Set Up**

1. Go to https://github.com/settings/developers
2. Create a new OAuth App:
   - Name: "Proof of Dev Wave 3"
   - Homepage: http://localhost:3000
   - Callback: http://localhost:3000/api/auth/callback/github
3. Copy Client ID and Secret to `.env.local`

### 4. **Wallet Not Connected**

Make sure your wallet is connected:
1. Click "Connect Wallet" button
2. Select your wallet provider
3. Approve the connection

### 5. **GitHub Not Signed In**

1. Click "Sign in with GitHub" 
2. Authorize the application
3. Make sure you have public repositories

### 6. **Network Issues**

Check browser console for errors:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for red error messages
4. Check Network tab for failed requests

## Quick Fix Steps

1. **Check Environment File**:
   ```bash
   ls -la moca_moca/proof-of-dev/.env.local
   ```

2. **Restart Development Server**:
   ```bash
   cd moca_moca/proof-of-dev
   npm run dev
   ```

3. **Clear Browser Cache**:
   - Hard refresh (Ctrl+Shift+R)
   - Clear localStorage

4. **Check Console Logs**:
   - Look for specific error messages
   - Check if API calls are failing

## Debug Mode

Add this to your `.env.local` to enable debug logging:

```env
DEBUG=true
NODE_ENV=development
```

## Getting Help

If you're still having issues:

1. Check the browser console for error messages
2. Look at the Network tab for failed API calls
3. Verify all environment variables are set
4. Make sure the contract is deployed
5. Check that GitHub OAuth is properly configured

## Common Error Messages

- **"Missing required parameters"**: GitHub data not loaded
- **"Server configuration missing"**: Environment variables not set
- **"Contract not found"**: Contract address incorrect
- **"Unauthorized"**: GitHub OAuth not working
- **"Wallet not connected"**: Need to connect wallet first
