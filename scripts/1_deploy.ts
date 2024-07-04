import fs from 'fs'
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js'
import { createMint } from '@solana/spl-token'
import { OWNER, checkOwner, getTokenMintFromFile } from './reused'

checkOwner()

const connection = new Connection(clusterApiUrl('devnet'))

const createToken = async (OWNER: Keypair): Promise<void> => {
  const tokenMint = await createMint(connection, OWNER, OWNER.publicKey, null, 2)
  console.log(`✅ Finished! Created token mint: ${tokenMint.toString()}`)

  // Write token mint to a file
  const address = JSON.stringify(
    {
      address: tokenMint.toString(),
    },
    null,
    4
  )

  fs.writeFile('./services/tokenMint.json', address, 'utf8', (error) => {
    if (error) {
      console.error('Error saving tokenMint address:', error)
    } else {
      console.log('Deployed tokenMint address:', address)
    }
  })
}

const main = async () => {
  await createToken(OWNER)

  setTimeout(() => {
    try {
      const tokenMint = getTokenMintFromFile()
      console.log(`✅ Finished! Deployment complete!`, tokenMint)
    } catch (error) {
      console.error('Error reading token mint file:', error)
    }
  }, 1000)
}

main()
