import { NextRequest, NextResponse } from 'next/server'

// Diagnostic API to help troubleshoot minting issues
export async function GET(request: NextRequest) {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasGitHubClientId: !!process.env.GITHUB_CLIENT_ID,
        hasGitHubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasAirKitPartnerId: !!process.env.AIRKIT_PARTNER_ID,
        hasAirKitApiKey: !!process.env.AIRKIT_API_KEY,
        hasMocaRpcUrl: !!process.env.MOCA_RPC_URL,
        hasContractAddress: !!process.env.PROOF_OF_DEV_CONTRACT_ADDRESS,
        hasDeployerPrivateKey: !!process.env.DEPLOYER_PRIVATE_KEY,
        hasWalletConnectProjectId: !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      },
      configuration: {
        mocaRpcUrl: process.env.MOCA_RPC_URL || 'Not set',
        contractAddress: process.env.PROOF_OF_DEV_CONTRACT_ADDRESS || 'Not set',
        airKitPartnerId: process.env.AIRKIT_PARTNER_ID || 'Not set',
        nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set',
      },
      recommendations: []
    }

    // Generate recommendations based on missing variables
    if (!process.env.GITHUB_CLIENT_ID) {
      diagnostics.recommendations.push('Set GITHUB_CLIENT_ID in .env.local')
    }
    if (!process.env.GITHUB_CLIENT_SECRET) {
      diagnostics.recommendations.push('Set GITHUB_CLIENT_SECRET in .env.local')
    }
    if (!process.env.NEXTAUTH_SECRET) {
      diagnostics.recommendations.push('Set NEXTAUTH_SECRET in .env.local')
    }
    if (!process.env.PROOF_OF_DEV_CONTRACT_ADDRESS) {
      diagnostics.recommendations.push('Deploy contract and set PROOF_OF_DEV_CONTRACT_ADDRESS')
    }
    if (!process.env.DEPLOYER_PRIVATE_KEY) {
      diagnostics.recommendations.push('Set DEPLOYER_PRIVATE_KEY in .env.local')
    }
    if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
      diagnostics.recommendations.push('Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local')
    }

    // Check if contract address looks valid
    if (process.env.PROOF_OF_DEV_CONTRACT_ADDRESS) {
      const address = process.env.PROOF_OF_DEV_CONTRACT_ADDRESS
      if (address === '0x0000000000000000000000000000000000000000') {
        diagnostics.recommendations.push('Contract address is placeholder - deploy the contract first')
      } else if (!address.startsWith('0x') || address.length !== 42) {
        diagnostics.recommendations.push('Contract address format is invalid')
      }
    }

    return NextResponse.json({
      success: true,
      diagnostics,
      nextSteps: [
        '1. Check the recommendations above',
        '2. Create/update .env.local file with missing variables',
        '3. Restart the development server',
        '4. Try minting credentials again'
      ]
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to run diagnostics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
