import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata'
import { OWNER, checkOwner, getTokenAddress } from './reuse'

checkOwner()

const connection = new Connection(clusterApiUrl('devnet'))

const setupTokenMetadata = async (tokenMint: PublicKey, OWNER: Keypair) => {
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

  const metadataData = {
    name: 'Tokenizer Coin v2',
    symbol: 'TKC',
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

  const signature = await sendAndConfirmTransaction(connection, transaction, [OWNER])
  console.log(`✅ Finished! Created token metadata: ${signature}`)
}

const main = async () => {
  const tokenMint = getTokenAddress()
  await setupTokenMetadata(tokenMint, OWNER)
  console.log(`✅ Metadata setup complete!`)
}

main()
