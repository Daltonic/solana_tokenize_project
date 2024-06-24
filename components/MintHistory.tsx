import { MintHistoryItem, truncate } from '@/services/blockchain'
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

const MintHistory = ({ mintHistory }: { mintHistory: MintHistoryItem[] }) => {
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
        {mintHistory.map((minter, i) => (
          <li key={i} className="mb-2 flex justify-between items-center">
            <div className="text-sm">
              <span className="font-bold">
                {truncate({ text: minter.receiver, startChars: 4, endChars: 4, maxLength: 11 })}
              </span>{' '}
              - <span>{minter.amount} DMA</span>
            </div>

            <Link href={minter.transactionLink} target="_blank" rel="noopener noreferrer">
              <FaExternalLinkAlt size={12} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MintHistory
