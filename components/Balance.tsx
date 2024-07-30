import { useWallet } from '@solana/wallet-adapter-react'
import Identicon from 'react-identicons'

const Balance = ({ balance }: { balance: number }) => {
  const { publicKey } = useWallet()

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 w-full flex items-center justify-start space-x-4">
      <div className="rounded-full shadow-sm overflow-hidden inline-block">
        <Identicon string={publicKey?.toString() || ''} size={40} />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-gray-700">Current Balance</h1>
        <p className="text-gray-600 text-md">{balance} TKC Tokens</p>
      </div>
    </div>
  )
}

export default Balance
