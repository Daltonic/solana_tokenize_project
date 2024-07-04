import Balance from '@/components/Balance'
import BuyTokens from '@/components/BuyTokens'
import Header from '@/components/Header'
import MintHistory from '@/components/MintHistory'
import Head from 'next/head'
import { useEffect } from 'react'
import { fetchMintHistory, getTokenBalance } from '@/services/blockchain'
import address from '@/services/tokenMint.json'
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { RootState } from '@/utils/types.dt'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlice'

export default function Home() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const TOKEN_MINT_ADDRESS = new PublicKey(address.address) || ''

  const { mintHistory, balance } = useSelector((states: RootState) => states.globalStates)
  const dispatch = useDispatch()
  const { setMintHistory, setBalance } = globalActions

  useEffect(() => {
    const fetchData = async () => {
      const history = await fetchMintHistory(connection, TOKEN_MINT_ADDRESS)
      dispatch(setMintHistory(history))
      if (publicKey) {
        const balance = await getTokenBalance(connection, TOKEN_MINT_ADDRESS, publicKey)
        dispatch(setBalance(balance))
      }
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
          <Balance balance={balance} />
          {mintHistory.length > 0 && <MintHistory mintHistory={mintHistory} />}
        </main>
      </div>
    </>
  )
}
