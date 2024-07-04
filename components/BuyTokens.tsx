import React, { useState } from 'react'

const BuyTokens = () => {
  const [amount, setAmount] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    console.log(amount)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={amount}
        min="0"
        placeholder={`E.g. 2 DMA token, (${0.03} SOL per token)`}
        required
        onChange={(e) => setAmount(e.target.value)}
        className="mt-1 block w-full py-2 px-3 border border-gray-300
          rounded-md shadow-sm focus:outline-none focus:ring-orange-500
          focus:border-orange-500 sm:text-sm mb-4 "
      />
      <button
        type="submit"
        disabled={!amount || amount === '0'}
        className="w-full flex justify-center py-2 px-4 border
        border-transparent rounded-md shadow-sm text-sm font-medium
        text-white bg-orange-500 hover:bg-orange-700 focus:outline-none
        focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-orange-300"
      >
        Mint Tokens
      </button>
    </form>
  )
}

export default BuyTokens
