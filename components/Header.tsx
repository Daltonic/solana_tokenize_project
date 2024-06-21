import { autoConnect, connectWallet, getProvider, getWallet, truncate } from '@/services/blockchain'
import { useEffect, useState } from 'react'

const Header = () => {
  const [hasProvided, setStatus] = useState(false)
  const [wallet, setWallet] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const provider = getProvider()
      await autoConnect()
      setStatus(provider)
      setWallet(getWallet())
    }

    fetchData()
  }, [])

  const onConnect = async () => {
    const key = await connectWallet()
    setWallet(key)
  }

  return (
    <header className="p-4 bg-gray-800 mb-4">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <p className="text-white">Tokenized</p>
        {hasProvided && !wallet && (
          <button
            onClick={onConnect}
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
          >
            Connect Wallet
          </button>
        )}

        {hasProvided && wallet && (
          <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
            {truncate({ text: wallet, startChars: 4, endChars: 4, maxLength: 11 })}
          </button>
        )}

        {!hasProvided && (
          <button
            onClick={() => window.open('https://phantom.app/', '_blank')}
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
          >
            Install Phantom
          </button>
        )}
      </nav>
    </header>
  )
}

export default Header
