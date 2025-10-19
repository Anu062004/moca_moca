import fs from 'fs'
import path from 'path'
import url from 'url'
import solc from 'solc'
import { config as env } from 'dotenv'
import { ethers } from 'ethers'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const contractsDir = path.join(root, 'contracts')

env({ path: path.join(root, '.env.local') })

const MOCA_RPC_URL = process.env.MOCA_RPC_URL || process.argv[3] || 'https://rpc.testnet.moca.network'
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.argv[2]

if (!DEPLOYER_PRIVATE_KEY) {
  console.error('DEPLOYER_PRIVATE_KEY is missing (set in .env.local or pass as argv)')
  process.exit(1)
}

function findImports(importPath) {
  try {
    // Support node_modules resolution (e.g., @openzeppelin/...)
    const nmPath = path.resolve(root, 'node_modules', importPath)
    if (fs.existsSync(nmPath)) {
      return { contents: fs.readFileSync(nmPath, 'utf8') }
    }
    const relPath = path.resolve(contractsDir, '..', importPath)
    if (fs.existsSync(relPath)) {
      return { contents: fs.readFileSync(relPath, 'utf8') }
    }
    return { error: 'File not found: ' + importPath }
  } catch (e) {
    return { error: e.message }
  }
}

function compile() {
  const source = fs.readFileSync(path.join(contractsDir, 'ProofOfDev.sol'), 'utf8')
  const input = {
    language: 'Solidity',
    sources: { 'ProofOfDev.sol': { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
    },
  }
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }))
  if (output.errors) {
    const hasError = output.errors.some((e) => e.severity === 'error')
    output.errors.forEach((e) => console.log(e.formattedMessage || e.message))
    if (hasError) throw new Error('Compilation failed')
  }
  const contract = output.contracts['ProofOfDev.sol']['ProofOfDev']
  return { abi: contract.abi, bytecode: '0x' + contract.evm.bytecode.object }
}

async function main() {
  const { abi, bytecode } = compile()
  const provider = new ethers.JsonRpcProvider(MOCA_RPC_URL, 222888)
  const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider)

  const factory = new ethers.ContractFactory(abi, bytecode, wallet)
  const contract = await factory.deploy()
  await contract.waitForDeployment()
  const address = await contract.getAddress()
  console.log('Deployed ProofOfDev to:', address)

  const envPath = path.join(root, '.env.local')
  try {
    const orig = fs.readFileSync(envPath, 'utf8')
    const next = orig.match(/PROOF_OF_DEV_CONTRACT_ADDRESS=/)
      ? orig.replace(/PROOF_OF_DEV_CONTRACT_ADDRESS=.*/g, `PROOF_OF_DEV_CONTRACT_ADDRESS=${address}`)
      : `${orig}\nPROOF_OF_DEV_CONTRACT_ADDRESS=${address}\n`
    fs.writeFileSync(envPath, next)
    console.log('Updated .env.local with contract address')
  } catch (e) {
    console.warn('Could not update .env.local automatically:', e?.message)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
