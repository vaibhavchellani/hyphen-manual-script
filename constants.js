const ethers = require('ethers')
const FundMovrABI = [
  'event ExecutionCompleted(uint256 middlewareID,uint256 bridgeID,uint256 inputAmount);',
]
const POLLING_INTERVAL = 10
const HYPHEN_PROCESS_TX_URL =
  'https://hyphen-api.biconomy.io/api/v1/insta-exit/execute'
const WATCHER_API_BASE_URL = 'https://watcherapi.fund.movr.network/api/v1/'
const CONFIRMATIONS = {
  137: 800,
  1: 150,
  43114: 800,
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
  137: 'https://little-bold-bush.matic.quiknode.pro/2b2c0d5ac8705ad40ba2fbbab49269f97ebb9b33/',
  1: 'https://cold-dark-dew.quiknode.pro/9d8b1502b9e2ae1b3fbe2cbac8a670ee44708c34/',
  43114: 'https://speedy-nodes-nyc.moralis.io/32a97bb2a32db2f4f81e80b2/avalanche/mainnet',
}

const FM_ADDRESSES = {
  137: '0xc30141B657f4216252dc59Af2e7CdB9D8792e1B0',
  1: '0xc30141B657f4216252dc59Af2e7CdB9D8792e1B0',
  43114: '0x2b42AFFD4b7C14d9B7C2579229495c052672Ccd3',
}

const supportedChainIDs = [137, 1, 43114]
module.exports = {
  FundMovrABI,
  POLLING_INTERVAL,
  supportedChainIDs,
  HYPHEN_PROCESS_TX_URL,
  WATCHER_API_BASE_URL,
  CONFIRMATIONS,
  NAME_TO_CHAINID,
  FM_ADDRESSES,
  HYPHEN_ID,
  RPC_URL,
}
