import { NextRequest, NextResponse } from 'next/server'
import { getServerWalletAndContract } from '@/lib/contract'
import { mintDeveloperBadge } from '@/lib/airkit'

interface MintRequest {
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

interface EnvironmentValidation {
  isValid: boolean
  missing: string[]
  warnings: string[]
}

function validateEnvironment(): EnvironmentValidation {
  const required = {
    DEPLOYER_PRIVATE_KEY: process.env.DEPLOYER_PRIVATE_KEY,
    PROOF_OF_DEV_CONTRACT_ADDRESS: process.env.PROOF_OF_DEV_CONTRACT_ADDRESS,
    MOCA_RPC_URL: process.env.MOCA_RPC_URL,
    AIRKIT_PARTNER_ID: process.env.AIRKIT_PARTNER_ID,
    AIRKIT_API_KEY: process.env.AIRKIT_API_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  }

  const optional = {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    MOCA_EXPLORER_URL: process.env.MOCA_EXPLORER_URL,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  }

  const missing = Object.entries(required)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  const warnings = Object.entries(optional)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  }
}

function validateInput(body: any): { isValid: boolean; error?: string; data?: MintRequest } {
  const { developer, metrics, githubUsername } = body

  if (!developer || typeof developer !== 'string') {
    return { isValid: false, error: 'Missing or invalid developer address' }
  }

  if (!githubUsername || typeof githubUsername !== 'string') {
    return { isValid: false, error: 'Missing or invalid GitHub username' }
  }

  if (!metrics || typeof metrics !== 'object') {
    return { isValid: false, error: 'Missing or invalid metrics object' }
  }

  const requiredMetrics = [
    'reputationScore', 'totalCommits', 'totalRepositories', 
    'totalStars', 'followers', 'accountAge', 'topLanguages'
  ]

  for (const metric of requiredMetrics) {
    if (metrics[metric] === undefined || metrics[metric] === null) {
      return { isValid: false, error: `Missing required metric: ${metric}` }
    }
  }

  if (!Array.isArray(metrics.topLanguages)) {
    return { isValid: false, error: 'topLanguages must be an array' }
  }

  return { isValid: true, data: { developer, githubUsername, metrics } }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] === MINT API CALLED ===`)
    
    // Parse and validate request body
    let body: any
    try {
      body = await req.json()
      console.log(`[${requestId}] Request body parsed successfully`)
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError)
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        requestId 
      }, { status: 400 })
    }

    // Validate input parameters
    const inputValidation = validateInput(body)
    if (!inputValidation.isValid) {
      console.error(`[${requestId}] Input validation failed:`, inputValidation.error)
      return NextResponse.json({ 
        error: inputValidation.error,
        requestId 
      }, { status: 400 })
    }

    const { developer, metrics, githubUsername } = inputValidation.data!

    // Validate environment variables
    console.log(`[${requestId}] Validating environment variables...`)
    const envValidation = validateEnvironment()
    
    if (!envValidation.isValid) {
      console.error(`[${requestId}] Environment validation failed:`, envValidation.missing)
      return NextResponse.json({ 
        error: 'Server configuration missing',
        missing: envValidation.missing,
        warnings: envValidation.warnings,
        requestId,
        help: 'See env.example for required environment variables'
      }, { status: 500 })
    }

    if (envValidation.warnings.length > 0) {
      console.warn(`[${requestId}] Environment warnings:`, envValidation.warnings)
    }

    console.log(`[${requestId}] Environment validation passed`)

    // Validate contract address format
    const contractAddress = process.env.PROOF_OF_DEV_CONTRACT_ADDRESS!
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      console.error(`[${requestId}] Contract address is placeholder`)
      return NextResponse.json({ 
        error: 'Contract not deployed',
        details: 'PROOF_OF_DEV_CONTRACT_ADDRESS is set to placeholder. Deploy contract first.',
        requestId,
        help: 'Run: npm run hh:deploy:moca'
      }, { status: 500 })
    }

    if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      console.error(`[${requestId}] Invalid contract address format:`, contractAddress)
      return NextResponse.json({ 
        error: 'Invalid contract address format',
        details: 'Contract address must be a valid Ethereum address',
        requestId
      }, { status: 500 })
    }

    // Step 1: Mint AIR Kit credential
    console.log(`[${requestId}] Starting AIR Kit credential minting...`)
    let airKitResult
    try {
      airKitResult = await mintDeveloperBadge(developer, {
        username: githubUsername,
        reputationScore: metrics.reputationScore,
        totalStars: metrics.totalStars,
        totalRepositories: metrics.totalRepositories,
      })
      console.log(`[${requestId}] AIR Kit credential result:`, airKitResult)
    } catch (airKitError) {
      console.error(`[${requestId}] AIR Kit credential failed:`, airKitError)
      return NextResponse.json({ 
        error: 'Failed to mint AIR Kit credential',
        details: airKitError instanceof Error ? airKitError.message : 'Unknown error',
        requestId
      }, { status: 500 })
    }

    if (!airKitResult.success) {
      console.error(`[${requestId}] AIR Kit credential unsuccessful:`, airKitResult.error)
      return NextResponse.json({ 
        error: 'AIR Kit credential issuance failed',
        details: airKitResult.error,
        requestId
      }, { status: 500 })
    }

    // Step 2: Get contract instance
    console.log(`[${requestId}] Getting contract instance...`)
    let contract
    try {
      const contractInstance = getServerWalletAndContract()
      contract = contractInstance.contract
      console.log(`[${requestId}] Contract instance created successfully`)
    } catch (contractError) {
      console.error(`[${requestId}] Contract instance creation failed:`, contractError)
      return NextResponse.json({ 
        error: 'Failed to create contract instance',
        details: contractError instanceof Error ? contractError.message : 'Unknown error',
        requestId,
        help: 'Check DEPLOYER_PRIVATE_KEY and MOCA_RPC_URL'
      }, { status: 500 })
    }

    // Step 3: Check if developer already has a profile
    console.log(`[${requestId}] Checking if developer already has a profile...`)
    let hasProfile = false
    let tokenId = null
    try {
      hasProfile = await contract.hasProfile(developer)
      if (hasProfile) {
        tokenId = await contract.walletToTokenId(developer)
        console.log(`[${requestId}] Developer already has profile, tokenId:`, tokenId.toString())
      }
    } catch (profileError) {
      console.warn(`[${requestId}] Could not check existing profile:`, profileError)
      // Continue with mint attempt
    }

    if (hasProfile) {
      const response = {
        success: true,
        message: 'Developer already has a Proof of Dev token',
        tokenId: tokenId!.toString(),
        airKitCredential: airKitResult.credential,
        contractAddress,
        mocaNetwork: {
          chainId: 222888,
          name: 'Moca Testnet',
          rpcUrl: process.env.MOCA_RPC_URL,
          explorerUrl: process.env.MOCA_EXPLORER_URL || 'https://testnet-explorer.mocachain.org/'
        },
        requestId,
        processingTime: Date.now() - startTime
      }
      console.log(`[${requestId}] === EXISTING PROFILE RETURNED ===`, response)
      return NextResponse.json(response)
    }

    // Step 4: Prepare profile data
    console.log(`[${requestId}] Preparing profile data...`)
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

    console.log(`[${requestId}] Profile data prepared:`, profile)

    // Step 5: Mint on blockchain
    console.log(`[${requestId}] Minting developer profile on blockchain...`)
    let tx
    try {
      tx = await contract.mintDeveloperProfile(developer, profile)
      console.log(`[${requestId}] Transaction submitted, hash:`, tx.hash)
    } catch (mintError) {
      console.error(`[${requestId}] Blockchain minting failed:`, mintError)
      return NextResponse.json({ 
        error: 'Blockchain minting failed',
        details: mintError instanceof Error ? mintError.message : 'Unknown error',
        requestId,
        help: 'Check contract address and deployer private key'
      }, { status: 500 })
    }
    
    console.log(`[${requestId}] Waiting for transaction confirmation...`)
    let receipt
    try {
      receipt = await tx.wait()
      console.log(`[${requestId}] Transaction confirmed:`, receipt)
    } catch (waitError) {
      console.error(`[${requestId}] Transaction confirmation failed:`, waitError)
      return NextResponse.json({ 
        error: 'Transaction confirmation failed',
        details: waitError instanceof Error ? waitError.message : 'Unknown error',
        txHash: tx.hash,
        requestId
      }, { status: 500 })
    }

    const response = {
      success: true,
      message: 'Credential minted successfully',
      txHash: receipt?.hash,
      airKitCredential: airKitResult.credential,
      contractAddress,
      mocaNetwork: {
        chainId: 222888,
        name: 'Moca Testnet',
        rpcUrl: process.env.MOCA_RPC_URL,
        explorerUrl: process.env.MOCA_EXPLORER_URL || 'https://testnet-explorer.mocachain.org/'
      },
      developer: {
        address: developer,
        githubUsername,
        reputationScore: metrics.reputationScore,
        totalStars: metrics.totalStars,
        totalRepositories: metrics.totalRepositories,
        topLanguages: metrics.topLanguages
      },
      requestId,
      processingTime: Date.now() - startTime
    }

    console.log(`[${requestId}] === MINT SUCCESS ===`, response)
    return NextResponse.json(response)
    
  } catch (e) {
    const err = e as unknown as { message?: string; stack?: string; constructor?: { name?: string } }
    console.error(`[${requestId}] === MINT ERROR ===`, e)
    console.error(`[${requestId}] Error message:`, err?.message)
    console.error(`[${requestId}] Error stack:`, err?.stack)
    
    return NextResponse.json({ 
      error: err?.message || 'Mint failed',
      details: err?.stack,
      type: err?.constructor?.name || 'Unknown',
      requestId,
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}