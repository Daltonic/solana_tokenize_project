import Balance from '@/components/Balance'
import BuyTokens from '@/components/BuyTokens'
import Header from '@/components/Header'
import MintHistory from '@/components/MintHistory'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { RootState } from '@/utils/types.dt'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlice'
import data from '@/utils/data.json'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const { mintHistory, balance } = useSelector((states: RootState) => states.globalStates)
  const dispatch = useDispatch()
  const { setMintHistory, setBalance } = globalActions

  useEffect(() => {
    fetchData()
  }, [dispatch, setMintHistory])

  const fetchData = async () => {
    const history = data
    dispatch(setMintHistory(history))

    const balance = 0
    dispatch(setBalance(balance))
    setIsLoading(false)
  }

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
          <Balance balance={balance} />
          <MintHistory mintHistory={mintHistory} />
        </main>
      </div>
    </>
  )
}
