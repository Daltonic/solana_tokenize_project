import bs58 from 'bs58'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'

let provider: any
let tx: any

export interface TruncateParams {
  text: string
  startChars: number
  endChars: number
  maxLength: number
}

export type MintHistoryItem = {
  receiver: any // Consider specifying a more specific type instead of 'any'
  amount: number
  signature: string
  transactionLink: string
}

if (typeof window !== 'undefined') provider = (window as any).phantom?.solana

const getProvider = (): boolean => {
  return provider?.isPhantom
}

const autoConnect = async (): Promise<string> => {
  if (!provider) {
    reportError('Please install a browser provider')
    throw new Error('Browser provider not installed') // Throwing an error instead of rejecting the promise
  }

  try {
    tx = await provider.connect({ onlyIfTrusted: true })
    return Promise.resolve(tx.publicKey.toString())
  } catch (error) {
    console.error('Failed to auto connect:', error)
    throw error // Rethrow the error to be caught by the caller
  }
}

const getWallet = (): string => {
  return provider.isConnected ? provider.publicKey.toString() : ''
}

const connectWallet = async (): Promise<string> => {
  if (!provider) {
    reportError('Please install a browser provider')
    return Promise.reject(new Error('Browser provider not installed'))
  }

  try {
    tx = await provider.connect()
    return Promise.resolve(tx.publicKey.toString())
  } catch (error) {
    return Promise.reject(error)
  }
}

const fetchMintHistory = async () => {
  const connection = new Connection(clusterApiUrl('devnet'))
  const mintPublicKey = new PublicKey('VngJvuAUsRYnjLLQi3jZzQpFSaFbKCdxBQxinKjA2rL')

  // Fetch transaction signatures
  const signatures = await connection.getSignaturesForAddress(mintPublicKey, { limit: 10 })

  // Filter and fetch transactions
  const transactions = await Promise.all(
    signatures.map(
      async (sig) =>
        await connection.getTransaction(sig.signature, {
          commitment: 'finalized',
          maxSupportedTransactionVersion: 0,
        })
    )
  )

  // Filter for mint transactions
  const mintDetails = transactions
    .map((tx: any) => {
      const message: any = tx?.transaction.message
      const instructions = message.instructions
      const accounts = message.accountKeys
      const signatures = tx?.transaction.signatures || []

      const mintInstruction = instructions.find(
        (instr: any) =>
          accounts[instr.programIdIndex].toString() ===
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' &&
          decodeInstructionType(instr.data) === 'mintTo'
      )

      if (mintInstruction && signatures.length > 0) {
        const receiverIndex = mintInstruction.accounts[1] // Assuming the receiver is the second account in the accounts array
        const receiver = accounts[receiverIndex].toString()
        const amount = decodeAmount(mintInstruction.data)
        const transactionLink = `https://explorer.solana.com/tx/${signatures[0]}?cluster=devnet`

        return { receiver, amount: amount / 100, signature: signatures[0], transactionLink }
      }

      return null
    })
    .filter((detail: any) => detail !== null) as MintHistoryItem[]

  return mintDetails
}

function decodeInstructionType(data: string): string {
  const decodedData = bs58.decode(data)
  const instructionTypeCode = decodedData[0]

  switch (instructionTypeCode) {
    case 7:
      return 'mintTo'
    default:
      return 'unknown'
  }
}

function decodeAmount(data: string): number {
  const decodedData = bs58.decode(data)
  const amount = new DataView(
    decodedData.buffer,
    decodedData.byteOffset,
    decodedData.byteLength
  ).getUint32(1, true)
  return amount
}

const truncate = ({ text, startChars, endChars, maxLength }: TruncateParams): string => {
  if (text.length > maxLength) {
    let start = text.substring(0, startChars)
    let end = text.substring(text.length - endChars, text.length)
    while (start.length + end.length < maxLength) {
      start = start + '.'
    }
    return start + end
  }
  return text
}

export { getProvider, connectWallet, getWallet, truncate, autoConnect, fetchMintHistory }
