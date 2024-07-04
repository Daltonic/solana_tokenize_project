import { truncate } from '@/services/blockchain'
import { MintHistoryItem } from '@/utils/types.dt'
import Link from 'next/link'
import { FaExternalLinkAlt } from 'react-icons/fa'

const MintHistory = ({ mintHistory }: { mintHistory: MintHistoryItem[] }) => {
  return (
    <div>
      <h1 className="text-lg font-bold text-gray-700">Recently Purchased</h1>
      <ul className="mt-2 text-gray-500">
        {mintHistory.map((minter, i) => (
          <li key={i} className="mb-2 flex justify-between items-center">
            <div className="text-sm">
              <Link
                href={minter.addressLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:text-orange-500"
              >
                {truncate({ text: minter.receiver, startChars: 4, endChars: 4, maxLength: 11 })}
              </Link>{' '}
              - <span>{minter.amount} DMA</span>
            </div>

            <Link
              href={minter.transactionLink}
              target="_blank"
              rel="noopener noreferrer"
              className=" hover:text-orange-500"
            >
              <FaExternalLinkAlt size={12} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MintHistory
