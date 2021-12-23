const constants = require('./constants.js')
var cron = require('node-cron')

var ethers = require('ethers')
const { default: axios } = require('axios')
let LAST_PROCESSED_BLOCK_BY_CHAINID = {
  137: process.env.MATIC_START,
  1: process.env.ETH_START,
  43114: process.env.ETH_START,
}

const MaticProvider = new ethers.providers.JsonRpcProvider(
  constants.RPC_URL[constants.NAME_TO_CHAINID['poly']],
)
const EthProvider = new ethers.providers.JsonRpcProvider(
  constants.RPC_URL[constants.NAME_TO_CHAINID['eth']],
)
const AvaProvider = new ethers.providers.JsonRpcProvider(
  constants.RPC_URL[constants.NAME_TO_CHAINID['ava']],
)
const PROVIDERS = {
  137: MaticProvider,
  1: EthProvider,
  43114: AvaProvider,
}

async function main() {
  // fetch all hyphen processed txs by fundmovr on all chains where its deployed
  // return pending txs along with source-chain-id
  for (const chainID of constants.supportedChainIDs) {
    await fetchHyphenPendingTxs(chainID)
  }
}

async function fetchHyphenPendingTxs(chainID) {
  console.log('******************** processing for chainID', chainID)
  const startBlock = LAST_PROCESSED_BLOCK_BY_CHAINID[chainID]
  const currentBlock = await getCurrentBlock(chainID)
  console.log('current block', currentBlock)
  if (currentBlock - startBlock < constants.CONFIRMATIONS[chainID]) {
    console.log('expected conf', constants.CONFIRMATIONS[chainID])
    console.log('not enough confs')
    return
  }

  console.log('confs done')
  const endBlock = currentBlock - constants.CONFIRMATIONS[chainID]
  console.log('end block', endBlock)

  // if enough blocks have happend since last sync, lets sync all fund movr events
  const fmContract = new ethers.Contract(
    constants.FM_ADDRESSES[chainID],
    constants.FundMovrABI,
    PROVIDERS[chainID],
  )
  console.log('vars', typeof startBlock, typeof endBlock)

  const logs = await fmContract.queryFilter(
    fmContract.filters.ExecutionCompleted,
    parseInt(startBlock),
    parseInt(endBlock),
  )

  console.log('Logs found', 'count', logs.length)

  for (const log of logs) {
    if (log.args.bridgeID == constants.HYPHEN_ID[chainID]) {
      console.log(
        'Hyphen tx found, attempting manual execution',
        log.transactionHash,
      )
      tryHyphen(chainID, log.transactionHash)
    }
  }

  LAST_PROCESSED_BLOCK_BY_CHAINID[chainID] = endBlock
}

async function tryHyphen(chainID, sourceTxHash) {
  const resp = await axios.post(constants.HYPHEN_PROCESS_TX_URL, {
    depositHash: sourceTxHash,
    fromChainId: chainID,
  })
  console.log('Response', resp.data)
}

async function getCurrentBlock(chainID) {
  const currentBlock = await PROVIDERS[chainID].getBlock('latest')
  return currentBlock.number
}

cron.schedule('*/15 * * * *', () => {
  main()
})
