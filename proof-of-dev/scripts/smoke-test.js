#!/usr/bin/env node

/**
 * Proof of Dev Wave 3 - Smoke Test
 * Tests the mint API with sample data to verify end-to-end functionality
 */

import fetch from 'node-fetch'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
const TEST_DEVELOPER_ADDRESS = '0x1234567890123456789012345678901234567890'
const TEST_GITHUB_USERNAME = 'test-developer'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

async function testDiagnostics(): Promise<TestResult> {
  try {
    console.log('🔍 Testing diagnostics endpoint...')
    const response = await fetch(`${API_BASE_URL}/api/diagnostics`)
    const data = await response.json()

    if (!response.ok) {
      return {
        name: 'Diagnostics API',
        passed: false,
        error: `HTTP ${response.status}: ${data.error || 'Unknown error'}`
      }
    }

    if (!data.success) {
      return {
        name: 'Diagnostics API',
        passed: false,
        error: data.error || 'Diagnostics failed'
      }
    }

    const { diagnostics } = data
    const missingRequired = diagnostics.environment.checks.filter(
      (c: any) => c.required && (c.status === 'missing' || c.status === 'placeholder')
    )

    if (missingRequired.length > 0) {
      return {
        name: 'Diagnostics API',
        passed: false,
        error: `Missing required environment variables: ${missingRequired.map((c: any) => c.name).join(', ')}`,
        details: missingRequired
      }
    }

    return {
      name: 'Diagnostics API',
      passed: true,
      details: {
        status: diagnostics.status,
        environment: diagnostics.environment.summary,
        network: diagnostics.network,
        airkit: diagnostics.airkit
      }
    }
  } catch (error) {
    return {
      name: 'Diagnostics API',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testMintAPI(): Promise<TestResult> {
  try {
    console.log('🚀 Testing mint API...')
    
    const testPayload = {
      developer: TEST_DEVELOPER_ADDRESS,
      githubUsername: TEST_GITHUB_USERNAME,
      metrics: {
        reputationScore: 85,
        totalCommits: 150,
        totalRepositories: 12,
        totalStars: 45,
        followers: 23,
        accountAge: 730, // 2 years
        topLanguages: ['JavaScript', 'TypeScript', 'Python', 'Solidity']
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        name: 'Mint API',
        passed: false,
        error: `HTTP ${response.status}: ${data.error || 'Unknown error'}`,
        details: data
      }
    }

    if (!data.success) {
      return {
        name: 'Mint API',
        passed: false,
        error: data.error || 'Mint failed',
        details: data
      }
    }

    // Validate response structure
    const requiredFields = ['success', 'txHash', 'airKitCredential', 'contractAddress', 'mocaNetwork']
    const missingFields = requiredFields.filter(field => !(field in data))

    if (missingFields.length > 0) {
      return {
        name: 'Mint API',
        passed: false,
        error: `Missing required fields in response: ${missingFields.join(', ')}`,
        details: data
      }
    }

    return {
      name: 'Mint API',
      passed: true,
      details: {
        txHash: data.txHash,
        contractAddress: data.contractAddress,
        airKitCredential: data.airKitCredential?.id,
        processingTime: data.processingTime,
        requestId: data.requestId
      }
    }
  } catch (error) {
    return {
      name: 'Mint API',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testMintSimpleAPI(): Promise<TestResult> {
  try {
    console.log('🔧 Testing mint-simple API...')
    
    const testPayload = {
      developer: TEST_DEVELOPER_ADDRESS,
      githubUsername: TEST_GITHUB_USERNAME,
      metrics: {
        reputationScore: 75,
        totalCommits: 100,
        totalRepositories: 8,
        totalStars: 30,
        followers: 15,
        accountAge: 365, // 1 year
        topLanguages: ['JavaScript', 'TypeScript']
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/mint-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        name: 'Mint Simple API',
        passed: false,
        error: `HTTP ${response.status}: ${data.error || 'Unknown error'}`,
        details: data
      }
    }

    if (!data.success) {
      return {
        name: 'Mint Simple API',
        passed: false,
        error: data.error || 'Mint failed',
        details: data
      }
    }

    return {
      name: 'Mint Simple API',
      passed: true,
      details: {
        credential: data.credential?.id,
        developer: data.developer,
        timestamp: data.timestamp
      }
    }
  } catch (error) {
    return {
      name: 'Mint Simple API',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function runSmokeTest() {
  console.log('🧪 Proof of Dev Wave 3 - Smoke Test')
  console.log('====================================')
  console.log(`API Base URL: ${API_BASE_URL}`)
  console.log(`Test Developer: ${TEST_DEVELOPER_ADDRESS}`)
  console.log(`Test GitHub: ${TEST_GITHUB_USERNAME}`)
  console.log('')

  const results: TestResult[] = []

  // Test diagnostics
  results.push(await testDiagnostics())

  // Test mint-simple API (doesn't require blockchain)
  results.push(await testMintSimpleAPI())

  // Test full mint API (requires blockchain setup)
  results.push(await testMintAPI())

  // Print results
  console.log('\n📊 Test Results')
  console.log('================')

  let passed = 0
  let failed = 0

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${result.name}`)
    
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
    
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
    }
    
    console.log('')

    if (result.passed) {
      passed++
    } else {
      failed++
    }
  })

  console.log(`Summary: ${passed} passed, ${failed} failed`)

  if (failed === 0) {
    console.log('🎉 All tests passed! System is ready for minting.')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests failed. Check configuration and try again.')
    process.exit(1)
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Proof of Dev Wave 3 - Smoke Test')
  console.log('')
  console.log('Usage:')
  console.log('  node smoke-test.js [options]')
  console.log('')
  console.log('Options:')
  console.log('  --url <url>    API base URL (default: http://localhost:3000)')
  console.log('  --help, -h     Show this help message')
  console.log('')
  console.log('Environment Variables:')
  console.log('  API_BASE_URL   Override API base URL')
  console.log('')
  process.exit(0)
}

const urlIndex = process.argv.indexOf('--url')
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
  process.env.API_BASE_URL = process.argv[urlIndex + 1]
}

// Run the smoke test
runSmokeTest().catch(error => {
  console.error('💥 Smoke test failed:', error)
  process.exit(1)
})
