import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

const keypair = Keypair.generate()
const privateKeyBase58 = bs58.encode(keypair.secretKey)

console.log(`The public key is: `, keypair.publicKey.toBase58())
console.log(`The secret key is: `, keypair.secretKey)
console.log(`The private key is: `, privateKeyBase58)