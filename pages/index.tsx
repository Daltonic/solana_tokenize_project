import Header from '@/components/Header'
import Head from 'next/head'
export default function Home() {
  return (
    <>
      <Head>
        <title>Tokenize</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="h-screen bg-gray-100">
        <Header />
        <main className="max-w-md mx-auto p-4"></main>
      </div>
    </>
  )
}
