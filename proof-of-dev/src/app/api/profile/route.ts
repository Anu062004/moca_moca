import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { proofOfDevAbi, getProofOfDevContractAddress } from '@/lib/contract'
import { verifyDeveloperIdentity } from '@/lib/airkit'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('address') || searchParams.get('github') || searchParams.get('q')
    if (!query) return NextResponse.json({ error: 'Search query required' }, { status: 400 })

    // Validate environment variables
    if (!process.env.PROOF_OF_DEV_CONTRACT_ADDRESS) {
      return NextResponse.json({ error: 'Contract not deployed' }, { status: 500 })
    }

    const rpcUrl = process.env.MOCA_RPC_URL || 'https://testnet-rpc.mocachain.org/'
    const provider = new ethers.JsonRpcProvider(rpcUrl, 222888)
    const contract = new ethers.Contract(getProofOfDevContractAddress(), proofOfDevAbi, provider)
    
    let profile
    let walletAddress
    
    // Check if query is a wallet address or GitHub username
    const isAddress = /^0x[a-fA-F0-9]{40}$/.test(query)
    
    if (isAddress) {
      // Search by wallet address
      console.log('Searching by wallet address:', query)
      const hasProfile = await contract.hasProfile(query)
      if (!hasProfile) {
        return NextResponse.json({ error: 'Profile not found for this wallet address' }, { status: 404 })
      }
      profile = await contract.getProfileByWallet(query)
      walletAddress = query
    } else {
      // Search by GitHub username
      // Remove @ symbol if present
      const cleanUsername = query.startsWith('@') ? query.slice(1) : query
      console.log('Searching by GitHub username:', cleanUsername)
      try {
        // First check if the GitHub username exists
        const tokenId = await contract.githubToTokenId(cleanUsername)
        console.log('Token ID for GitHub username:', tokenId.toString())
        
        if (tokenId.toString() === '0') {
          return NextResponse.json({ error: 'Profile not found for this GitHub username' }, { status: 404 })
        }
        
        // Get the profile
        profile = await contract.getProfileByGitHub(cleanUsername)
        console.log('Profile found:', profile.githubUsername)
        
        // For now, we'll return the profile without wallet address
        walletAddress = 'Unknown' // We'll need to implement a reverse lookup
      } catch (githubError) {
        console.log('GitHub search failed:', githubError.message)
        return NextResponse.json({ error: 'Profile not found for this GitHub username' }, { status: 404 })
      }
    }

    // Get AIR Kit identity verification
    const airKitIdentity = await verifyDeveloperIdentity(walletAddress)

    // Convert BigInt values to strings for JSON serialization
    const serializedProfile = {
      githubUsername: profile.githubUsername,
      reputationScore: profile.reputationScore.toString(),
      totalCommits: profile.totalCommits.toString(),
      totalRepositories: profile.totalRepositories.toString(),
      totalStars: profile.totalStars.toString(),
      followers: profile.followers.toString(),
      accountAge: profile.accountAge.toString(),
      topLanguages: profile.topLanguages,
      mintedAt: profile.mintedAt.toString(),
      isActive: profile.isActive,
      walletAddress: walletAddress,
      airKitIdentity: {
        verified: airKitIdentity.verified,
        reputation: airKitIdentity.reputation,
        badges: airKitIdentity.badges,
      },
      contractAddress: process.env.PROOF_OF_DEV_CONTRACT_ADDRESS,
      mocaNetwork: {
        chainId: 222888,
        name: 'Moca Testnet',
        rpcUrl: process.env.MOCA_RPC_URL,
        explorerUrl: process.env.MOCA_EXPLORER_URL
      }
    }

    return NextResponse.json({ 
      profile: serializedProfile
    })
  } catch (e: any) {
    console.error('Profile read error:', e)
    return NextResponse.json({ 
      error: e?.message || 'Failed',
      details: e?.stack
    }, { status: 500 })
  }
}


