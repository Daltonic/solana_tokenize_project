import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { AuthorityType, setAuthority } from '@solana/spl-token'
import { OWNER, checkOwner, getTokenAddress } from './reuse'

checkOwner()

const connection = new Connection(clusterApiUrl('devnet'))

const disableMintAuthority = async (tokenMint: PublicKey, OWNER: Keypair): Promise<void> => {
  const signature = await setAuthority(
    connection,
    OWNER,
    tokenMint,
    OWNER.publicKey,
    AuthorityType.MintTokens,
    null
  )

  console.log(`✅ Finished! Set mint authority: ${signature}`)
}

const main = async () => {
  const tokenMint = getTokenAddress()
  await disableMintAuthority(tokenMint, OWNER)
  console.log(`✅ Mint Authority disabled!`)
}

main()
