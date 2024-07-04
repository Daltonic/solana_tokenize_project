import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { AuthorityType, setAuthority } from '@solana/spl-token'
import { OWNER, getTokenMintFromFile } from './reused'

const connection = new Connection(clusterApiUrl('devnet'))

const disableMintAuthority = async (tokenMint: PublicKey, OWNER: Keypair): Promise<void> => {
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

const main = async () => {
  const tokenMint = getTokenMintFromFile()
  await disableMintAuthority(tokenMint, OWNER)
  console.log(`✅ Mint Authority disabled!`)
}

main()
