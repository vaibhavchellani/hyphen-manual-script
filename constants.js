const ethers = require('ethers')

const FundMovrABI = [
  'event ExecutionCompleted(uint256 middlewareID,uint256 bridgeID,uint256 inputAmount);',
]
const HYPHEN_PROCESS_TX_URL =
  'https://hyphen-api.biconomy.io/api/v1/insta-exit/execute'
const WATCHER_API_BASE_URL = 'https://watcherapi.fund.movr.network/api/v1/'

const CONFIRMATIONS = {
  137: 150,
  1: 20,
  43114: 150,
}

const NAME_TO_CHAINID = {
  eth: 1,
  ava: 43114,
  poly: 137,
}

const HYPHEN_ID = {
  137: 3,
  1: 5,
  43114: 2,
}

const RPC_URL = {
  137: process.env.MATIC_RPC,
  1: process.env.ETH_RPC,
  43114: process.env.AVA_RPC,
}

const FM_ADDRESSES = {
  137: '0xc30141B657f4216252dc59Af2e7CdB9D8792e1B0',
  1: '0xc30141B657f4216252dc59Af2e7CdB9D8792e1B0',
  43114: '0x2b42AFFD4b7C14d9B7C2579229495c052672Ccd3',
}

const supportedChainIDs = [137, 1, 43114]
module.exports = {
  FundMovrABI,
  supportedChainIDs,
  HYPHEN_PROCESS_TX_URL,
  WATCHER_API_BASE_URL,
  CONFIRMATIONS,
  NAME_TO_CHAINID,
  FM_ADDRESSES,
  HYPHEN_ID,
  RPC_URL,
}
