let provider: any
let tx: any

interface TruncateParams {
  text: string
  startChars: number
  endChars: number
  maxLength: number
}

if (typeof window !== 'undefined') provider = (window as any).phantom?.solana

const getProvider = (): boolean => {
  return provider?.isPhantom
}

const autoConnect = async (): Promise<string> => {
  if (!provider) {
    reportError('Please install a browser provider')
    throw new Error('Browser provider not installed') // Throwing an error instead of rejecting the promise
  }

  try {
    tx = await provider.connect({ onlyIfTrusted: true })
    return Promise.resolve(tx.publicKey.toString())
  } catch (error) {
    console.error('Failed to auto connect:', error)
    throw error // Rethrow the error to be caught by the caller
  }
}

const getWallet = (): string => {
  return provider.isConnected ? provider.publicKey.toString() : ''
}

const connectWallet = async (): Promise<string> => {
  if (!provider) {
    reportError('Please install a browser provider')
    return Promise.reject(new Error('Browser provider not installed'))
  }

  try {
    tx = await provider.connect()
    return Promise.resolve(tx.publicKey.toString())
  } catch (error) {
    return Promise.reject(error)
  }
}

const truncate = ({ text, startChars, endChars, maxLength }: TruncateParams): string => {
  if (text.length > maxLength) {
    let start = text.substring(0, startChars)
    let end = text.substring(text.length - endChars, text.length)
    while (start.length + end.length < maxLength) {
      start = start + '.'
    }
    return start + end
  }
  return text
}

export { getProvider, connectWallet, getWallet, truncate, autoConnect }
