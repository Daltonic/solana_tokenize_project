import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { FaExternalLinkAlt } from 'react-icons/fa'

// Define a type for the minter data
type Minter = {
  id: number
  account: string
}

// Mock function to simulate fetching minters
const fetchMinters = async (): Promise<Minter[]> => {
  // This should be replaced with actual Solana blockchain fetching logic
  return [
    { id: 1, account: 'Account1' },
    { id: 2, account: 'Account2' },
    { id: 3, account: 'Account3' },
  ]
}

const MintHistory = () => {
  const [minters, setMinters] = useState<Minter[]>([])

  useEffect(() => {
    const getMinters = async () => {
      const mintersData = await fetchMinters()
      setMinters(mintersData)
    }

    getMinters()
  }, [])

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-700">Recently Minted</h1>
      <ul className="mt-2 text-gray-500">
        {minters.map((minter) => (
          <li key={minter.id} className="mb-2 flex justify-between items-center">
            <span>{minter.account} - 100 tokens</span>
            <Link
              href="https://explorer.solana.com/address/DummyLink"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaExternalLinkAlt />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MintHistory
