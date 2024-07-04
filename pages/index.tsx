import Balance from '@/components/Balance'
import BuyTokens from '@/components/BuyTokens'
import Header from '@/components/Header'
import MintHistory from '@/components/MintHistory'
import Skeleton from 'react-loading-skeleton'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { fetchMintHistory, getTokenBalance } from '@/services/blockchain'
import address from '@/services/tokenMint.json'
import { Keypair, PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { RootState } from '@/utils/types.dt'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlice'

export default function Home() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [isLoading, setIsLoading] = useState(true)

  const TOKEN_MINT_ADDRESS = new PublicKey(address.address) || ''
  const TOKEN_OWNER = process.env.NEXT_PUBLIC_TOKEN_OWNER_KEY_PAIR || ''

  const ownerArray = Uint8Array.from(TOKEN_OWNER.split(',').map(Number))
  const OWNER: Keypair = Keypair.fromSecretKey(ownerArray)

  const { mintHistory, balance } = useSelector((states: RootState) => states.globalStates)
  const dispatch = useDispatch()
  const { setMintHistory, setBalance } = globalActions

  useEffect(() => {
    const fetchData = async () => {
      const history = await fetchMintHistory(connection, publicKey || OWNER.publicKey)
      dispatch(setMintHistory(history))
      if (publicKey) {
        const balance = await getTokenBalance(connection, TOKEN_MINT_ADDRESS, publicKey)
        dispatch(setBalance(balance))
      }
      setIsLoading(false)
    }

    fetchData()
  }, [dispatch, setMintHistory, publicKey])

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
          {isLoading ? <Skeleton count={5} /> : <MintHistory mintHistory={mintHistory} />}
        </main>
      </div>
    </>
  )
}
