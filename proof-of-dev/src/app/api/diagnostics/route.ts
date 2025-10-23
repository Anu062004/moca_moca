import { NextRequest, NextResponse } from 'next/server'

interface EnvironmentCheck {
  name: string
  value: string | undefined
  required: boolean
  status: 'present' | 'missing' | 'placeholder' | 'invalid'
  message: string
}

interface SystemDiagnostics {
  timestamp: string
  requestId: string
  environment: {
    nodeEnv: string
    checks: EnvironmentCheck[]
    summary: {
      total: number
      required: number
      missing: number
      warnings: number
    }
  }
  network: {
    mocaRpc: {
      url: string
      reachable: boolean
      error?: string
    }
    contract: {
      address: string
      valid: boolean
      deployed: boolean
      error?: string
    }
  }
  airkit: {
    configured: boolean
    partnerId: string
    apiKey: string
    baseUrl: string
  }
  recommendations: string[]
  nextSteps: string[]
}

async function checkEnvironmentVariables(): Promise<EnvironmentCheck[]> {
  const checks: EnvironmentCheck[] = [
    {
      name: 'NEXTAUTH_URL',
      value: process.env.NEXTAUTH_URL,
      required: true,
      status: process.env.NEXTAUTH_URL ? 'present' : 'missing',
      message: process.env.NEXTAUTH_URL ? 'Set' : 'Required for authentication'
    },
    {
      name: 'NEXTAUTH_SECRET',
      value: process.env.NEXTAUTH_SECRET ? '***' : undefined,
      required: true,
      status: process.env.NEXTAUTH_SECRET ? 'present' : 'missing',
      message: process.env.NEXTAUTH_SECRET ? 'Set' : 'Required for session security'
    },
    {
      name: 'GITHUB_CLIENT_ID',
      value: process.env.GITHUB_CLIENT_ID ? '***' : undefined,
      required: false,
      status: process.env.GITHUB_CLIENT_ID ? 'present' : 'missing',
      message: process.env.GITHUB_CLIENT_ID ? 'Set' : 'Required for GitHub OAuth'
    },
    {
      name: 'GITHUB_CLIENT_SECRET',
      value: process.env.GITHUB_CLIENT_SECRET ? '***' : undefined,
      required: false,
      status: process.env.GITHUB_CLIENT_SECRET ? 'present' : 'missing',
      message: process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Required for GitHub OAuth'
    },
    {
      name: 'AIRKIT_PARTNER_ID',
      value: process.env.AIRKIT_PARTNER_ID,
      required: true,
      status: process.env.AIRKIT_PARTNER_ID ? 'present' : 'missing',
      message: process.env.AIRKIT_PARTNER_ID ? 'Set' : 'Required for AIR Kit credentials'
    },
    {
      name: 'AIRKIT_API_KEY',
      value: process.env.AIRKIT_API_KEY ? '***' : undefined,
      required: true,
      status: process.env.AIRKIT_API_KEY ? 'present' : 'missing',
      message: process.env.AIRKIT_API_KEY ? 'Set' : 'Required for AIR Kit credentials'
    },
    {
      name: 'MOCA_RPC_URL',
      value: process.env.MOCA_RPC_URL,
      required: true,
      status: process.env.MOCA_RPC_URL ? 'present' : 'missing',
      message: process.env.MOCA_RPC_URL ? 'Set' : 'Required for blockchain operations'
    },
    {
      name: 'PROOF_OF_DEV_CONTRACT_ADDRESS',
      value: process.env.PROOF_OF_DEV_CONTRACT_ADDRESS,
      required: true,
      status: process.env.PROOF_OF_DEV_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000' ? 'placeholder' : 
              process.env.PROOF_OF_DEV_CONTRACT_ADDRESS ? 'present' : 'missing',
      message: process.env.PROOF_OF_DEV_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000' ? 
               'Placeholder - deploy contract first' : 
               process.env.PROOF_OF_DEV_CONTRACT_ADDRESS ? 'Set' : 'Required for blockchain operations'
    },
    {
      name: 'DEPLOYER_PRIVATE_KEY',
      value: process.env.DEPLOYER_PRIVATE_KEY ? '***' : undefined,
      required: true,
      status: process.env.DEPLOYER_PRIVATE_KEY ? 'present' : 'missing',
      message: process.env.DEPLOYER_PRIVATE_KEY ? 'Set' : 'Required for contract operations'
    },
    {
      name: 'MOCA_EXPLORER_URL',
      value: process.env.MOCA_EXPLORER_URL,
      required: false,
      status: process.env.MOCA_EXPLORER_URL ? 'present' : 'missing',
      message: process.env.MOCA_EXPLORER_URL ? 'Set' : 'Optional - for transaction links'
    },
    {
      name: 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
      value: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? '***' : undefined,
      required: false,
      status: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? 'present' : 'missing',
      message: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? 'Set' : 'Optional - for wallet connection'
    }
  ]

  // Validate contract address format
  const contractAddress = process.env.PROOF_OF_DEV_CONTRACT_ADDRESS
  if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
    if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      const contractCheck = checks.find(c => c.name === 'PROOF_OF_DEV_CONTRACT_ADDRESS')
      if (contractCheck) {
        contractCheck.status = 'invalid'
        contractCheck.message = 'Invalid format - must be valid Ethereum address'
      }
    }
  }

  return checks
}

