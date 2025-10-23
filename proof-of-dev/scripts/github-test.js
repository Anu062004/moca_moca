#!/usr/bin/env node

/**
 * GitHub Analysis API Test Script
 * Tests the GitHub analysis endpoint with various scenarios
 */

import fetch from 'node-fetch'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

interface TestCase {
  name: string
  username: string
  expectedStatus: number
  shouldSucceed: boolean
}

const testCases: TestCase[] = [
  {
    name: 'Valid GitHub User (octocat)',
    username: 'octocat',
    expectedStatus: 200,
    shouldSucceed: true
  },
  {
    name: 'Valid GitHub User (torvalds)',
    username: 'torvalds',
    expectedStatus: 200,
    shouldSucceed: true
  },
  {
    name: 'Non-existent User',
    username: 'this-user-definitely-does-not-exist-12345',
    expectedStatus: 404,
    shouldSucceed: false
  },
  {
    name: 'Invalid Username Format',
    username: 'invalid-username-with-special-chars!@#',
    expectedStatus: 400,
    shouldSucceed: false
  },
  {
    name: 'Empty Username',
    username: '',
    expectedStatus: 400,
    shouldSucceed: false
  }
]

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
  responseTime?: number
}

async function testGitHubAnalysis(username: string, expectedStatus: number, shouldSucceed: boolean): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    console.log(`🔍 Testing: ${username}`)
    
    const response = await fetch(`${API_BASE_URL}/api/analyze-github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    })

    const data = await response.json()
    const responseTime = Date.now() - startTime

    // Check HTTP status
    if (response.status !== expectedStatus) {
      return {
        name: `GitHub Analysis - ${username}`,
        passed: false,
        error: `Expected status ${expectedStatus}, got ${response.status}`,
        details: data,
        responseTime
      }
    }

    // Check response structure
    if (shouldSucceed) {
      if (!data.success) {
        return {
          name: `GitHub Analysis - ${username}`,
          passed: false,
          error: `Expected success=true, got ${data.success}`,
          details: data,
          responseTime
        }
      }

      if (!data.metrics) {
        return {
          name: `GitHub Analysis - ${username}`,
          passed: false,
          error: 'Expected metrics in response',
          details: data,
          responseTime
        }
      }

      // Validate metrics structure
      const requiredMetrics = [
        'reputationScore', 'totalRepositories', 'totalStars', 
        'followers', 'accountAge', 'languages'
      ]

      const missingMetrics = requiredMetrics.filter(metric => !(metric in data.metrics))
      if (missingMetrics.length > 0) {
        return {
          name: `GitHub Analysis - ${username}`,
          passed: false,
          error: `Missing required metrics: ${missingMetrics.join(', ')}`,
          details: data,
          responseTime
        }
      }

      return {
        name: `GitHub Analysis - ${username}`,
        passed: true,
        details: {
          reputationScore: data.metrics.reputationScore,
          totalRepositories: data.metrics.totalRepositories,
          totalStars: data.metrics.totalStars,
          followers: data.metrics.followers,
          responseTime
        }
      }
    } else {
      // For error cases, check that success is false
      if (data.success !== false) {
        return {
          name: `GitHub Analysis - ${username}`,
          passed: false,
          error: `Expected success=false for error case, got ${data.success}`,
          details: data,
          responseTime
        }
      }

      return {
        name: `GitHub Analysis - ${username}`,
        passed: true,
        details: {
          error: data.error,
          responseTime
        }
      }
    }
  } catch (error) {
    return {
      name: `GitHub Analysis - ${username}`,
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    }
  }
}

async function testAuthentication(): Promise<TestResult> {
  try {
    console.log('🔐 Testing authentication...')
    
    const response = await fetch(`${API_BASE_URL}/api/analyze-github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'octocat' }),
    })

    const data = await response.json()

    if (response.status === 401) {
      return {
        name: 'Authentication Test',
        passed: true,
        details: {
          message: 'Authentication required (expected)',
          error: data.error
        }
      }
    }

    if (response.status === 200 && data.success) {
      return {
        name: 'Authentication Test',
        passed: true,
        details: {
          message: 'Already authenticated',
          metrics: data.metrics
        }
      }
    }

    return {
      name: 'Authentication Test',
      passed: false,
      error: `Unexpected response: ${response.status}`,
      details: data
    }
  } catch (error) {
    return {
      name: 'Authentication Test',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function runGitHubTests() {
  console.log('🧪 GitHub Analysis API Test Suite')
  console.log('==================================')
  console.log(`API Base URL: ${API_BASE_URL}`)
  console.log('')

  const results: TestResult[] = []

  // Test authentication first
  results.push(await testAuthentication())

  // Test each case
  for (const testCase of testCases) {
    results.push(await testGitHubAnalysis(
      testCase.username,
      testCase.expectedStatus,
      testCase.shouldSucceed
    ))
  }

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
      if (result.details.reputationScore !== undefined) {
        console.log(`   Reputation Score: ${result.details.reputationScore}`)
        console.log(`   Repositories: ${result.details.totalRepositories}`)
        console.log(`   Stars: ${result.details.totalStars}`)
        console.log(`   Followers: ${result.details.followers}`)
      }
      if (result.details.responseTime) {
        console.log(`   Response Time: ${result.details.responseTime}ms`)
      }
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
    console.log('🎉 All tests passed! GitHub analysis is working correctly.')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.')
    console.log('\nTroubleshooting:')
    console.log('1. Make sure the development server is running: npm run dev')
    console.log('2. Check GitHub OAuth configuration in .env.local')
    console.log('3. Verify GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are set')
    console.log('4. Test authentication by signing in through the web interface')
    process.exit(1)
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('GitHub Analysis API Test Suite')
  console.log('')
  console.log('Usage:')
  console.log('  node github-test.js [options]')
  console.log('')
  console.log('Options:')
  console.log('  --url <url>    API base URL (default: http://localhost:3000)')
  console.log('  --help, -h     Show this help message')
  console.log('')
  console.log('Environment Variables:')
  console.log('  API_BASE_URL   Override API base URL')
  console.log('')
  console.log('Prerequisites:')
  console.log('  1. Development server running: npm run dev')
  console.log('  2. GitHub OAuth configured in .env.local')
  console.log('  3. User authenticated through web interface')
  console.log('')
  process.exit(0)
}

const urlIndex = process.argv.indexOf('--url')
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
  process.env.API_BASE_URL = process.argv[urlIndex + 1]
}

// Run the test suite
runGitHubTests().catch(error => {
  console.error('💥 Test suite failed:', error)
  process.exit(1)
})
