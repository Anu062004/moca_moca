import { ethers } from 'hardhat'
import fs from 'fs'
import path from 'path'

async function main() {
  const ProofOfDev = await ethers.getContractFactory('ProofOfDev')
  const contract = await ProofOfDev.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  console.log('ProofOfDev deployed to:', address)

  // Update .env.local
  const envPath = path.resolve(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const orig = fs.readFileSync(envPath, 'utf8')
    const withAddr = orig.match(/PROOF_OF_DEV_CONTRACT_ADDRESS=/)
      ? orig.replace(/PROOF_OF_DEV_CONTRACT_ADDRESS=.*/g, `PROOF_OF_DEV_CONTRACT_ADDRESS=${address}`)
      : orig + `\nPROOF_OF_DEV_CONTRACT_ADDRESS=${address}\n`
    fs.writeFileSync(envPath, withAddr)
    console.log('Updated .env.local with contract address')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})


