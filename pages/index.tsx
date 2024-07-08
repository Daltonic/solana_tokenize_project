import Balance from '@/components/Balance'
import BuyTokens from '@/components/BuyTokens'
import Header from '@/components/Header'
import MintHistory from '@/components/MintHistory'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import address from '@/services/tokenMint.json'
import { fetchSalesHistory, getTokenBalance } from '@/services/blockchain'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Keypair, PublicKey } from '@solana/web3.js'
import { RootState } from '@/utils/types.dt'
import Skeleton from 'react-loading-skeleton'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlice'

export default function Home() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const dispatch = useDispatch()
  const { setSalesHistory, setBalance } = globalActions

  const TOKEN_MINT_ADDRESS = new PublicKey(address.address) || ''
  const TOKEN_OWNER = process.env.NEXT_PUBLIC_TOKEN_OWNER_KEY_PAIR || ''

  const ownerArray = Uint8Array.from(TOKEN_OWNER.split(',').map(Number))
  const OWNER: Keypair = Keypair.fromSecretKey(ownerArray)

  const [isLoading, setIsLoading] = useState(true)
  const { salesHistory, balance } = useSelector((states: RootState) => states.globalStates)

  useEffect(() => {
    fetchData()
  }, [dispatch, setBalance, publicKey])

  const fetchData = async () => {
    const history = await fetchSalesHistory(connection, OWNER.publicKey)
    dispatch(setSalesHistory(history))

    if (publicKey) {
      const balance = await getTokenBalance(connection, TOKEN_MINT_ADDRESS, publicKey)
      dispatch(setBalance(balance))
    }
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
          {isLoading ? <Skeleton height={70} className="mb-2" /> : <Balance balance={balance} />}
          {isLoading ? <Skeleton count={5} /> : <MintHistory mintHistory={salesHistory} />}
        </main>
      </div>
    </>
  )
}
