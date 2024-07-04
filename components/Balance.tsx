import React, { useState } from 'react'
import Identicon from 'react-identicons'

const Balance = ({ balance }: { balance: number }) => {

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 w-full flex items-center justify-start space-x-4">
      <div className="rounded-full shadow-sm overflow-hidden inline-block">
        <Identicon string="random-string" size={40} />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-gray-700">Token Balance</h1>
        <p className="text-gray-600 text-md">{balance} DMA Tokens</p>
      </div>
    </div>
  )
}

export default Balance
