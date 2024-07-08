import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { Keypair, PublicKey } from '@solana/web3.js'

export const TOKEN_OWNER = process.env.NEXT_PUBLIC_TOKEN_OWNER_KEY_PAIR || ''

export const checkOwner = () => {
  if (!TOKEN_OWNER) {
    console.log(`Please provide a TOKEN OWN KEYPAIR`)
    process.exit(1)
  }
}

const ownerArray = Uint8Array.from(TOKEN_OWNER.split(',').map(Number))
export const OWNER: Keypair = Keypair.fromSecretKey(ownerArray)

export const getTokenAddress = (): PublicKey => {
  const filePath = path.join(__dirname, '../services/tokenMint.json')
  if (!fs.existsSync(filePath)) {
    throw new Error('Token mint file not found')
  }

  const tokenMintString = fs.readFileSync(filePath, 'utf8')
  const tokenMint = JSON.parse(tokenMintString)
  return new PublicKey(tokenMint.address)
}
