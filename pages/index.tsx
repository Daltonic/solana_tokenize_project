import Balance from '@/components/Balance'
import BuyTokens from '@/components/BuyTokens'
import Header from '@/components/Header'
import MintHistory from '@/components/MintHistory'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { fetchMintHistory } from '@/services/blockchain'
import address from '@/services/tokenMint.json'
import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import { MintHistoryItem } from '@/utils/types.dt'

export default function Home() {
  const { connection } = useConnection()
  const [mintHistory, setMintHistory] = useState<MintHistoryItem[]>([])
  const TOKEN_MINT_ADDRESS = new PublicKey(address.address) || ''

  useEffect(() => {
    fetchMintHistory(connection, TOKEN_MINT_ADDRESS).then((history) => setMintHistory(history))
  }, [])

  return (
    <>
      <Head>
        <title>Tokenize</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="h-screen bg-gray-100">
        <Header />

        <div className="h-[100px]" />

        <main className="max-w-lg mx-auto p-4 space-y-4">
          <BuyTokens />
          <Balance />
          <MintHistory mintHistory={mintHistory} />
        </main>
      </div>
    </>
  )
}
