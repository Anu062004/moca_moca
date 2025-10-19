import { ethers } from 'ethers'

export const proofOfDevAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'developer', type: 'address' },
      {
        components: [
          { internalType: 'string', name: 'githubUsername', type: 'string' },
          { internalType: 'uint256', name: 'reputationScore', type: 'uint256' },
          { internalType: 'uint256', name: 'totalCommits', type: 'uint256' },
          { internalType: 'uint256', name: 'totalRepositories', type: 'uint256' },
          { internalType: 'uint256', name: 'totalStars', type: 'uint256' },
          { internalType: 'uint256', name: 'followers', type: 'uint256' },
          { internalType: 'uint256', name: 'accountAge', type: 'uint256' },
          { internalType: 'string[]', name: 'topLanguages', type: 'string[]' },
          { internalType: 'uint256', name: 'mintedAt', type: 'uint256' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
        ],
        internalType: 'struct ProofOfDev.DeveloperProfile',
        name: 'profile',
        type: 'tuple',
      },
    ],
    name: 'mintDeveloperProfile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'developer', type: 'address' }],
    name: 'getProfileByWallet',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'githubUsername', type: 'string' },
          { internalType: 'uint256', name: 'reputationScore', type: 'uint256' },
          { internalType: 'uint256', name: 'totalCommits', type: 'uint256' },
          { internalType: 'uint256', name: 'totalRepositories', type: 'uint256' },
          { internalType: 'uint256', name: 'totalStars', type: 'uint256' },
          { internalType: 'uint256', name: 'followers', type: 'uint256' },
          { internalType: 'uint256', name: 'accountAge', type: 'uint256' },
          { internalType: 'string[]', name: 'topLanguages', type: 'string[]' },
          { internalType: 'uint256', name: 'mintedAt', type: 'uint256' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
        ],
        internalType: 'struct ProofOfDev.DeveloperProfile',
        name: 'profile',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'developer', type: 'address' }],
    name: 'hasProfile',
    outputs: [{ internalType: 'bool', name: 'hasProfile', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'walletToTokenId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'developerProfiles',
    outputs: [
      { internalType: 'string', name: 'githubUsername', type: 'string' },
      { internalType: 'uint256', name: 'reputationScore', type: 'uint256' },
      { internalType: 'uint256', name: 'totalCommits', type: 'uint256' },
      { internalType: 'uint256', name: 'totalRepositories', type: 'uint256' },
      { internalType: 'uint256', name: 'totalStars', type: 'uint256' },
      { internalType: 'uint256', name: 'followers', type: 'uint256' },
      { internalType: 'uint256', name: 'accountAge', type: 'uint256' },
      { internalType: 'string[]', name: 'topLanguages', type: 'string[]' },
      { internalType: 'uint256', name: 'mintedAt', type: 'uint256' },
      { internalType: 'bool', name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'developer', type: 'address' }],
    name: 'hasProfile',
    outputs: [{ internalType: 'bool', name: 'hasProfile', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'githubUsername', type: 'string' }],
    name: 'getProfileByGitHub',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'githubUsername', type: 'string' },
          { internalType: 'uint256', name: 'reputationScore', type: 'uint256' },
          { internalType: 'uint256', name: 'totalCommits', type: 'uint256' },
          { internalType: 'uint256', name: 'totalRepositories', type: 'uint256' },
          { internalType: 'uint256', name: 'totalStars', type: 'uint256' },
          { internalType: 'uint256', name: 'followers', type: 'uint256' },
          { internalType: 'uint256', name: 'accountAge', type: 'uint256' },
          { internalType: 'string[]', name: 'topLanguages', type: 'string[]' },
          { internalType: 'uint256', name: 'mintedAt', type: 'uint256' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
        ],
        internalType: 'struct ProofOfDev.DeveloperProfile',
        name: 'profile',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: '', type: 'string' }],
    name: 'githubToTokenId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export function getProofOfDevContractAddress(): string {
  const address = process.env.PROOF_OF_DEV_CONTRACT_ADDRESS
  if (!address || address.length < 42) {
    throw new Error('PROOF_OF_DEV_CONTRACT_ADDRESS is not set')
  }
  return address
}

export function getServerWalletAndContract() {
  const rpcUrl = process.env.MOCA_RPC_URL || 'https://testnet-rpc.mocachain.org/'
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY
  if (!privateKey) throw new Error('DEPLOYER_PRIVATE_KEY missing')
  const provider = new ethers.JsonRpcProvider(rpcUrl, 222888)
  const wallet = new ethers.Wallet(privateKey, provider)
  const contract = new ethers.Contract(getProofOfDevContractAddress(), proofOfDevAbi, wallet)
  return { provider, wallet, contract }
}


