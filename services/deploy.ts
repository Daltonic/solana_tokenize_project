import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AuthorityType,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMint,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
} from '@solana/spl-token'
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata'

const TOKEN_OWNER = process.env.NEXT_PUBLIC_TOKEN_OWNER_KEY_PAIR || ''
const TOKEN_MINT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS || ''

if (!TOKEN_MINT_ADDRESS) {
  console.log(`Please provide a TOKEN MINT ADDRESS`)
  process.exit(1)
}

if (!TOKEN_OWNER) {
  console.log(`Please provide a TOKEN OWN KEYPAIR`)
  process.exit(1)
}

const ownerArray = Uint8Array.from(TOKEN_OWNER.split(',').map(Number))
const OWNER: Keypair = Keypair.fromSecretKey(ownerArray)

const connection = new Connection(clusterApiUrl('devnet'))

const createToken = async (): Promise<void> => {
  const tokenMint = await createMint(connection, OWNER, OWNER.publicKey, null, 2)
  console.log(`✅ Finished! Created token mint: ${tokenMint.toString()}`)

  // Write token mint to a file
  const filePath = path.join(__dirname, 'tokenMint.txt')
  fs.writeFileSync(filePath, tokenMint.toString())
  console.log(`✅ Token mint address written to ${filePath}`)
}

const getTokenMintFromFile = (): PublicKey => {
  const filePath = path.join(__dirname, 'tokenMint.txt')
  if (!fs.existsSync(filePath)) {
    throw new Error('Token mint file not found')
  }
  const tokenMintString = fs.readFileSync(filePath, 'utf8')
  return new PublicKey(tokenMintString)
}

const getOrCreateATA = async (tokenMint: PublicKey): Promise<PublicKey> => {
  try {
    const ownerTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      OWNER,
      tokenMint,
      OWNER.publicKey
    )
    console.log(`✅ Finished! Associated token account: ${ownerTokenAccount.address.toString()}`)
    return ownerTokenAccount.address
  } catch (error) {
    console.error('❌ Error creating or fetching associated token account:', error)
    throw error
  }
}

const mintTokensAndDisableMintAuthority = async (
  tokenMint: PublicKey,
  ownerTokenAccountAddress: PublicKey
): Promise<void> => {
  await mintTo(
    connection,
    OWNER,
    tokenMint,
    ownerTokenAccountAddress,
    OWNER.publicKey,
    1000 * 10 ** 2 // 1000 tokens with 2 decimal places
  )

  console.log(`✅ Finished! Minted tokens to owner: ${ownerTokenAccountAddress.toString()}`)

  const signer = await setAuthority(
    connection,
    OWNER,
    tokenMint,
    OWNER.publicKey,
    AuthorityType.MintTokens,
    null
  )

  console.log(`✅ Finished! Set mint authority: ${signer}`)
}

const setupTokenMetadata = async (tokenMint: PublicKey) => {
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

  const metadataData = {
    name: 'Dapp Mentors YouTube',
    symbol: 'DMY',
    // Arweave / IPFS / Pinata etc link using metaplex standard for off-chain data
    uri: 'https://dappmentors.org',
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  }

  const metadataPDAAndBump = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), tokenMint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  )

  console.log(`✅ Finished! Created token metadata: ${metadataPDAAndBump[0].toString()}`)

  const metadataPDA = metadataPDAAndBump[0]
  const transaction = new Transaction()

  const createMetadataAccountInstruction = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: tokenMint,
      mintAuthority: OWNER.publicKey,
      payer: OWNER.publicKey,
      updateAuthority: OWNER.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        collectionDetails: null,
        data: metadataData,
        isMutable: true,
      },
    }
  )

  transaction.add(createMetadataAccountInstruction)

  const transactionSignature = await sendAndConfirmTransaction(connection, transaction, [OWNER])
  console.log(`✅ Finished! Created token metadata: ${transactionSignature}`)
}

const main = async () => {
  //   step 1
  //   await createToken()
  const tokenMint = getTokenMintFromFile()

  //   step 2
  const ata = await getOrCreateATA(tokenMint)

  //   step 3
  //   await setupTokenMetadata(tokenMint)

  //   step 4
  await mintTokensAndDisableMintAuthority(tokenMint, ata)
  console.log(`✅ Finished! Deployment complete!`)
}

main()
