import React, { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { Keypair, PublicKey } from '@solana/web3.js'
import address from '@/services/tokenMint.json'
import { buyToken } from '@/services/blockchain'

const BuyTokens = () => {
  const [amount, setAmount] = useState('')
  const { connection } = useConnection()
  const { sendTransaction, publicKey } = useWallet()
  const mintCost = 0.02 // solana token

  const TOKEN_OWNER = process.env.NEXT_PUBLIC_TOKEN_OWNER_KEY_PAIR || ''
  const TOKEN_MINT_ADDRESS = address.address || ''

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!connection || !publicKey) return
    if (!TOKEN_MINT_ADDRESS) return console.log(`Please provide a TOKEN MINT ADDRESS`)
    if (!TOKEN_OWNER) return console.log(`Please provide a TOKEN OWN KEYPAIR`)

    const ownerArray = Uint8Array.from(TOKEN_OWNER.split(',').map(Number))
    const OWNER: Keypair = Keypair.fromSecretKey(ownerArray)

    const mintPubKey = new PublicKey(TOKEN_MINT_ADDRESS)
    const recipientPubKey = new PublicKey(publicKey)

    const tx = await buyToken(
      connection,
      mintPubKey,
      OWNER,
      recipientPubKey,
      Number(amount),
      mintCost
    )

    try {
      const signature = await sendTransaction(tx, connection, {
        signers: [OWNER],
      })
      await connection.confirmTransaction(signature, 'confirmed')
      console.log(`Transaction signature: ${signature}`)
    } catch (error) {
      console.error('Transaction failed:', error)
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
          placeholder={`E.g. 2 DMA token, (${mintCost} SOL per token)`}
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
