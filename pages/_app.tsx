import { AppProps } from 'next/app'
import '@/styles/global.css'
import { Provider } from 'react-redux'
import { store } from '@/store'
import AppWalletProvider from '@/components/AppWalletProvider'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AppWalletProvider>
        <Component {...pageProps} />
      </AppWalletProvider>
    </Provider>
  )
}
