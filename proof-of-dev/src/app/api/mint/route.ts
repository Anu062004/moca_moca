import { NextRequest, NextResponse } from 'next/server'
import { getServerWalletAndContract } from '@/lib/contract'
import { mintDeveloperBadge } from '@/lib/airkit'

export async function POST(req: NextRequest) {
  try {
    console.log('=== MINT API CALLED ===')
    
    const body = await req.json()
    console.log('Request body:', body)
    
    const { developer, metrics, githubUsername } = body as {
      developer: string
      githubUsername: string
      metrics: {
        reputationScore: number
        totalCommits: number
        totalRepositories: number
        totalStars: number
        followers: number
        accountAge: number
        topLanguages: string[]
      }
    }

    // Validate input parameters
    if (!developer || !metrics || !githubUsername) {
      console.error('Missing parameters:', { developer: !!developer, metrics: !!metrics, githubUsername: !!githubUsername })
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Validate environment variables
    const requiredEnvVars = {
      DEPLOYER_PRIVATE_KEY: process.env.DEPLOYER_PRIVATE_KEY,
      PROOF_OF_DEV_CONTRACT_ADDRESS: process.env.PROOF_OF_DEV_CONTRACT_ADDRESS,
      MOCA_RPC_URL: process.env.MOCA_RPC_URL
    }

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missingEnvVars.length > 0) {
      console.error('Missing environment variables:', missingEnvVars)
      return NextResponse.json({ 
        error: 'Server configuration missing',
        missing: missingEnvVars
      }, { status: 500 })
    }

    console.log('Environment variables validated')

    // Mint AIR Kit credential first for Moca Network identity
    console.log('Starting AIR Kit credential minting...')
    const airKitResult = await mintDeveloperBadge(developer, {
      username: githubUsername,
      reputationScore: metrics.reputationScore,
      totalStars: metrics.totalStars,
      totalRepositories: metrics.totalRepositories,
    })

    console.log('AIR Kit credential result:', airKitResult)

    // Get contract instance
    console.log('Getting contract instance...')
    const { contract } = getServerWalletAndContract()
    console.log('Contract instance created')

    // Check if developer already has a profile
    console.log('Checking if developer already has a profile...')
    try {
      const hasProfile = await contract.hasProfile(developer)
      if (hasProfile) {
        console.log('Developer already has a profile, returning existing profile info')
        const tokenId = await contract.walletToTokenId(developer)
        
        return NextResponse.json({ 
          success: true,
          message: 'Developer already has a Proof of Dev token',
          tokenId: tokenId.toString(),
          airKitCredential: airKitResult.credential,
          contractAddress: process.env.PROOF_OF_DEV_CONTRACT_ADDRESS,
          mocaNetwork: {
            chainId: 222888,
            name: 'Moca Testnet',
            rpcUrl: process.env.MOCA_RPC_URL,
            explorerUrl: process.env.MOCA_EXPLORER_URL || 'https://testnet-explorer.mocachain.org/'
          }
        })
      }
    } catch (profileError) {
      console.log('Could not check existing profile, proceeding with mint attempt:', profileError.message)
    }

    // Prepare profile data
    const profile = [
      githubUsername,
      BigInt(metrics.reputationScore),
      BigInt(metrics.totalCommits),
      BigInt(metrics.totalRepositories),
      BigInt(metrics.totalStars),
      BigInt(metrics.followers),
      BigInt(metrics.accountAge),
      metrics.topLanguages,
      BigInt(0), // mintedAt set on-chain
      true,
    ] as const

    console.log('Profile data prepared:', profile)

    // Mint on blockchain
    console.log('Minting developer profile on blockchain...')
    const tx = await contract.mintDeveloperProfile(developer, profile)
    console.log('Transaction hash:', tx.hash)
    
    console.log('Waiting for transaction confirmation...')
    const receipt = await tx.wait()
    console.log('Transaction confirmed:', receipt)

    const response = {
      txHash: receipt?.hash,
      airKitCredential: airKitResult.credential,
      contractAddress: process.env.PROOF_OF_DEV_CONTRACT_ADDRESS,
      mocaNetwork: {
        chainId: 222888,
        name: 'Moca Testnet',
        rpcUrl: process.env.MOCA_RPC_URL,
        explorerUrl: process.env.MOCA_EXPLORER_URL || 'https://testnet-explorer.mocachain.org/'
      },
      success: true
    }

    console.log('=== MINT SUCCESS ===', response)
    return NextResponse.json(response)
    
  } catch (e: any) {
    console.error('=== MINT ERROR ===', e)
    console.error('Error message:', e?.message)
    console.error('Error stack:', e?.stack)
    
    return NextResponse.json({ 
      error: e?.message || 'Mint failed',
      details: e?.stack,
      type: e?.constructor?.name || 'Unknown'
    }, { status: 500 })
  }
}


