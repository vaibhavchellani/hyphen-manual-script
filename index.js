const constants = require('./constants.js')
var cron = require('node-cron')

var ethers = require('ethers')
const { default: axios } = require('axios')

let LAST_PROCESSED_BLOCK_BY_CHAINID = {
  137: process.env.MATIC_START,
  1: process.env.ETH_START,
  43114: process.env.AVA_START,
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
var isValidated = false

// checks if last processed vars via env are less than
// 10k blocks old, as we dont have access to logs older than 10k
async function validateLastProcessed() {
  console.log('Trying to validate last processed')
  if (isValidated) return
  for (const chainID of constants.supportedChainIDs) {
    const lastProcessed = LAST_PROCESSED_BLOCK_BY_CHAINID[chainID]
    const currentBlock = await getCurrentBlock(chainID)
    if (currentBlock - lastProcessed >= 10000)
      console.log(
        'Had to update env var for chainID',
        chainID,
        'prev',
        lastProcessed,
        'newLastProcessed',
        currentBlock - 999,
      )
    LAST_PROCESSED_BLOCK_BY_CHAINID[chainID] = currentBlock - 9999
  }
  // to make sure this only runs on the first attempt
  isValidated = true
}

async function main() {
  await validateLastProcessed()

  // fetch all hyphen processed txs by fundmovr on all chains where its deployed
  // return pending txs along with source-chain-id
  for (const chainID of constants.supportedChainIDs) {
    await fetchHyphenPendingTxs(chainID)
  }
}

async function fetchHyphenPendingTxs(chainID) {
  console.log('********** processing for chainID **********', chainID)
  const startBlock = LAST_PROCESSED_BLOCK_BY_CHAINID[chainID]
  const currentBlock = await getCurrentBlock(chainID)
  console.log(
    'Sync status',
    'currentBlock: ' + currentBlock,
    'startBlock: ' + startBlock,
  )

  // make sure we have enough confirmations before we proceed
  const diff = currentBlock - startBlock
  if (diff < constants.CONFIRMATIONS[chainID]) {
    console.log(
      'Waiting for confirmtions, returning will enough blocks are mined',
    )
    console.log(
      'expected conf',
      constants.CONFIRMATIONS[chainID],
      'Actual conf',
      diff,
    )
    return
  }
  console.log('Found enough confirmations to proceed')

  // set last block dependant on diff__size
  let endBlock
  if (diff > process.env.CHUNK_SIZE) {
    console.log('Processing chunk of size', process.env.CHUNK_SIZE)
    endBlock = parseInt(startBlock) + parseInt(process.env.CHUNK_SIZE)
  } else {
    endBlock =
      parseInt(currentBlock) - parseInt(constants.CONFIRMATIONS[chainID])
  }
  console.log('end block set', endBlock)

  // if enough blocks have happend since last sync, lets sync all fund movr events
  const fmContract = new ethers.Contract(
    constants.FM_ADDRESSES[chainID],
    constants.FundMovrABI,
    PROVIDERS[chainID],
  )
  console.log(
    'fetching logs for range',
    'start',
    startBlock,
    'end',
    endBlock,
    'chain',
    chainID,
  )

  // search for all txs that fundmovr has processed
  const logs = await fmContract.queryFilter(
    fmContract.filters.ExecutionCompleted,
    parseInt(startBlock),
    parseInt(endBlock),
  )

  console.log('Logs found', 'count', logs.length, 'chainID', chainID)

  for (const log of logs) {
    if (log.args.bridgeID == constants.HYPHEN_ID[chainID]) {
      console.log(
        'Hyphen tx found, attempting manual execution',
        log.transactionHash,
        'chainID',
        chainID,
      )
      await tryHyphen(chainID, log.transactionHash)
    }
  }

  console.log(
    'Updating last processed block',
    'OldValue',
    LAST_PROCESSED_BLOCK_BY_CHAINID[chainID],
    'NewValue',
    endBlock,
  )
  LAST_PROCESSED_BLOCK_BY_CHAINID[chainID] = endBlock
}

async function tryHyphen(chainID, sourceTxHash) {
  const resp = await axios.post(constants.HYPHEN_PROCESS_TX_URL, {
    depositHash: sourceTxHash,
    fromChainId: chainID,
  })
  resp.data.responseCode ??
    console.log('Found one non exited hyphen transaction', 'tx', sourceTxHash)
  console.log('Response', resp.data)
}

async function getCurrentBlock(chainID) {
  const currentBlock = await PROVIDERS[chainID].getBlock('latest')
  return currentBlock.number
}

cron.schedule('*/1 * * * *', () => {
  main()
})
