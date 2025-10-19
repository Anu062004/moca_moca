import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import * as dotenv from 'dotenv'

dotenv.config()

const MOCA_RPC_URL = process.env.MOCA_RPC_URL || 'https://rpc.testnet.moca.network'
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || ''

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.19',
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    moca: {
      url: MOCA_RPC_URL,
      chainId: 222888,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './.hardhat_cache',
    artifacts: './artifacts',
  },
}

export default config

