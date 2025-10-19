import { ethers } from 'hardhat'
import fs from 'fs'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

async function main() {
  const ProofOfDev = await ethers.getContractFactory('ProofOfDev')
  const contract = await ProofOfDev.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  console.log('ProofOfDev deployed to:', address)

  const envPath = path.resolve(__dirname, '..', '.env.local')
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

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})

