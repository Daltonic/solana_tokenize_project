import bs58 from 'bs58'
import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js'
import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  mintTo,
} from '@solana/spl-token'

let provider: any
let tx: any
let hasProvider: boolean

const TOKEN_OWNER = process.env.NEXT_PUBLIC_TOKEN_OWNER_KEY_PAIR || ''
const TOKEN_MINT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS || ''

if (!TOKEN_OWNER) {
  console.log(`Please provide a TOKEN OWNER KEYPAIR`)
}

if (!TOKEN_MINT_ADDRESS) {
  console.log(`Please provide a TOKEN MINT ADDRESS`)
}

const ownerArray = Uint8Array.from(TOKEN_OWNER.split(',').map(Number))
const OWNER: Keypair = Keypair.fromSecretKey(ownerArray)

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

if (typeof window !== 'undefined') {
  provider = (window as any).phantom?.solana
  hasProvider = true
} else {
  provider = null
  hasProvider = false
}

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
    console.error('Connection attempt failed:', error)
    return Promise.resolve('')
  }
}

const changeAccount = async () => {
  await provider.on('accountChanged', (publicKey: PublicKey) => {
    if (publicKey) {
      console.log(`Switched to account ${publicKey.toBase58()}`)
    }
  })
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

const mintToken = async (amount: number) => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
  const mintPublicKey = new PublicKey(TOKEN_MINT_ADDRESS)

  const ata = await getAssociatedTokenAddress(mintPublicKey, provider.publicKey)
  const ataInfo = await connection.getAccountInfo(ata)

  if (!ataInfo) {
    const transactions = []
    let tx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        provider.publicKey, // Payer
        ata, // ATA address
        provider.publicKey, // Owner
        mintPublicKey // Mint
      )
    )
    transactions.push(tx)

    tx = new Transaction().add(
      createMintToInstruction(mintPublicKey, ata, OWNER.publicKey, amount * Math.pow(10, 2))
    )

    transactions.push(tx)

    const blockhash = (await connection.getLatestBlockhash('finalized')).blockhash
    tx.recentBlockhash = blockhash
    tx.feePayer = provider.publicKey

    try {
      const { signatures } = await provider.signAndSendAllTransactions(transactions)
      await connection.getSignatureStatuses(signatures)
      console.log('Transactions completed:', signatures)
    } catch (error) {
      console.error('Transactions failed:', error)
    }
  } else {
    // Create a new transaction
    tx = new Transaction().add(
      createMintToInstruction(mintPublicKey, ata, OWNER.publicKey, amount * Math.pow(10, 2))
    )

    const blockhash = (await connection.getLatestBlockhash('finalized')).blockhash
    tx.recentBlockhash = blockhash
    tx.feePayer = provider.publicKey

    try {
      // Sign the transaction
      const signedTransaction = await provider.signTransaction(tx)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      await connection.confirmTransaction(signature)
      console.log('Transaction successful with signature:', signature)
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }
}

const fetchMintHistory = async () => {
  const connection = new Connection(clusterApiUrl('devnet'))
  const mintPublicKey = new PublicKey(TOKEN_MINT_ADDRESS)

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

export {
  getProvider,
  connectWallet,
  getWallet,
  truncate,
  autoConnect,
  fetchMintHistory,
  mintToken,
  hasProvider,
}
