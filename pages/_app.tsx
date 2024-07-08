import { AppProps } from 'next/app'
import '@/styles/global.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-loading-skeleton/dist/skeleton.css'
import { ToastContainer } from 'react-toastify'
import AppWalletProvider from '@/components/AppWalletProvider'
import { Provider } from 'react-redux'
import { store } from '@/store'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AppWalletProvider>
        <Component {...pageProps} />
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AppWalletProvider>
    </Provider>
  )
}
