import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { getTokenMintFromFile, OWNER } from './reused'

const connection = new Connection(clusterApiUrl('devnet'))

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

const mintTokens = async (
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
}

const main = async () => {
  const tokenMint = getTokenMintFromFile()
  const ata = await getOrCreateATA(tokenMint)
  await mintTokens(tokenMint, ata)

  console.log(`✅ Token mint complete!`)
}

main()
