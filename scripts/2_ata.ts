import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token'
import { OWNER, getTokenMintFromFile } from './reused'

const connection = new Connection(clusterApiUrl('devnet'))

const getOrCreateATA = async (tokenMint: PublicKey): Promise<PublicKey> => {
  const maxRetries = 30
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      console.log(`Attempt ${attempt + 1} to get or create ATA for token mint: ${tokenMint.toString()}`)
      const ownerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        OWNER,
        tokenMint,
        OWNER.publicKey
      )
      console.log(`✅ Finished! Associated token account: ${ownerTokenAccount.address.toString()}`)
      return ownerTokenAccount.address
    } catch (error) {
      console.error(`❌ Error creating or fetching associated token account on attempt ${attempt + 1}:`, error)
      attempt++
      if (attempt >= maxRetries) {
        console.error('❌ Max retries reached. Throwing error.')
        throw error
      }
      console.log('Retrying...')
    }
  }
  throw new Error('Failed to get or create associated token account after maximum retries')
}

const main = async () => {
  const tokenMint = getTokenMintFromFile()
  const ata = await getOrCreateATA(tokenMint)
  console.log(`✅ Associated token account: ${ata}`)
}

main()