async function checkNetworkConnectivity(): Promise<{ url: string; reachable: boolean; error?: string }> {
  const rpcUrl = process.env.MOCA_RPC_URL
  if (!rpcUrl) {
    return { url: 'Not set', reachable: false, error: 'MOCA_RPC_URL not configured' }
  }

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1
      }),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })

    if (response.ok) {
      const data = await response.json()
      return { url: rpcUrl, reachable: true }
    } else {
      return { url: rpcUrl, reachable: false, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    return { 
      url: rpcUrl, 
      reachable: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

async function checkContractDeployment(): Promise<{ address: string; valid: boolean; deployed: boolean; error?: string }> {
  const address = process.env.PROOF_OF_DEV_CONTRACT_ADDRESS
  
  if (!address) {
    return { address: 'Not set', valid: false, deployed: false, error: 'Contract address not configured' }
  }

  if (address === '0x0000000000000000000000000000000000000000') {
    return { address, valid: true, deployed: false, error: 'Placeholder address - contract not deployed' }
  }

  const isValid = address.startsWith('0x') && address.length === 42
  if (!isValid) {
    return { address, valid: false, deployed: false, error: 'Invalid address format' }
  }

  // Try to check if contract exists (simplified check)
  try {
    const rpcUrl = process.env.MOCA_RPC_URL
    if (!rpcUrl) {
      return { address, valid: true, deployed: false, error: 'Cannot verify - RPC URL not set' }
    }

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getCode',
        params: [address, 'latest'],
        id: 1
      }),
      signal: AbortSignal.timeout(5000)
    })

    if (response.ok) {
      const data = await response.json()
      const code = data.result
      const deployed = code && code !== '0x'
      return { address, valid: true, deployed, error: deployed ? undefined : 'No code at address' }
    } else {
      return { address, valid: true, deployed: false, error: `RPC error: ${response.status}` }
    }
  } catch (error) {
    return { 
      address, 
      valid: true, 
      deployed: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    console.log(`[${requestId}] Running comprehensive diagnostics...`)

    // Check environment variables
    const envChecks = await checkEnvironmentVariables()
    const requiredChecks = envChecks.filter(c => c.required)
    const missingRequired = requiredChecks.filter(c => c.status === 'missing' || c.status === 'placeholder')
    const warnings = envChecks.filter(c => !c.required && c.status === 'missing')

    // Check network connectivity
    const networkCheck = await checkNetworkConnectivity()

    // Check contract deployment
    const contractCheck = await checkContractDeployment()

    // Generate recommendations
    const recommendations: string[] = []
    const nextSteps: string[] = []

    if (missingRequired.length > 0) {
      recommendations.push(`Missing ${missingRequired.length} required environment variables`)
      missingRequired.forEach(check => {
        recommendations.push(`- Set ${check.name}: ${check.message}`)
      })
    }

    if (warnings.length > 0) {
      recommendations.push(`${warnings.length} optional variables not set`)
    }

    if (!networkCheck.reachable) {
      recommendations.push(`Moca RPC not reachable: ${networkCheck.error}`)
    }

    if (!contractCheck.deployed) {
      recommendations.push(`Contract not deployed: ${contractCheck.error}`)
      nextSteps.push('Run: npm run hh:deploy:moca')
    }

    if (missingRequired.length === 0 && networkCheck.reachable && contractCheck.deployed) {
      recommendations.push('✅ All systems ready for minting!')
      nextSteps.push('Test minting in the app')
    } else {
      nextSteps.push('Fix environment configuration')
      nextSteps.push('Restart development server')
    }

    const diagnostics: SystemDiagnostics = {
      timestamp: new Date().toISOString(),
      requestId,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        checks: envChecks,
        summary: {
          total: envChecks.length,
          required: requiredChecks.length,
          missing: missingRequired.length,
          warnings: warnings.length
        }
      },
      network: {
        mocaRpc: networkCheck,
        contract: contractCheck
      },
      airkit: {
        configured: !!(process.env.AIRKIT_PARTNER_ID && process.env.AIRKIT_API_KEY),
        partnerId: process.env.AIRKIT_PARTNER_ID || 'Not set',
        apiKey: process.env.AIRKIT_API_KEY ? 'Set' : 'Not set',
        baseUrl: process.env.AIRKIT_BASE_URL || 'https://air.api.air3.com/v2'
      },
      recommendations,
      nextSteps
    }

    const processingTime = Date.now() - startTime
    console.log(`[${requestId}] Diagnostics completed in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      diagnostics,
      processingTime,
      status: missingRequired.length === 0 && networkCheck.reachable && contractCheck.deployed ? 'ready' : 'needs_configuration'
    })

  } catch (error) {
    console.error(`[${requestId}] Diagnostics error:`, error)
    return NextResponse.json({
      success: false,
      error: 'Diagnostics failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId,
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}