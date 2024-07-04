import bs58 from 'bs58'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { MintHistoryItem, TruncateParams } from '@/utils/types.dt'



const buyToken = async (
  connection: Connection,
  mintPubKey: PublicKey,
  OWNER: Keypair,
  recipientPubKey: PublicKey,
  amount: number,
  mintCost: number
): Promise<Transaction> => {
  const transaction = new Transaction()
  transaction.feePayer = recipientPubKey

  const receiverATA = await getAssociatedTokenAddress(
    mintPubKey,
    recipientPubKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )

  const senderATA = await getAssociatedTokenAddress(
    mintPubKey,
    OWNER.publicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )

  transaction.add(addSolTransferInstruction(recipientPubKey, OWNER.publicKey, amount, mintCost))

  const accountInfo = await connection.getAccountInfo(receiverATA)
  if (!accountInfo) {
    console.log(`Will include fee for creating ${receiverATA.toBase58()} ATA`)
    transaction.add(addCreateATAInstruction(recipientPubKey, receiverATA, mintPubKey))
  }

  transaction.add(addTokenTransferInstruction(senderATA, receiverATA, OWNER.publicKey, amount))

  return transaction
}

const addSolTransferInstruction = (
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  amount: number,
  mintCost: number
) => {
  const solTransferInstruction = SystemProgram.transfer({
    fromPubkey,
    toPubkey,
    lamports: mintCost * amount * LAMPORTS_PER_SOL,
  })
  return solTransferInstruction
}

const addCreateATAInstruction = (
  payer: PublicKey,
  ataAddress: PublicKey,
  mintPubKey: PublicKey
) => {
  const createATAInstruction = createAssociatedTokenAccountInstruction(
    payer,
    ataAddress,
    payer,
    mintPubKey
  )
  return createATAInstruction
}

const addTokenTransferInstruction = (
  senderATA: PublicKey,
  receiverATA: PublicKey,
  ownerPubKey: PublicKey,
  amount: number
) => {
  const transferInstruction = createTransferInstruction(
    senderATA,
    receiverATA,
    ownerPubKey,
    amount * Math.pow(10, 2),
    [],
    TOKEN_PROGRAM_ID
  )
  return transferInstruction
}

const fetchMintHistory = async (connection: Connection, mintPublicKey: PublicKey) => {
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

      const relevantInstruction = instructions.find(
        (instr: any) =>
          accounts[instr.programIdIndex].toString() ===
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' &&
          ['mintTo', 'transfer'].includes(decodeInstructionType(instr.data))
      )

      if (relevantInstruction && signatures.length > 0) {
        const receiverIndex = relevantInstruction.accounts[1] // Assuming the receiver is the second account in the accounts array
        const receiver = accounts[receiverIndex].toString()
        const amount = decodeAmount(relevantInstruction.data)
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
    case 3:
      return 'transfer'
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

export { truncate, fetchMintHistory, buyToken }
