import Balance from '@/components/Balance'
import BuyTokens from '@/components/BuyTokens'
import Header from '@/components/Header'
import MintHistory from '@/components/MintHistory'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { MintHistoryItem, fetchMintHistory } from '@/services/blockchain'

export default function Home() {
  const [mintHistory, setMintHistory] = useState<MintHistoryItem[]>([])

  useEffect(() => {
    fetchMintHistory().then((history) => setMintHistory(history))
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
