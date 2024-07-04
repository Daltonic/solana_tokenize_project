import 'dotenv/config'
import { Keypair, PublicKey } from '@solana/web3.js'
import fs from 'fs'
import path from 'path'

export const TOKEN_OWNER = process.env.NEXT_PUBLIC_TOKEN_OWNER_KEY_PAIR || ''

export const checkOwner = () => {
  if (!TOKEN_OWNER) {
    console.log(`Please provide a TOKEN OWN KEYPAIR`)
    process.exit(1)
  }
}

export const ownerArray = Uint8Array.from(TOKEN_OWNER.split(',').map(Number))
export const OWNER: Keypair = Keypair.fromSecretKey(ownerArray)

export const getTokenMintFromFile = (): PublicKey => {
  const filePath = path.join(__dirname, '../services/tokenMint.json')
  if (!fs.existsSync(filePath)) {
    throw new Error('Token mint file not found')
  }
  const tokenMintString = fs.readFileSync(filePath, 'utf8')
  const tokenMint = JSON.parse(tokenMintString)
  return new PublicKey(tokenMint.address)
}
