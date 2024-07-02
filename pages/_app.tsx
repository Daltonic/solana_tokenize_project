import { AppProps } from 'next/app'
import '@/styles/global.css'
import AppWalletProvider from '@/components/AppWalletProvider'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppWalletProvider>
      <Component {...pageProps} />
    </AppWalletProvider>
  )
}
