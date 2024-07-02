import React, { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'

const BuyTokens = () => {
  const [amount, setAmount] = useState('')
  const { connection } = useConnection()
  const { sendTransaction, publicKey } = useWallet()

  const TOKEN_OWNER = process.env.NEXT_PUBLIC_TOKEN_OWNER_KEY_PAIR || ''
  const TOKEN_MINT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS || ''

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!connection || !publicKey) return
    if (!TOKEN_MINT_ADDRESS) return console.log(`Please provide a TOKEN MINT ADDRESS`)
    if (!TOKEN_OWNER) return console.log(`Please provide a TOKEN OWN KEYPAIR`)

    const ownerArray = Uint8Array.from(TOKEN_OWNER.split(',').map(Number))
    const OWNER: Keypair = Keypair.fromSecretKey(ownerArray)

    const transaction = new Transaction()
    transaction.feePayer = publicKey

    const mintPubKey = new PublicKey(TOKEN_MINT_ADDRESS)
    const recipientPubKey = new PublicKey(publicKey)
    const associatedToken = await getAssociatedTokenAddress(
      mintPubKey,
      recipientPubKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const accountInfo = await connection.getAccountInfo(associatedToken)
    if (!accountInfo) {
      console.log(`Associated token account does not exist for ${associatedToken.toBase58()}`)
      // Create the associated token account if it doesn't exist
      const createATAInstruction = createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintPubKey,
        associatedToken,
        recipientPubKey,
        publicKey
      )
      transaction.add(createATAInstruction)
    }

    const mintToInstruction = createMintToInstruction(
      mintPubKey,
      associatedToken,
      OWNER.publicKey,
      Number(amount) * Math.pow(10, 2)
    )

    transaction.add(mintToInstruction)

    try {
      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')
      console.log(`Transaction signature: ${signature}`)
    } catch (error) {
      console.error('Transaction failed:', error)
      // Log additional details for debugging
      console.error('Transaction details:', {
        transaction: transaction.serializeMessage().toString('base64'),
        mintPubKey: mintPubKey.toBase58(),
        associatedToken: associatedToken.toBase58(),
        ownerPublicKey: OWNER.publicKey.toBase58(),
        recipientPublicKey: recipientPubKey.toBase58(),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium">
          Amount:
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          min="0"
          placeholder="Enter the amount of tokens to buy"
          required
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Mint Tokens
      </button>
    </form>
  )
}

export default BuyTokens
