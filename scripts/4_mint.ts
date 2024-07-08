import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { OWNER, checkOwner, getTokenAddress } from './reuse'

checkOwner()

const connection = new Connection(clusterApiUrl('devnet'))

const mintTokens = async (tokenMint: PublicKey, OWNER: Keypair): Promise<void> => {
  const ownerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    OWNER,
    tokenMint,
    OWNER.publicKey
  )

  const signature = await mintTo(
    connection,
    OWNER,
    tokenMint,
    ownerTokenAccount.address,
    OWNER.publicKey,
    1000 * Math.pow(10, 2) // 1000 tokens with 2 decimal places
  )

  console.log(`✅ Finished! Token mint complete: ${signature}`)
}

const main = async () => {
  const tokenMint = getTokenAddress()
  await mintTokens(tokenMint, OWNER)
  console.log(`✅ Token mint complete!`)
}

main()
